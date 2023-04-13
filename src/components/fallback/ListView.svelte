<script>
    import { emails, currSelected } from './../fallback/stores.js'

    import TrashCanOutline from 'svelte-material-icons/TrashCanOutline.svelte'

    export let rightMode

    $: sorted = $emails.sort((a, b) => new Date(a.date) > new Date(b.date))
</script>

{#if sorted.length > 0}
    <ol>
        {#each sorted as email, i}
            <li
                class:selected={$currSelected === i}
                on:click|preventDefault={() => {
                    currSelected.set(i)
                    rightMode = 'MailView'
                }}
                on:keypress
            >
                <b>{email.subject}</b> <br />
                {#if email.from.name}
                    {email.from.name}
                {:else}
                    {email.from.address}
                {/if} <br />

                {email.date}

                <!--                <TrashCanOutline /> -->
            </li>
        {/each}
    </ol>
{:else}
    <p style="margin: auto; text-align: center;">
        Oops! Looks like there is nothing here.
    </p>
{/if}

<style lang="scss">
    ol {
        list-style-type: none;
        width: 100%;
        height: 100%;
        padding-left: 0;
        overflow-y: scroll;

        scrollbar-width: 25px;
        ::-webkit-scrollbar {
            width: 25px;
        }
    }

    li {
        display: flex;
        flex-direction: column;
        justify-content: center;
        cursor: pointer;
        height: 4.5em;
        padding-left: 1em;
        border-bottom: 1px solid black;

        &.selected {
            background: #a3ccf780;
        }

        &:hover {
            background: #a3ccf780;
        }

        &:focus {
            background: #a3ccf780;
        }
    }
</style>
