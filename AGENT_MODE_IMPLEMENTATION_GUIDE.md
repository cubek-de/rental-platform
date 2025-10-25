# Agent Mode Implementation Guide

## Overview
This guide shows how to complete the agent mode vehicle management feature with real-time admin approval/rejection notifications.

## ✅ Completed Backend Features

### 1. Socket.io Real-time System
- **File**: `api/server.js` (lines 344-404)
- Real-time WebSocket connections with JWT authentication
- Admins automatically join "admins" room for notifications

### 2. Notification System
- **Model**: `api/models/Notification.model.js`
- **Controller**: `api/controllers/notification.controller.js`
- **Routes**: `api/routes/notification.routes.js`
- API Endpoints:
  - `GET /api/notifications` - Get user notifications (paginated)
  - `GET /api/notifications/unread-count` - Get unread count
  - `PATCH /api/notifications/:id/read` - Mark notification as read
  - `PATCH /api/notifications/mark-all-read` - Mark all as read
  - `DELETE /api/notifications/:id` - Delete notification

### 3. Vehicle Workflow
- **File**: `api/controllers/vehicle.controller.js` (lines 197-228)
- Agents create vehicles → status = "ausstehend" (pending)
- Admins create vehicles → status = "genehmigt" (approved) immediately
- Real-time notifications sent to all admins when agent submits

### 4. Admin Approval/Rejection
- **File**: `api/controllers/admin.controller.js` (lines 671-784, 352-374)
- **Endpoint**: `PATCH /api/admin/vehicles/:id/verify`
- **Body**: `{ status: "genehmigt" | "abgelehnt", notes: "optional reason" }`

**Approval Flow**:
1. Admin approves → Vehicle status = "genehmigt"
2. Vehicle appears in public listings
3. Agent receives approval notification
4. Vehicle ready for bookings

**Rejection Flow**:
1. Admin rejects → Vehicle is **DELETED** from database
2. Vehicle removed from agent's profile
3. Agent receives rejection notification with reason
4. Vehicle no longer exists in system

- **Pending Vehicles Endpoint**: `GET /api/admin/vehicles/pending`

## ✅ Completed Frontend Features

### 1. Socket.io Context
- **File**: `frontend/src/context/SocketContext.jsx`
- Manages WebSocket connection
- Shows toast notifications for new events
- Provides: `notifications`, `unreadCount`, `markAsRead()`, `markAllAsRead()`, `deleteNotification()`

### 2. Notifications Panel
- **File**: `frontend/src/components/admin/NotificationsPanel.jsx`
- Bell icon with badge showing unread count
- Dropdown with notification list
- Click notification → mark as read & navigate to action

### 3. Pending Vehicles Component
- **File**: `frontend/src/components/admin/PendingVehicles.jsx`
- Shows all pending vehicles in cards
- Approve/Reject buttons
- Confirmation modals with notes/reason input

## 🔧 Required Manual Integration Steps

### Step 1: Add NotificationsPanel to Admin Dashboard Header

In `frontend/src/pages/admin/AdminDashboardPage.jsx`, add the import at the top:

```jsx
import NotificationsPanel from '../../components/admin/NotificationsPanel';
```

Find the header section (around line 1400-1500) where the search bar and user menu are located, and add the NotificationsPanel:

```jsx
{/* Add this before the user dropdown/avatar */}
<div className="flex items-center space-x-4">
  <NotificationsPanel />
  {/* Existing user menu code here */}
</div>
```

### Step 2: Add "Pending Vehicles" to Sidebar Navigation

In the same file, find the sidebar navigation (around line 1591-1605) and add a new menu item:

```jsx
<SidebarItem
  icon={FiAlertCircle}
  label="Ausstehend"
  active={activeSection === "pending-vehicles"}
  onClick={() => setActiveSection("pending-vehicles")}
  collapsed={false}
  badge={stats.pendingVehicles || 0}  // You'll need to add this to stats
/>
```

### Step 3: Import and Render Pending Vehicles Component

Add the import:
```jsx
import PendingVehicles from '../../components/admin/PendingVehicles';
```

In the main content area rendering (around line 1650-2000), add a new section:

```jsx
{activeSection === "pending-vehicles" && <PendingVehicles />}
```

### Step 4: Add Pending Count to Dashboard Stats

In the `fetchDashboardData` function (around line 912-945), add:

```jsx
// Inside the api calls, add a new endpoint call for pending vehicles
const [statsRes, usersRes, vehiclesRes, pendingVehiclesRes] = await Promise.all([
  api.get("/api/admin/dashboard/stats"),
  api.get("/api/admin/users"),
  api.get("/api/admin/vehicles"),
  api.get("/api/admin/vehicles/pending"),  // Add this
]);

// In the stats update
setStats({
  totalUsers: usersData.length,
  totalVehicles: vehiclesData.length,
  totalBookings: apiStats.totalBookings || 0,
  monthlyRevenue: revenueData.monthly || 0,
  activeBookings: apiStats.activeBookings || 0,
  pendingApprovals: apiStats.pendingReviews || 0,
  pendingVehicles: pendingVehiclesRes.data?.data?.count || 0,  // Add this
});
```

## 🚗 Agent Vehicle Management (To Be Created)

### Step 5: Create Agent Vehicle Form Component

You need to create `frontend/src/components/agent/AgentVehicleForm.jsx` that:
- Copies the admin vehicle form fields
- Includes all required fields: name, category, brand, model, year, etc.
- Has image upload functionality (using `/api/admin/upload-vehicle-image`)
- Submits to `POST /api/vehicles` (this already creates with "ausstehend" status for agents)
- Shows success message: "Vehicle submitted for admin approval"

### Step 6: Add to Agent Dashboard

In `frontend/src/pages/agent/AgentDashboardPage.jsx`:

1. Add a "My Vehicles" section
2. Fetch agent's vehicles: `GET /api/agent/vehicles`
3. Display vehicles with status badges:
   - 🟡 "Ausstehend" (pending) - yellow badge
   - ✅ "Genehmigt" (approved) - green badge
4. Add button to open vehicle form modal
5. Show vehicle stats and status

## 📋 Testing Checklist

1. **Agent Creates Vehicle**:
   - [ ] Agent fills vehicle form
   - [ ] Vehicle saves with status "ausstehend"
   - [ ] Admin receives real-time notification (toast popup)
   - [ ] Admin sees notification in bell icon dropdown
   - [ ] Pending count badge updates

2. **Admin Approves Vehicle**:
   - [ ] Admin clicks "Approve" in pending vehicles
   - [ ] Can add optional notes
   - [ ] Vehicle status changes to "genehmigt"
   - [ ] Vehicle appears in public listings
   - [ ] Agent receives approval notification
   - [ ] Pending count decreases

3. **Admin Rejects Vehicle**:
   - [ ] Admin clicks "Reject" in pending vehicles
   - [ ] Must enter rejection reason
   - [ ] Vehicle is deleted from database
   - [ ] Vehicle removed from agent profile
   - [ ] Agent receives rejection notification with reason
   - [ ] Pending count decreases

## 🔑 Key API Endpoints Reference

### For Agents:
- `POST /api/vehicles` - Create vehicle (auto status: "ausstehend")
- `GET /api/agent/vehicles` - Get agent's vehicles
- `PUT /api/vehicles/:id` - Update own vehicle
- `DELETE /api/vehicles/:id` - Delete own vehicle

### For Admins:
- `GET /api/admin/vehicles/pending` - Get all pending vehicles
- `PATCH /api/admin/vehicles/:id/verify` - Approve/reject vehicle
- `GET /api/admin/vehicles` - Get all vehicles (with optional ?verificationStatus=ausstehend)

### Notifications:
- `GET /api/notifications` - Get notifications (paginated)
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/mark-all-read` - Mark all as read

## 🎨 UI Components Available

- `NotificationsPanel` - Bell icon with dropdown
- `PendingVehicles` - Full page component for admin
- `SocketContext` - Access via `useSocket()` hook

## 💡 Usage Examples

### Access notifications in any component:
```jsx
import { useSocket } from '../../context/SocketContext';

function MyComponent() {
  const { notifications, unreadCount, markAsRead } = useSocket();

  return (
    <div>
      Unread: {unreadCount}
      {notifications.map(notif => (
        <div key={notif._id} onClick={() => markAsRead(notif._id)}>
          {notif.message}
        </div>
      ))}
    </div>
  );
}
```

### Manually send a notification (backend):
```javascript
const { createNotification } = require('./notification.controller');

await createNotification({
  recipient: userId,
  sender: req.user._id,
  type: 'vehicle_pending',
  title: 'New Vehicle',
  message: 'A new vehicle needs approval',
  relatedVehicle: vehicleId,
  actionUrl: '/admin/pending-vehicles'
}, req.app.get('io'));
```

## ⚠️ Important Notes

1. **Socket.io must be running** - Ensure server is started and Socket.io is initialized
2. **Authentication required** - All notifications endpoints require valid JWT token
3. **Agent role** - User must have role "agent" to create vehicles with pending status
4. **Admin role** - User must have role "admin" to approve/reject vehicles
5. **Vehicle deletion** - Rejected vehicles are PERMANENTLY deleted, not just marked inactive

## 🐛 Debugging

If notifications don't appear:
1. Check browser console for Socket.io connection errors
2. Verify token is passed in Socket.io auth
3. Check server logs for Socket.io connections
4. Ensure user role is correct (admin/agent)
5. Check network tab for WebSocket frames

## 📱 Environment Variables

Make sure these are set in `.env`:
```
VITE_API_URL=http://localhost:5005  # Frontend .env
```

Backend should have:
```
JWT_SECRET=your_secret
FRONTEND_URL=http://localhost:5173
```

---

## Quick Start

1. Start backend: `cd api && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Login as agent → Create vehicle → See it in pending
4. Login as admin → Go to "Ausstehend" tab → Approve/Reject
5. Check notifications bell icon for real-time updates

The system is now ready for agent mode vehicle management with full real-time approval workflow!
