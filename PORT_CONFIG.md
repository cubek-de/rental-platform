# Port Configuration Guide

## Frontend Port Configuration

The frontend is now configured to always run on port **5173**.

### Changes Made:

1. **Vite Configuration** (`vite.config.js`):

   - Set `server.port: 5173`
   - Set `server.strictPort: true` (exits if port is in use)
   - Set `server.host: true` (listen on all addresses)

2. **Backend Environment** (`.env`):

   - Updated `FRONTEND_URL=http://localhost:5173`

3. **Package.json Scripts**:
   - Added `dev:force` script to kill any process on port 5173 before starting

### How to Start Development:

**Option 1: Standard start (will fail if port is in use)**

```bash
cd frontend
npm run dev
```

**Option 2: Force start (kills any process on port 5173 first)**

```bash
cd frontend
npm run dev:force
```

**Option 3: Use the shell script**

```bash
cd frontend
./start-dev.sh
```

### Email Verification Links:

All email verification links will now point to:

```
http://localhost:5173/verify-email/{token}
```

### If Port 5173 is Still in Use:

1. Check what's using the port:

   ```bash
   lsof -i :5173
   ```

2. Kill the process:

   ```bash
   kill -9 <PID>
   ```

3. Or use the force script:
   ```bash
   npm run dev:force
   ```
