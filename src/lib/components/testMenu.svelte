<script lang="ts">
	import { writable } from 'svelte/store';
	import { createCheckbox, createMenubar, melt } from '@melt-ui/svelte';
	import { onMount } from 'svelte';

	let template: any = null;

	onMount(() => {
		if (typeof window !== 'undefined' && window.electron) {
			template = window.electron.send('get-menu');
		}
	});

	$: {
		console.log(template);
	}

	const tipsAndTricks = writable(true);
	const hideMeltUI = writable(false);
	const wordWrap = writable(true);
	const stickyScroll = writable(false);

	const {
		elements: { menubar },
		builders: { createMenu },
	} = createMenubar();

	const {
		elements: { trigger, menu, item, separator },
		builders: { createSubmenu, createMenuRadioGroup },
	} = createMenu();

	const {
		elements: { subMenu, subTrigger },
	} = createSubmenu();

	const {
		elements: { radioGroup, radioItem },
		helpers: { isChecked },
	} = createMenuRadioGroup({
		defaultValue: 'Nord',
	});

	const {
		elements: {},
	} = createCheckbox({
		checked: wordWrap,
	});
	const {
		elements: {},
	} = createCheckbox({
		checked: stickyScroll,
	});

	const {
		elements: {},
	} = createCheckbox({
		checked: tipsAndTricks,
	});

	const {
		elements: {},
	} = createCheckbox({
		checked: hideMeltUI,
	});

	const themesArr = ['Nord', 'GitHub Dark', 'Moonlight'];
</script>

<div class="flex rounded-md bg-white p-1 shadow-md" use:melt={$menubar}>
	{#if template}{/if}
</div>
