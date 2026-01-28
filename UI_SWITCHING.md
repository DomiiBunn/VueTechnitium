# UI Switching - Legacy vs New Vue.js Frontend

This document explains how the UI switching system works between the legacy jQuery-based UI and the new Vue.js frontend.

## Architecture

### File Structure

- `DnsServerCore/www/` - Legacy UI files (jQuery-based)
- `DnsServerCore/www-new/` - New UI files (Vue.js, built from frontend/)
- `frontend/` - Vue.js source code for the new UI

### Build Process

The DnsServerCore project includes two automatic build targets:

1. **BuildFrontend** - Runs before the main build
   - Installs dependencies: `npm install`
   - Builds the Vue.js frontend: `npm run build`
   - Outputs to `frontend/dist/`

2. **CopyFrontendDist** - Runs after BuildFrontend
   - Copies built frontend files from `frontend/dist/` to `DnsServerCore/www-new/`

### Building the Project

To build the entire project with the frontend:

```bash
cd /root/technitium/DnsServer
dotnet build
# or
dotnet publish
```

The build process will automatically:

1. Build the Vue.js frontend
2. Copy the dist files to `www-new/`
3. Build the C# project with both UIs embedded

## UI Switching Mechanism

### Cookie-Based Selection

Users can switch between UIs using the `ui-version` cookie:

- `ui-version=legacy` - Serves files from `www/` (default)
- `ui-version=new` - Serves files from `www-new/`

### API Endpoints

#### Get Current UI Preference

```http
GET /api/ui/preference
```

**Response:**

```json
{
  "uiVersion": "legacy"
}
```

#### Set UI Preference

```http
POST /api/ui/preference?version=new
```

or with form data:

```
version=new
```

**Response:**

```json
{
  "status": "success",
  "uiVersion": "new"
}
```

### Middleware Flow

1. **WebServiceUISwitchingMiddleware** - Handles `/api/ui/preference` endpoint
2. **Static Files Middleware** - Serves from `www/` (primary)
3. **Additional Static Files Middleware** - Serves from `www-new/` (fallback)
4. **WebServiceUIRoutingMiddleware** - Routes navigation requests to correct `index.html`

### Fallback Behavior

- If `ui-version=new` is set but `www-new/` directory doesn't exist, falls back to legacy UI
- If a file doesn't exist in the preferred UI, the system attempts to find it in the other
- The legacy UI (`www/`) is always available as the default fallback

## Frontend Development

### Development Mode

While developing the Vue.js frontend:

```bash
cd /root/technitium/DnsServer/frontend
npm install
npm run serve
```

This starts a local development server at `http://localhost:8080`

### Building for Production

```bash
cd /root/technitium/DnsServer/frontend
npm run build
```

The built files will be in `frontend/dist/`

### Production Integration

When building the entire DnsServer project, the frontend build is automatic:

```bash
cd /root/technitium/DnsServer
dotnet build  # or dotnet publish
```

This will:

1. Build the frontend (if nodejs/npm available)
2. Copy to `www-new/`
3. Include both UIs in the published output

## Cookie Settings

The `ui-version` cookie is configured with:

- **HttpOnly**: `true` - Not accessible via JavaScript (security)
- **SameSite**: `Strict` - CSRF protection
- **Expires**: 1 year from set

## Testing UI Switching

### Browser DevTools Method

1. Open DevTools (F12)
2. Go to Application > Cookies
3. Add/edit `ui-version` cookie to `"new"` or `"legacy"`
4. Refresh the page

### API Method

```bash
# Switch to new UI
curl -X POST "http://localhost:5380/api/ui/preference?version=new"

# Get current preference
curl "http://localhost:5380/api/ui/preference"
```

## Notes

- The new UI requires all dependencies from `package.json` to be installed before building
- If npm is not installed on the build machine, the frontend build will fail (can be optional with `ContinueOnError=true`)
- Both UIs share the same API backend
- User sessions and authentication are shared between both UIs
- All API endpoints work identically regardless of which UI is active

## Future Enhancements

- Store UI preference in user profile database (persist across sessions)
- Add UI switcher control in both UIs
- Theme customization per UI
- Progressive migration of features from legacy to new UI
