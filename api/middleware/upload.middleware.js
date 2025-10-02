// backend/middleware/upload.middleware.js
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = "wohnmobil";

    if (file.fieldname === "avatar") {
      folder = "wohnmobil/avatars";
    } else if (file.fieldname === "vehicle") {
      folder = "wohnmobil/vehicles";
    } else if (file.fieldname === "document") {
      folder = "wohnmobil/documents";
    }

    return {
      folder: folder,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [
        { width: 1920, height: 1080, crop: "limit", quality: "auto:best" },
      ],
      public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    };
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Ungültiges Dateiformat. Nur JPEG, PNG und WebP sind erlaubt"),
      false
    );
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10,
  },
});

// Export middleware
const uploadSingle = upload.single("image");
const uploadMultiple = upload.array("images", 10);
const uploadFields = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "images", maxCount: 10 },
  { name: "documents", maxCount: 5 },
]);

// Process uploaded images
const processImages = async (req, res, next) => {
  try {
    if (req.files && req.files.images) {
      req.body.images = req.files.images.map((file) => ({
        url: file.path,
        cloudinaryId: file.filename,
        isMain: false,
      }));

      // Set first image as main if no main image exists
      if (req.body.images.length > 0) {
        req.body.images[0].isMain = true;
      }
    }

    if (req.file) {
      req.body.imageUrl = req.file.path;
      req.body.imageCloudinaryId = req.file.filename;
    }

    next();
  } catch (error) {
    console.error("Process images error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Verarbeiten der Bilder",
    });
  }
};

// Delete image from Cloudinary
const deleteImage = async (cloudinaryId) => {
  try {
    await cloudinary.uploader.destroy(cloudinaryId);
    return true;
  } catch (error) {
    console.error("Delete image error:", error);
    return false;
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  processImages,
  deleteImage,
  uploadImages: [uploadMultiple, processImages],
};
