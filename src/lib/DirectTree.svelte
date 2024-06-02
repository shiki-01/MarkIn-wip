<script>
    export let directoryStructure;
    export let level = 0;
    import DirectTree from './DirectTree.svelte';
    import { SidebarDropdownItem, SidebarDropdownWrapper } from 'flowbite-svelte';
    import { Router, Route, Link } from 'svelte-routing';
</script>

<Router>
    {#if directoryStructure}
        {#each Object.entries(directoryStructure) as [name, value]}
            {#if typeof value === 'object' && !value.path}
                <SidebarDropdownWrapper label={name} style="padding-left: {level * 20}px;">
                    <DirectTree directoryStructure={value} level={level + 1} />
                </SidebarDropdownWrapper>
            {:else}
                <Link to={`/details/${name.split('/').pop()}`} style="padding-left: {level * 20}px;">
                    <SidebarDropdownItem label={name.split('/').pop()} />
                </Link>
            {/if}
        {/each}
    {/if}

    <Route path="/details/:name" let:params>
        <DirectTree directoryStructure={directoryStructure[params.name]} level={level + 1} />
    </Route>
</Router>