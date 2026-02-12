# PostGuard Website

The PostGuard web frontend for encrypting and sending files using [Yivi](https://yivi.app)-based identity attributes. Built with SvelteKit.

## Quick Start with Docker Compose (Recommended)

The easiest way to get started is using Docker Compose, which sets up everything you need:

### Development Environment (with hot reload)

```bash
# Start all services (cryptify, mailcrab, and postguard)
docker-compose -f docker-compose.dev.yml up

# Access the app at http://localhost:5173
# Mailcrab UI at http://localhost:1080
```

Your code changes will automatically reload! The source code is mounted as a volume.

### Production Environment

```bash
# Build and start all services
docker-compose up --build

# Access the app at http://localhost
```

### Stopping Services

```bash
# Development
docker-compose -f docker-compose.dev.yml down

# Production
docker-compose down
```

## Manual Development Setup

If you prefer to run the services manually without Docker:

### Prerequisites

- [Node.js](https://nodejs.org/) v20 or higher
- [Docker](https://www.docker.com/) (for running dependencies)
- A running [Cryptify](https://github.com/encryption4all/cryptify) backend

### Setup

1. **Start dependencies** (Cryptify backend, PKG service, and Mailcrab):

```bash
# Start just the backend services
docker-compose -f docker-compose.dev.yml up cryptify-backend postguard-pkg mailcrab
```

2. **Install dependencies and configure**:

```bash
npm install
cp .env.example .env
# Edit .env if needed - defaults point to localhost services
```

3. **Run the development server**:

```bash
npm run dev
```

Access the app at `http://localhost:5173`

## Developing Individual Services

If you need to develop or modify a specific service (cryptify, pkg, etc.):

1. **Comment out the service** in `docker-compose.dev.yml`
2. **Run your local version** on the same port
3. **Continue developing** - no other changes needed!

### Example: Developing Cryptify Locally

```bash
# 1. Comment out cryptify-backend in docker-compose.dev.yml

# 2. Clone and run cryptify locally
git clone https://github.com/encryption4all/cryptify.git
cd cryptify
cargo run  # Runs on localhost:8000 by default

# 3. Start other services
cd ../postguard-website
docker-compose -f docker-compose.dev.yml up postguard-pkg mailcrab postguard-website
```

The PostGuard app will connect to your local Cryptify instance on `localhost:8000`.

### Example: Developing PKG Service Locally

```bash
# 1. Comment out postguard-pkg in docker-compose.dev.yml

# 2. Clone and run postguard locally
git clone https://github.com/encryption4all/postguard.git
cd postguard
cargo run  # Runs on localhost:8087 by default

# 3. Start other services
cd ../postguard-website
docker-compose -f docker-compose.dev.yml up cryptify-backend mailcrab postguard-website
```

The PostGuard app will connect to your local PKG instance on `localhost:8087`.

## Mobile Debugging

To test on a physical Android device over USB:

```bash
npm run dev -- --host
adb reverse tcp:5173 tcp:5173
adb reverse tcp:8000 tcp:8000
```

Port 5173 is the dev server, port 8000 is for the Cryptify backend. Then open `http://localhost:5173` in the phone's browser.

## Building

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview
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
