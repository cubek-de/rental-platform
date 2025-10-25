const Notification = require('../models/Notification.model');

// @desc    Get all notifications for current user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { recipient: req.user._id };

    // Filter by read status
    if (req.query.read !== undefined) {
      query.read = req.query.read === 'true';
    }

    // Filter by type
    if (req.query.type) {
      query.type = req.query.type;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'firstName lastName email')
      .populate('relatedVehicle', 'name slug')
      .populate('relatedBooking', 'bookingNumber');

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        unreadCount,
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abrufen der Benachrichtigungen',
    });
  }
};

// @desc    Get unread notifications count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abrufen der ungelesenen Benachrichtigungen',
    });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Benachrichtigung nicht gefunden',
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Markieren der Benachrichtigung',
    });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/mark-all-read
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: 'Alle Benachrichtigungen als gelesen markiert',
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Markieren der Benachrichtigungen',
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Benachrichtigung nicht gefunden',
      });
    }

    res.json({
      success: true,
      message: 'Benachrichtigung gelöscht',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Löschen der Benachrichtigung',
    });
  }
};

// Helper function to create and emit notification
exports.createNotification = async (data, io) => {
  try {
    const notification = await Notification.create(data);

    // Populate fields for the response
    await notification.populate('sender', 'firstName lastName email');
    await notification.populate('relatedVehicle', 'name slug');
    await notification.populate('relatedBooking', 'bookingNumber');

    // Emit real-time notification via Socket.io
    if (io) {
      // Send to specific user
      io.to(`user:${notification.recipient}`).emit('notification', {
        type: 'new_notification',
        data: notification,
      });

      // If it's an admin notification, also send to admin room
      if (data.type === 'vehicle_pending') {
        io.to('admins').emit('notification', {
          type: 'new_notification',
          data: notification,
        });
      }
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};
