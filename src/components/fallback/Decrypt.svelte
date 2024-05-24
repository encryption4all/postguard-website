<script>
    // imports

    import { tick, onMount } from 'svelte'

    // Yivi
    import YiviCore from '@privacybydesign/yivi-core'
    import YiviClient from '@privacybydesign/yivi-client'
    import YiviWeb from '@privacybydesign/yivi-web'
    import '@privacybydesign/yivi-css'

    // extra
    import jwt_decode from 'jwt-decode'

    // stores
    import {
        currSelected,
        currentId,
        nextId,
        boolCacheYivi,
        emails,
        krCache,
    } from './stores'

    // logic
    import * as decrypt from './decrypt.js'
    import * as email from './email'

    import { locale, _ } from 'svelte-i18n'

    export let rightMode

    // states
    const STATES = {
        Uninit: 'Uninit',
        Init: 'Init',
        Recipients: 'Recipients',
        Qr: 'Qr',
        Decrypting: 'Decrypting',
        Show: 'Show',
        Fail: 'Fail',
    }

    let PKG_URL = import.meta.env.VITE_PKG_URL
    
    let state = STATES.Uninit

    let outStream = ''
    let decoder = new TextDecoder()
    const unsealerWritable = new WritableStream({
        write: (chunk) => {
            outStream += decoder.decode(chunk, { stream: true })
        },
        close: () => {
            outStream += decoder.decode()
        },
    })

    let policies // hidden policies
    let usk // user secret key
    let keylist // list of keys (if there are multiple recipients)
    let key // key (email of recipient)
    let keyRequest // key request: sent to server
    let recipientAndCreds // chosen recipient and their credentials
    let recipientStripped // chosen recipient stripepd from credentials: sent to server
    let timestamp

    let showHints = false
    let hints = []

    let boolRecipientCached
    let jwtCached // cached jwt, if it exists

    // JWT cache
    let krCacheTemp = {
        jwt: '',
        jwtValid: '',
        key: '',
        krCon: {},
    }

    let decryptedMail
    let err

    // vars
    export let mod // WASM module
    export let readable

    let unsealer
    let vk

    onMount(async () => {
        vk = await fetch(`${PKG_URL}/v2/sign/parameters`)
            .then((r) => r.json())
            .then((j) => j.publicKey)
    })

    $: console.log('state changed: ', state)
    $: {
        if (state === STATES.Uninit && vk) {
            mod.StreamUnsealer.new(readable, vk)
                .then((u) => {
                    state = STATES.Init
                    unsealer = u
                    policies = unsealer.inspect_header()
                    console.log(policies)
                    checkRecipients()
                })
                .catch((e) => {
                    err = e
                    state = STATES.Fail
                })
        }
    }

    // checks whether there is one recipient or multiple
    function checkRecipients() {
        if (policies.size == 1) {
            // Only one recipient
            key = policies.keys().next().value
            console.log(key)
            krCacheTemp.key = key
        } else {
            console.log(policies.keys())
            keylist = policies.keys()
            console.log(keylist)
            state = STATES.Recipients
        }
    }

    $: {
        if ((state == STATES.Init || state == STATES.Recipients) && key) {
            processPolicy()
            processCredentials()

            if (boolRecipientCached) {
                console.log('cache hit')
                // we retrieve key via jwt
                getUskCachedJWT()
                    .then((retrieved) => (usk = retrieved))
                    .catch((e) => {
                        err = e
                        state = STATES.Fail
                    })
            } else {
                // we have to do a session
                stripCredentials()
                createKr()
                state = STATES.Qr
                tick()
                    .then(() => {
                        getUsk().then((retrieved) => (usk = retrieved))
                    })
                    .catch((e) => {
                        err = e
                        state = STATES.Fail
                    })
            }
        }
    }

    $: {
        if (usk) {
            state = STATES.Decrypting

            decryptFile()
                .then(() => (state = STATES.Show))
                .catch((e) => {
                    err = e
                    state = STATES.Fail
                })
        }
    }

    // check checked if the policy is in the cache
    function processPolicy() {
        timestamp = policies.get(key).ts
        recipientAndCreds = decrypt.sortPolicies(policies.get(key)['con']) // sort the recipient credentials on alphabetical order
        boolRecipientCached = checkKrCached()
    }

    // check if the recipient with the credentials is already in the store
    function checkKrCached() {
        for (const kr of $krCache) {
            if (
                kr.key === key &&
                JSON.stringify(kr.krCon) === JSON.stringify(recipientAndCreds)
            ) {
                if (Date.now() / 1000 < kr.jwtValid) {
                    jwtCached = kr.jwt
                    return true
                } else {
                    // jwt expired, so delete it
                    $krCache = $krCache.filter((x) => x.exp != kr.exp)
                    break
                }
            }
        }
        return false
    }

    // check if there are credentials with hints
    function processCredentials() {
        let pol = policies.get(key)['con']
        for (var i = 0; i < pol.length; i++) {
            if (pol[i]['t'] == 'pbdf.sidn-pbdf.mobilenumber.mobilenumber') {
                showHints = true
                hints.push('Mobile number: ' + pol[i]['v'])
            } else if (pol[i]['t'] == 'pbdf.pbdf.surfnet-2.id') {
                showHints = true
                hints.push('Student ID: ' + pol[i]['v'])
            }
        }
    }

    // cache the current credentials if user has chosen to
    function cacheCredentials() {
        let jwtdecoded = jwt_decode(krCacheTemp.jwt)
        krCacheTemp.jwtValid = jwtdecoded.exp
        $krCache = [...$krCache, krCacheTemp]
    }

    // strip the recipient of credentials, to prepare for key request
    function stripCredentials() {
        krCacheTemp.krCon = recipientAndCreds
        recipientStripped = JSON.parse(JSON.stringify(recipientAndCreds)) // deep copy of recipient
        for (const c of recipientStripped) {
            delete c.v
        }
    }

    // create the key request
    function createKr() {
        keyRequest = {
            con: recipientStripped,
            validity: decrypt.secondsTill4AM(),
        }
    }

    // get the usk using a cached jwt value
    async function getUskCachedJWT() {
        usk = await fetch(`${PKG_URL}/v2/request/key/${timestamp.toString()}`, {
            headers: {
                Authorization: `Bearer ${jwtCached}`,
            },
        }).then((r) => r.json().then((o) => o.key))
        return usk
    }

    async function getUsk() {
        const session = {
            url: PKG_URL,
            start: {
                url: (o) => `${o.url}/v2/request/start`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(keyRequest),
            },
            result: {
                url: (o, { sessionToken }) =>
                    `${o.url}/v2/request/jwt/${sessionToken}`,
                parseResponse: (r) => {
                    return r
                        .text()
                        .then((jwt) => {
                            krCacheTemp.jwt = jwt
                            return fetch(
                                `${PKG_URL}/v2/request/key/${timestamp.toString()}`,
                                {
                                    headers: {
                                        Authorization: `Bearer ${jwt}`,
                                    },
                                }
                            )
                        })
                        .then((r) => r.json())
                        .then((json) => {
                            if (
                                json.status !== 'DONE' ||
                                json.proofStatus !== 'VALID'
                            )
                                throw new Error('not done and valid')
                            return json.key
                        })
                        .catch((e) => console.log('error: ', e))
                },
            },
        }

        const yivi = new YiviCore({
            language: $locale === 'nl-NL' ? 'nl' : 'en',
            debugging: true,
            session,
            element: '#yivi-web',
            translations: {
                header: $_('fallback.decrypt.helper'),
            },
        })

        yivi.use(YiviWeb)
        yivi.use(YiviClient)
        usk = await yivi.start()

        // If caching is enabled, cache the jwt
        if ($boolCacheYivi) cacheCredentials()

        return usk
    }

    async function decryptFile() {
        const ret = await unsealer.unseal(key, usk, unsealerWritable)
        console.log('signed using: ', ret)
        decryptedMail = await email.parseMail(outStream)
        await storeMail(outStream)
    }

    async function storeMail(unparsed) {
        // Only store the email if it is not already
        const hash = await decrypt.digestMessage(unparsed)
        const found = $emails.find((e) => e.hash === hash)
        if (found) {
            currSelected.set(found.id)
            await tick()
            rightMode = 'MailView'
            return
        }

        $emails = [
            {
                id: $nextId,
                from: decryptedMail.from,
                to: decryptedMail.to,
                date: decryptedMail.headers[0]['value'],
                subject: decryptedMail.subject,
                raw: unparsed,
                hash,
            },
            ...$emails,
        ]

        currSelected.set($currentId)
        await tick()
        rightMode = 'MailView'
    }
</script>

{#if state === STATES.Init}
    <h2>Decrypt E-mail</h2>
{:else if state === STATES.Recipients}
    <div id="block">
        <p><b>Please select which email belongs to you:</b></p>
        <select bind:value={key}
            ><option value="" />
            {#each keylist as key}
                <option value={key}>
                    {key}
                </option>
            {/each}
        </select>
    </div>
{:else if state === STATES.Qr}
    {#if showHints}
        <p>Hints: {hints}</p>
    {/if}
    <div id="yivi-web">QR</div>
{:else if state === STATES.Decryping}
    <p>Decrypting...</p>
{:else if state === STATES.Fail}
    <p>Failure: {err}</p>
{/if}

<style lang="scss">
    #yivi-web {
        height: 100%;
        width: 100%;
        background-color: #eae5e2;
        max-width: unset;
    }
    select {
        padding: 5px;
        border: 1px solid #d6d6d6;
        border-radius: 5px;
    }
</style>
