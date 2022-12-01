<script>
    import { createEventDispatcher } from 'svelte';
    export let value = 'en';
    const dispatch = createEventDispatcher();
    function handleLocaleChange(event) {
        event.preventDefault();
        dispatch('locale-changed', event.target.value);
        localStorage.setItem('preferredLanguage', event.target.value);
    }
</script>

<div class="locale-selector">
    <div class="select">
        <select value={value} on:change={handleLocaleChange}>
            <option value="en-US">English</option>
            <option value="nl-NL">Nederlands</option>
        </select>
    </div>
</div>

<style>
</style>