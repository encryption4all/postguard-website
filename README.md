# PostGuard Website

The PostGuard web frontend for encrypting and sending files using [Yivi](https://yivi.app)-based identity attributes. Built with SvelteKit.

## Quick Start with Docker Compose (Recommended)

The easiest way to get started is using Docker Compose, which sets up everything you need:

### Development Environment (with hot reload)

```bash
# Start all services (cryptify, mailcrab, and postguard)
git submodule update --init --recursive
docker-compose up

# Connect phone with USB debugging enabled, Yivi app in developer mode, then:
adb reverse tcp:8088 tcp:8088 

# Postguard website at http://localhost:8080
# Mailcrab UI at http://localhost:1080


# Also launches IRMA server, Cryptify fileshare server and PKG server
```

Your code changes will automatically reload! The source code is mounted as a volume.

### Production Environment

```bash
# Build and start all services from prebuild images
docker-compose -f docker-compose.prod.yml up

# Access the app at http://localhost
```

### Stopping Services

```bash
# Development
docker-compose down

# Production
docker-compose -f docker-compose.prod.yml down
```

## Mobile Debugging

To test on a physical Android device over USB (make sure Yivi is in [developer mode](https://docs.yivi.app/yivi-app/#developer-mode) )

```bash
adb reverse tcp:8088 tcp:8088 # to scan QR codes / irma server
adb reverse tcp:8080 tcp:8080 # to visit the mobile postguard site
```

## Building
Building is done automatically through Github Actions. Building manually can be done through docker-compose. Building only the Postguard website can be done with npm/yarn.

```bash
docker-compose build
npm run build
```

## Environment Variables
- `VITE_FILEHOST_URL` - Filehosting service URL, uses Cryptify (default: `http://localhost:8000`)
- `VITE_PKG_URL` - PKG service URL (default: `http://localhost:8087`)
- `VITE_MAX_UPLOAD_SIZE` - Maximum file upload size in bytes
- `VITE_UPLOAD_CHUNK_SIZE` - Upload chunk size in bytes
- `VITE_FILEREAD_CHUNK_SIZE` - File read chunk size in bytes

