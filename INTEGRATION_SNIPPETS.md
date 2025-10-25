# Quick Integration Code Snippets

## 1. AdminDashboardPage.jsx - Imports Section (Add to top of file)

```jsx
import NotificationsPanel from '../../components/admin/NotificationsPanel';
import PendingVehicles from '../../components/admin/PendingVehicles';
```

## 2. AdminDashboardPage.jsx - Add to Sidebar Navigation

Find the sidebar navigation section (around line 1583-1619) and add this AFTER the "Fahrzeuge" item:

```jsx
<SidebarItem
  icon={FiAlertCircle}
  label="Ausstehend"
  active={activeSection === "pending-vehicles"}
  onClick={() => setActiveSection("pending-vehicles")}
  collapsed={false}
  badge={stats.pendingVehicles || 0}
/>
```

## 3. AdminDashboardPage.jsx - Add NotificationsPanel to Header

Find the header section with the search bar (around line 1440-1480) and add NotificationsPanel near the user profile section:

```jsx
{/* Inside the header div, before the user profile/avatar */}
<div className="flex items-center gap-4">
  <NotificationsPanel />
  {/* Your existing user profile code */}
</div>
```

## 4. AdminDashboardPage.jsx - Render Pending Vehicles Section

Find where the main content sections are rendered (look for `{activeSection === "dashboard" && ...}` pattern). Add this with the other sections:

```jsx
{activeSection === "pending-vehicles" && (
  <div className="p-8">
    <PendingVehicles />
  </div>
)}
```

## 5. AdminDashboardPage.jsx - Update Stats to Include Pending Count

In the `fetchDashboardData` function, update the Promise.all to include pending vehicles:

**FIND THIS (around line 917-921):**
```jsx
const [statsRes, usersRes, vehiclesRes] = await Promise.all([
  api.get("/api/admin/dashboard/stats"),
  api.get("/api/admin/users"),
  api.get("/api/admin/vehicles"), // Admin vehicles endpoint
]);
```

**REPLACE WITH:**
```jsx
const [statsRes, usersRes, vehiclesRes, pendingVehiclesRes] = await Promise.all([
  api.get("/api/admin/dashboard/stats"),
  api.get("/api/admin/users"),
  api.get("/api/admin/vehicles"),
  api.get("/api/admin/vehicles/pending"),
]);
```

**THEN FIND THIS (around line 937-944):**
```jsx
setStats({
  totalUsers: usersData.length,
  totalVehicles: vehiclesData.length,
  totalBookings: apiStats.totalBookings || 0,
  monthlyRevenue: revenueData.monthly || 0,
  activeBookings: apiStats.activeBookings || 0,
  pendingApprovals: apiStats.pendingReviews || 0,
});
```

**REPLACE WITH:**
```jsx
setStats({
  totalUsers: usersData.length,
  totalVehicles: vehiclesData.length,
  totalBookings: apiStats.totalBookings || 0,
  monthlyRevenue: revenueData.monthly || 0,
  activeBookings: apiStats.activeBookings || 0,
  pendingApprovals: apiStats.pendingReviews || 0,
  pendingVehicles: pendingVehiclesRes.data?.data?.count || 0,
});
```

## 6. AdminDashboardPage.jsx - Initialize Stats with pendingVehicles

Find the initial stats state declaration (around line 869-876):

**FIND THIS:**
```jsx
const [stats, setStats] = useState({
  totalUsers: 0,
  totalVehicles: 0,
  totalBookings: 0,
  monthlyRevenue: 0,
  activeBookings: 0,
  pendingApprovals: 0,
});
```

**REPLACE WITH:**
```jsx
const [stats, setStats] = useState({
  totalUsers: 0,
  totalVehicles: 0,
  totalBookings: 0,
  monthlyRevenue: 0,
  activeBookings: 0,
  pendingApprovals: 0,
  pendingVehicles: 0,
});
```

---

## 7. Agent Dashboard Integration (When you're ready)

Create a new file: `frontend/src/components/agent/AgentVehiclesList.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { Badge, Button, Card, Spinner } from 'flowbite-react';
import toast from 'react-hot-toast';

const AgentVehiclesList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5005'}/api/agent/vehicles`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setVehicles(data.data.vehicles);
      }
    } catch (error) {
      toast.error('Fehler beim Laden der Fahrzeuge');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'genehmigt':
        return <Badge color="success">Genehmigt</Badge>;
      case 'ausstehend':
        return <Badge color="warning">Ausstehend</Badge>;
      case 'abgelehnt':
        return <Badge color="failure">Abgelehnt</Badge>;
      default:
        return <Badge color="gray">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Spinner size="xl" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Meine Fahrzeuge ({vehicles.length})</h2>
        <Button onClick={() => {/* Open create vehicle modal */}}>
          Neues Fahrzeug hinzufügen
        </Button>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Noch keine Fahrzeuge</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {vehicles.map((vehicle) => (
            <Card key={vehicle._id}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">{vehicle.name}</h3>
                  <p className="text-sm text-gray-500">{vehicle.category}</p>
                </div>
                {getStatusBadge(vehicle.verificationStatus)}
              </div>
              {vehicle.verificationStatus === 'ausstehend' && (
                <p className="text-sm text-yellow-600 mt-2">
                  Ihr Fahrzeug wartet auf die Genehmigung des Administrators
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentVehiclesList;
```

---

## Testing the Integration

### Test as Admin:

1. **View Notifications:**
   ```
   1. Login as admin
   2. Look for bell icon in header (should show count if there are notifications)
   3. Click bell icon to see dropdown
   ```

2. **View Pending Vehicles:**
   ```
   1. Click "Ausstehend" in sidebar
   2. Should see list of pending vehicles
   3. Try approving one (green button)
   4. Try rejecting one (red button - requires reason)
   ```

### Test as Agent:

1. **Create Vehicle:**
   ```
   Use existing admin vehicle form or create agent form
   POST to /api/vehicles
   Should return success with message about waiting for approval
   ```

2. **Check if Admin Notified:**
   ```
   Switch to admin account
   Should see toast notification popup
   Bell icon should show +1 in badge
   Pending vehicles count should increase
   ```

### Test Real-time Flow:

1. Open two browser windows:
   - Window 1: Logged in as agent
   - Window 2: Logged in as admin

2. Agent creates vehicle in Window 1
3. Admin should immediately see notification in Window 2 (toast popup)
4. Admin approves/rejects
5. Agent should see notification in Window 1

---

## Verification Checklist

After integration, verify:

- [ ] Admin dashboard has bell icon with notifications
- [ ] Admin sidebar has "Ausstehend" menu item with badge
- [ ] Clicking "Ausstehend" shows PendingVehicles component
- [ ] Pending vehicles display correctly with all details
- [ ] Approve button works and sends notification to agent
- [ ] Reject button works and deletes vehicle
- [ ] Socket.io connection established (check browser console)
- [ ] Real-time notifications appear as toasts
- [ ] Badge counts update dynamically

---

## Common Issues & Solutions

**Issue:** Notifications don't appear in real-time
- **Solution:** Check Socket.io connection in browser console. Ensure backend server is running and Socket.io is initialized.

**Issue:** Bell icon doesn't show
- **Solution:** Verify NotificationsPanel is imported and added to header. Check for console errors.

**Issue:** Pending count always shows 0
- **Solution:** Ensure `pendingVehicles` is added to stats state and fetchDashboardData includes the API call.

**Issue:** Agent can't create vehicles
- **Solution:** Verify user has role "agent" and permissions include "canCreateVehicle".

**Issue:** Rejected vehicles still appear
- **Solution:** The rejection correctly deletes vehicles. If they still appear, the frontend list might not be refreshing. Check the PendingVehicles component removes items from state after rejection.

---

That's it! Follow these snippets in order and you'll have a fully functional agent mode with real-time admin approval system.
