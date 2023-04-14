<script>
    // stores
    import {
        currSelected,
        emails,
        krCache,
        boolCacheYivi,
        boolCacheEmail,
    } from './stores.js'

    import TrashCanOutline from 'svelte-material-icons/TrashCanOutline.svelte'

    export let currMode

    function deleteAllMails() {
        if (
            confirm(
                'Are you sure you want to delete all emails? This action is permanent!'
            )
        ) {
            currSelected.set(-1)
            $emails = []
        }
    }

    function deleteAllYivi() {
        if (
            confirm(
                'Are you sure you want to delete all Yivi credentials? This action is permanent!'
            )
        ) {
            $krCache = []
        }
    }

    function deleteJwt(selected) {
        $krCache = $krCache.filter((x) => x.jwt != selected.jwt)
    }

    function parseKr(input) {
        let str = []

        for (const e of input) {
            switch (e['t']) {
                case 'pbdf.gemeente.personalData.surname':
                    str.push('Surname')
                    break
                case 'pbdf.pbdf.surfnet-2.id':
                    str.push('Student ID: ' + e['v'])
                    break
                case 'pbdf.sidn-pbdf.mobilenumber.mobilenumber':
                    str.push('Mobile number: ' + e['v'])
                    break
                case 'pbdf.nuts.agb.agbcode':
                    str.push('BSN')
                    break
            }
        }

        return str
    }
</script>

<div id="settings-container">
    <h2>Settings</h2>
    <p>
        All Yivi credentials and decrypted e-mails are cached locally in the
        user's browser, no information is sent to a server.
    </p>

    <div id="block2">
        <h3>Caching</h3>

        <input id="emailCache" type="checkbox" bind:checked={$boolCacheEmail} />
        <label for="emailCache">Cache my emails</label> <br />

        <input id="irmaCache" type="checkbox" bind:checked={$boolCacheYivi} />
        <label for="irmaCache">Cache my Yivi credentials</label>
    </div>

    <div id="block2">
        <h3>Yivi Credentials</h3>

        <table id="creds">
            <tr>
                <th>Credentials</th>
                <th>Expiry date</th>
                <th />
            </tr>

            {#each $krCache as kr}
                <tr>
                    <td
                        >{kr.key}<br />
                        {#each parseKr(kr.krCon) as cred}
                            {cred}<br />
                        {/each}
                    </td>
                    <td>{new Date(kr.jwtValid).toUTCString()}</td>
                    <td
                        ><span
                            id="deletebutton"
                            class="material-icons"
                            on:click|preventDefault={() => deleteJwt(kr)}
                            on:keypress><TrashCanOutline size="26px" /></span
                        ></td
                    >
                </tr>
            {/each}
        </table>

        <button class="button" on:click={deleteAllYivi}>
            Delete all Yivi credentials
        </button>
    </div>

    <div id="block2">
        <h3>Email History</h3>
        <button class="button" on:click={deleteAllMails}>
            Delete all cached emails
        </button>
    </div>
    <button
        on:click|preventDefault={() => {
            currMode = currMode === 'List' ? 'Settings' : 'List'
        }}
        style="float:right; margin-right: 1em">Back</button
    >
</div>

<style lang="scss">
    #settings-container {
        padding-left: 1em;
    }

    #creds {
        border-collapse: collapse;
    }

    #creds td,
    #creds th {
        border: 1px solid #d6d6d6;
        padding: 7px;
    }

    #creds tr:hover {
        background-color: #ddd;
    }

    #creds th {
        padding: 7px;
        text-align: left;
        background-color: #d6d6d6;
    }

    #deletebutton {
        cursor: pointer;
    }
</style>
