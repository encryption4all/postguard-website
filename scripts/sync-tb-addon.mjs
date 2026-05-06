#!/usr/bin/env node
// Sync the latest postguard-tb-addon release into static/downloads/.
//
// 1. Query the GitHub API for the latest release.
// 2. Locate the .xpi asset and read its sha256 digest from the API response.
// 3. Compare against the cached digest in static/downloads/postguard-tb-addon.json.
// 4. If unchanged, exit 0 with no file changes.
// 5. Otherwise download, verify the sha256 matches, and write the .xpi + metadata.

import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = 'encryption4all/postguard-tb-addon'
const ASSET_PATTERN = /\.xpi$/i

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const downloadsDir = resolve(projectRoot, 'static/downloads')
const xpiPath = resolve(downloadsDir, 'postguard-tb-addon.xpi')
const metaPath = resolve(downloadsDir, 'postguard-tb-addon.json')

async function fetchJson(url) {
    const headers = {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'postguard-website-sync',
    }
    if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
    }
    const res = await fetch(url, { headers })
    if (!res.ok) {
        throw new Error(`GET ${url} failed: ${res.status} ${res.statusText}`)
    }
    return res.json()
}

async function readCached() {
    try {
        return JSON.parse(await readFile(metaPath, 'utf8'))
    } catch (err) {
        if (err.code === 'ENOENT') return null
        throw err
    }
}

function parseSha256(digest) {
    if (typeof digest !== 'string' || !digest.startsWith('sha256:')) return null
    return digest.slice('sha256:'.length).toLowerCase()
}

async function main() {
    const release = await fetchJson(
        `https://api.github.com/repos/${REPO}/releases/latest`
    )
    const asset = release.assets?.find((a) => ASSET_PATTERN.test(a.name))
    if (!asset) {
        throw new Error(`no .xpi asset found in release ${release.tag_name}`)
    }
    const remoteSha = parseSha256(asset.digest)
    if (!remoteSha) {
        throw new Error(
            `asset ${asset.name} has no sha256 digest in API response`
        )
    }

    const cached = await readCached()
    if (cached?.sha256 === remoteSha) {
        console.log(`up-to-date: ${cached.tag} (sha256 ${remoteSha})`)
        return
    }
    console.log(`updating: ${cached?.tag ?? '(none)'} -> ${release.tag_name}`)

    const dl = await fetch(asset.browser_download_url, {
        headers: { 'User-Agent': 'postguard-website-sync' },
        redirect: 'follow',
    })
    if (!dl.ok) {
        throw new Error(`download failed: ${dl.status} ${dl.statusText}`)
    }
    const buf = Buffer.from(await dl.arrayBuffer())

    const localSha = createHash('sha256').update(buf).digest('hex')
    if (localSha !== remoteSha) {
        throw new Error(
            `sha256 mismatch for ${asset.name}: api=${remoteSha} downloaded=${localSha}`
        )
    }

    await mkdir(downloadsDir, { recursive: true })
    await writeFile(xpiPath, buf)
    await writeFile(
        metaPath,
        JSON.stringify(
            {
                tag: release.tag_name,
                assetName: asset.name,
                sha256: localSha,
                size: buf.length,
                publishedAt: release.published_at,
                sourceUrl: asset.browser_download_url,
                releaseUrl: release.html_url,
            },
            null,
            2
        ) + '\n'
    )
    console.log(`wrote ${xpiPath} (${buf.length} bytes)`)
    console.log(`wrote ${metaPath}`)
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
