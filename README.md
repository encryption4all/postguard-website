# PostGuard Website

The PostGuard web frontend for encrypting and sending files using [Yivi](https://yivi.app)-based identity attributes. Built with SvelteKit.

## Quick Start with Docker Compose (Recommended)

The easiest way to get started is using Docker Compose, which sets up everything you need:

### Development Environment (with hot reload)

```bash
# Start all services (cryptify, mailcrab, and postguard)
git submodule update --init --recursive
docker-compose up

# Postguard website at http://localhost:5173
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
adb reverse tcp:5173 tcp:5173
```

## Environment Variables

Key environment variables in `.env`:

- `VITE_FILEHOST_URL` - Filehosting service URL, uses Cryptify (default: `http://localhost:8000`)
- `VITE_PKG_URL` - PKG service URL (default: `http://localhost:8087`)
- `VITE_MAX_UPLOAD_SIZE` - Maximum file upload size in bytes
- `VITE_UPLOAD_CHUNK_SIZE` - Upload chunk size in bytes
- `VITE_FILEREAD_CHUNK_SIZE` - File read chunk size in bytes

## Architecture

The PostGuard website consists of four main components:

1. **PostGuard Frontend** (this repo) - SvelteKit app for the UI
2. **Cryptify Backend** (port 8000) - Handles file encryption/decryption with Yivi attributes
3. **PKG Service** (port 8087) - PostGuard backend service from [encryption4all/postguard](https://github.com/encryption4all/postguard)
4. **Mailcrab** (ports 1080, 1025) - Email testing tool for development

## Troubleshooting

### Port Already in Use

If you get port conflicts, check what's using the ports:

```bash
# Check ports 5173, 8000, 8087, 1080, 1025
lsof -i :5173
lsof -i :8000
lsof -i :8087

# Stop conflicting services or change ports in docker-compose files
```

### Backend Connection Errors

Make sure the backend services are running and accessible:

```bash
# Check Cryptify backend
curl http://localhost:8000/health

# Check PKG service
curl http://localhost:8087/health
```

If using Docker, check the service status:

```bash
docker-compose -f docker-compose.dev.yml ps
docker-compose -f docker-compose.dev.yml logs cryptify-backend
docker-compose -f docker-compose.dev.yml logs postguard-pkg
```
