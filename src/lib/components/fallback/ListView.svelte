<script>
    import { preventDefault, createBubbler } from 'svelte/legacy';

    const bubble = createBubbler();
    import { emails, currSelected } from './../fallback/stores.js'
    import { _, locale } from 'svelte-i18n'


    /** @type {{rightMode: any, searchTerm: any}} */
    let { rightMode = $bindable(), searchTerm } = $props();

    let sorted =
        $derived($emails &&
        $emails.length > 0 &&
        $emails.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ))
    let sortedFiltered = $derived(searchTerm
        ? sorted.filter(
              (email) =>
                  email.raw.toLowerCase().indexOf(searchTerm.toLowerCase()) > 0
          )
        : sorted)
</script>

{#if sortedFiltered.length > 0}
    <ol>
        {#each sortedFiltered as email}
            <li>
                <button
                    onclick={preventDefault(() => {
                        currSelected.set(email.id)
                        rightMode = 'MailView'
                    })}
                    type="button"
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
                </button>
                <!-- <TrashCanOutline /> -->
            </li>
        {/each}
    </ol>
{:else}
    <div style="margin: auto 3rem; text-align: center;">
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
        height: 4.5rem;
        border-bottom: 1px solid var(--pg-text);
        padding-left: 0.5rem;

        button {
            all: unset;
            cursor: pointer;
            width: 100%;
            text-align: left;

            div {
                border-radius: 10px;
                margin: 1rem 0.5rem 1rem 0rem;
                padding-left: 0.25rem;

                &.selected,
                &:hover,
                &:focus {
                    background: var(--pg-strong-background);
                }
            }
        }
    }
</style>
