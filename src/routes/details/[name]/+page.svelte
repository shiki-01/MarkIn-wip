<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';

    let direName: string;

    onMount(() => {
        const { params } = $page;

        direName = params.name;
    });
</script>

<h1>{direName}</h1>