# PostGuard Website

The PostGuard web frontend for encrypting and sending files using [Yivi](https://yivi.app)-based identity attributes. Built with SvelteKit.

## Prerequisites

- [Node.js](https://nodejs.org/)
- A running [Cryptify](https://github.com/nickt/cryptify) backend (otherwise you'll end up on the "error occurred" page)

## Developing

Install dependencies and create a `.env` file based on `.env.example`. Make sure the chunk size matches your Cryptify backend configuration.

```bash
npm install
cp .env.example .env
npm run dev
```

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
npm run build
npm run preview  # preview the production build
```
