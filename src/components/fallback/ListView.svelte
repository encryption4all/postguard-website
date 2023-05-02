<script>
    import { emails, currSelected } from './../fallback/stores.js'
    import { _, locale } from 'svelte-i18n'

    // import TrashCanOutline from 'svelte-material-icons/TrashCanOutline.svelte'

    export let rightMode
    export let searchTerm

    $: sorted =
        $emails &&
        $emails.length > 0 &&
        $emails.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
    $: sortedFiltered = searchTerm
        ? sorted.filter(
              (email) =>
                  email.raw.toLowerCase().indexOf(searchTerm.toLowerCase()) > 0
          )
        : sorted
</script>

{#if sortedFiltered.length > 0}
    <ol>
        {#each sortedFiltered as email}
            <li
                on:click|preventDefault={() => {
                    currSelected.set(email.id)
                    rightMode = 'MailView'
                }}
                on:keypress
            >
                <div class:selected={$currSelected === email.id}>
                    <b>{email.subject}</b> <br />
                    {#if email.from.name}
                        {email.from.name}
                    {:else}
                        {email.from.address}
                    {/if} <br />

                    {new Date(email.date).toLocaleString($locale)}
                </div>

                <!-- <TrashCanOutline /> -->
            </li>
        {/each}
    </ol>
{:else}
    <div style="margin: auto 3em; text-align: center;">
        <h4>
            {$_('fallback.list.nothing')}
        </h4>
        <p>
            {$_('fallback.list.nothing2')}
        </p>
    </div>
{/if}

<style lang="scss">
    ol {
        margin-top: 0;
        list-style-type: none;
        width: 100%;
        height: 100%;
        padding-left: 0;

        scrollbar-width: 10px;
        ::-webkit-scrollbar {
            width: 10px;
        }
    }

    li {
        display: flex;
        flex-direction: column;
        justify-content: center;
        cursor: pointer;
        height: 4.5em;
        border-bottom: 1px solid black;
        padding-left: 0.5em;

        div {
            border-radius: 10px;
            margin: 1em 0.5em 1em 0em;
            padding-left: 0.25em;

            &.selected,
            &:hover,
            &:focus {
                background: #a3ccf780;
            }
        }
    }
</style>
