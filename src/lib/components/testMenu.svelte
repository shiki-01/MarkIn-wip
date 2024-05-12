<script lang="ts">
	import { writable } from 'svelte/store';
	import { createCheckbox, createMenubar, melt } from '@melt-ui/svelte';
	import { ipcRenderer } from 'electron';
	import { onMount } from 'svelte';

	let template: any[] = [];

	onMount(async () => {
		template = ipcRenderer.sendSync('get-menu');
	});

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
	{#each template as menuData}
		<button type="button" class="trigger" use:melt={$trigger}>{menuData.label}</button>
		<div class="menu" use:melt={$menu}>
			{#each menuData.submenu as itemData}
				<div class="item" use:melt={$item}>{itemData.label}</div>
			{/each}
		</div>
	{/each}
</div>
