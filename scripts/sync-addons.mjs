#!/usr/bin/env node
// Sync PostGuard addon release artifacts into static/downloads/.
//
// For each target:
//   1. Query the GitHub API for the latest release.
//   2. Locate the matching asset and read its sha256 digest from the API response.
//   3. Compare against the cached digest in the sibling .json file.
//   4. If unchanged, skip with no file changes.
//   5. Otherwise download, verify the sha256 matches, and write the asset + metadata.

import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const downloadsDir = resolve(projectRoot, 'static/downloads')

const TARGETS = [
    {
        name: 'thunderbird',
        repo: 'encryption4all/postguard-tb-addon',
        assetPattern: /\.xpi$/i,
        outputFile: 'postguard-tb-addon.xpi',
        metaFile: 'postguard-tb-addon.json',
    },
    {
        name: 'outlook',
        repo: 'encryption4all/postguard-outlook-addon',
        assetPattern: /^manifest\.xml$/i,
        outputFile: 'postguard-outlook-manifest.xml',
        metaFile: 'postguard-outlook-manifest.json',
    },
]

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

async function readCached(metaPath) {
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

async function syncTarget(target) {
    const outputPath = resolve(downloadsDir, target.outputFile)
    const metaPath = resolve(downloadsDir, target.metaFile)

    const release = await fetchJson(
        `https://api.github.com/repos/${target.repo}/releases/latest`
    )
    const asset = release.assets?.find((a) => target.assetPattern.test(a.name))
    if (!asset) {
        throw new Error(
            `[${target.name}] no asset matching ${target.assetPattern} in release ${release.tag_name}`
        )
    }
    const remoteSha = parseSha256(asset.digest)
    if (!remoteSha) {
        throw new Error(
            `[${target.name}] asset ${asset.name} has no sha256 digest in API response`
        )
    }

    const cached = await readCached(metaPath)
    if (cached?.sha256 === remoteSha) {
        console.log(
            `[${target.name}] up-to-date: ${cached.tag} (sha256 ${remoteSha})`
        )
        return
    }
    console.log(
        `[${target.name}] updating: ${cached?.tag ?? '(none)'} -> ${release.tag_name}`
    )

    const dl = await fetch(asset.browser_download_url, {
        headers: { 'User-Agent': 'postguard-website-sync' },
        redirect: 'follow',
    })
    if (!dl.ok) {
        throw new Error(
            `[${target.name}] download failed: ${dl.status} ${dl.statusText}`
        )
    }
    const buf = Buffer.from(await dl.arrayBuffer())

    const localSha = createHash('sha256').update(buf).digest('hex')
    if (localSha !== remoteSha) {
        throw new Error(
            `[${target.name}] sha256 mismatch for ${asset.name}: api=${remoteSha} downloaded=${localSha}`
        )
    }

    await mkdir(downloadsDir, { recursive: true })
    await writeFile(outputPath, buf)
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
    console.log(`[${target.name}] wrote ${outputPath} (${buf.length} bytes)`)
    console.log(`[${target.name}] wrote ${metaPath}`)
}

async function main() {
    let failed = false
    for (const target of TARGETS) {
        try {
            await syncTarget(target)
        } catch (err) {
            failed = true
            console.error(err)
        }
    }
    if (failed) process.exit(1)
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
