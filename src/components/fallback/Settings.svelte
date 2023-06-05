<script>
    // stores
    import {
        currSelected,
        emails,
        krCache,
        boolCacheYivi,
        boolCacheEmail,
    } from './stores.js'

    import { _, locale } from 'svelte-i18n'

    import TrashCanOutline from 'svelte-material-icons/TrashCanOutline.svelte'

    export let currMode

    function deleteAllMails() {
        if (confirm($_('fallback.settings.delete.emails'))) {
            currSelected.set(-1)
            $emails = []
        }
    }

    function deleteAllYivi() {
        if (confirm($_('fallback.settings.delete.creds'))) {
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
    <h3>{$_('fallback.settings.h3', { default: 'Settings' })}</h3>
    <div id="block2">
        <h4>{$_('fallback.settings.h4')}</h4>
        <input id="emailCache" type="checkbox" bind:checked={$boolCacheEmail} />
        <label for="emailCache">{$_('fallback.settings.storeEmails')}</label>
        <br />
        <input id="irmaCache" type="checkbox" bind:checked={$boolCacheYivi} />
        <label for="irmaCache">{$_('fallback.settings.storeCreds')}</label>
    </div>

    {#if $krCache.length > 0}
        <div id="block2">
            <h4>{$_('fallback.settings.creds')}</h4>
            <table id="creds">
                <tr>
                    <th>{$_('fallback.settings.creds')}</th>
                    <th>{$_('fallback.settings.exp')}</th>
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
                        <td
                            >{new Date(kr.jwtValid).toLocaleDateString(
                                $locale
                            )}</td
                        >
                        <td
                            ><span
                                id="deletebutton"
                                class="material-icons"
                                on:click|preventDefault={() => deleteJwt(kr)}
                                on:keypress
                                ><TrashCanOutline size="26px" /></span
                            ></td
                        >
                    </tr>
                {/each}
            </table>

            <button class="button" on:click={deleteAllYivi}>
                {$_('fallback.settings.delete.credsBtn')}
            </button>
        </div>
    {/if}

    {#if $emails.length > 0}
        <div id="block2">
            <h4>Email History</h4>
            <button class="button" on:click={deleteAllMails}>
                {$_('fallback.settings.delete.emailBtn')}
            </button>
        </div>
    {/if}
    <button
        on:click|preventDefault={() => (currMode = 'List')}
    style="float:right; margin-right: 1em">{$_('fallback.settings.back')}</button
    >
</div>

<style lang="scss">
    #settings-container {
        padding: 0 1em 1em 1em;
        width: 100%;
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
