// backend/routes/seo.routes.js
const router = require("express").Router();
const Vehicle = require("../models/Vehicle.model");

// Generate sitemap
router.get("/sitemap.xml", async (req, res) => {
  try {
    const vehicles = await Vehicle.find({
      status: "aktiv",
      verificationStatus: "genehmigt",
    }).select("slug updatedAt");

    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    // Static pages
    const staticPages = [
      { url: "/", priority: 1.0, changefreq: "daily" },
      { url: "/fahrzeuge", priority: 0.9, changefreq: "daily" },
      { url: "/uber-uns", priority: 0.7, changefreq: "weekly" },
      { url: "/kontakt", priority: 0.7, changefreq: "monthly" },
      { url: "/datenschutz", priority: 0.5, changefreq: "monthly" },
      { url: "/impressum", priority: 0.5, changefreq: "monthly" },
    ];

    staticPages.forEach((page) => {
      sitemap += "<url>";
      sitemap += `<loc>${process.env.FRONTEND_URL}${page.url}</loc>`;
      sitemap += `<lastmod>${new Date().toISOString()}</lastmod>`;
      sitemap += `<changefreq>${page.changefreq}</changefreq>`;
      sitemap += `<priority>${page.priority}</priority>`;
      sitemap += "</url>";
    });

    // Vehicle pages
    vehicles.forEach((vehicle) => {
      sitemap += "<url>";
      sitemap += `<loc>${process.env.FRONTEND_URL}/fahrzeuge/${vehicle.slug}</loc>`;
      sitemap += `<lastmod>${vehicle.updatedAt.toISOString()}</lastmod>`;
      sitemap += "<changefreq>weekly</changefreq>";
      sitemap += "<priority>0.8</priority>";
      sitemap += "</url>";
    });

    sitemap += "</urlset>";

    res.header("Content-Type", "application/xml");
    res.send(sitemap);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).send("Error generating sitemap");
  }
});

// Robots.txt
router.get("/robots.txt", (req, res) => {
  const robots = `User-agent: *
Disallow: /api/
Disallow: /admin/
Disallow: /agent/
Disallow: /dashboard/
Disallow: /checkout/
Disallow: /payment/
Allow: /

Sitemap: ${process.env.FRONTEND_URL}/api/seo/sitemap.xml`;

  res.header("Content-Type", "text/plain");
  res.send(robots);
});

// Schema.org structured data
router.get("/schema/:type/:id", async (req, res) => {
  try {
    const { type, id } = req.params;

    if (type === "vehicle") {
      const vehicle = await Vehicle.findById(id).populate(
        "owner",
        "agentProfile.companyName"
      );

      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }

      const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: vehicle.name,
        description: vehicle.description.long,
        image: vehicle.images.map((img) => img.url),
        brand: {
          "@type": "Brand",
          name: vehicle.technicalData.brand,
        },
        offers: {
          "@type": "Offer",
          price: vehicle.pricing.basePrice.perDay,
          priceCurrency: "EUR",
          availability: vehicle.availability.isAvailable
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          seller: {
            "@type": "Organization",
            name: vehicle.owner.agentProfile?.companyName || "WohnmobilTraum",
          },
        },
        aggregateRating:
          vehicle.statistics.rating.count > 0
            ? {
                "@type": "AggregateRating",
                ratingValue: vehicle.statistics.rating.average,
                reviewCount: vehicle.statistics.rating.count,
              }
            : undefined,
      };

      res.json(schema);
    } else {
      res.status(400).json({ error: "Invalid type" });
    }
  } catch (error) {
    console.error("Schema generation error:", error);
    res.status(500).json({ error: "Error generating schema" });
  }
});

module.exports = router;
