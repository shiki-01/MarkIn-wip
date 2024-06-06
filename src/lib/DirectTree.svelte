<script>
    export let directoryStructure;
    export let level = 0;
    import DirectTree from './DirectTree.svelte';
    import { Button } from '$lib/components/ui/button';
</script>

{#if directoryStructure}
    {#each Object.entries(directoryStructure) as [name, value]}
        {#if typeof value === 'object' && !value.path}
            <DirectTree directoryStructure={value} {level} />
        {:else}
            <Button href='/details/{value.path.slice(value.path.indexOf("ProjectData") + "ProjectData".length).replace(/\\/g, '*')}' class="text-left">
                {name}
            </Button>
        {/if}
    {/each}
{/if}