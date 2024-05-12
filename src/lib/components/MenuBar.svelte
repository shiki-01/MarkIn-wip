<script lang="ts">
	import { onMount } from 'svelte';
	import { createMenubar, melt } from '@melt-ui/svelte';
	import { writable } from 'svelte/store';
	import Icon from '@iconify/svelte';

	type MenuItem = {
		id: string;
		label: string;
		submenu: {
			id: string;
			label: string;
			type: string;
			accelerator?: string;
			click?: () => void;
		}[];
	};

	function handleItemClick(item: string) {
		switch (item) {
			case 'new-text-file':
				break;
			case 'new-file':
				break;
			case 'new-window':
				break;
			case 'quit':
				window.electron.send('close-window');
				break;
		}
	}

	let menuItems: MenuItem[] = [];
	let ready: boolean = false;

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
		elements: { trigger: triggerA, menu: menuA, item: itemA, separator: separatorA },
	} = createMenu();

	const {
		elements: { trigger: triggerB, menu: menuB, item: itemB, separator: separatorB },
		builders: { createSubmenu: createSubmenuB, createCheckboxItem: createCheckboxItemB },
	} = createMenu();

	const {
		elements: { checkboxItem: wordWrapCheckbox },
	} = createCheckboxItemB({
		checked: wordWrap,
	});
	const {
		elements: { checkboxItem: stickyScrollCheckbox },
	} = createCheckboxItemB({
		checked: stickyScroll,
	});

	const {
		elements: { subMenu: subMenuB, subTrigger: subTriggerB },
	} = createSubmenuB();

	const {
		elements: { trigger: triggerC, menu: menuC, item: itemC, separator: separatorC },
		builders: { createCheckboxItem: createCheckboxItemC },
	} = createMenu();

	const {
		elements: { checkboxItem: tipsAndTricksCheckbox },
	} = createCheckboxItemC({
		checked: tipsAndTricks,
	});

	const {
		elements: { checkboxItem: hideMeltUICheckbox },
	} = createCheckboxItemC({
		checked: hideMeltUI,
	});
</script>

<div class="wrap" use:melt={$menubar}>
	<!------------>
	<!--- FILE --->
	<!------------>
	<button type="button" class="trigger" use:melt={$trigger} aria-label="Update dimensions">
		File
	</button>

	<div class=" menu" use:melt={$menu}>
		<div class="item" use:melt={$item}>New Text File</div>
		<div class="item" use:melt={$item}>
			New File...
			<div class="rightSlot">⌘T</div>
		</div>
		<div class="item" use:melt={$item} data-disabled>
			New Window...
			<div class="rightSlot">⇧⌘T</div>
		</div>
		<div class="separator" use:melt={$separator} />
		<div class="item" use:melt={$item} data-disabled>
			Settings
			<div class="rightSlot">⌘,</div>
		</div>
		<div use:melt={$separator} class="separator" />
		<div class="item" use:melt={$item} on:click={() => handleItemClick('quit')}>
			Quit Melt UI
			<div class="rightSlot">⌘Q</div>
		</div>
	</div>

	<!------------>
	<!--- EDIT --->
	<!------------>
	<button type="button" class="trigger" use:melt={$triggerA} aria-label="Update dimensions">
		Edit
	</button>

	<div class=" menu" use:melt={$menuA}>
		<div class="item" use:melt={$itemA}>
			Undo
			<div class="rightSlot">⌘Z</div>
		</div>
		<div class="item" use:melt={$itemA}>
			Redo
			<div class="rightSlot">⇧⌘Z</div>
		</div>
		<div class="separator" use:melt={$separatorA} />
		<div class="item" use:melt={$itemA}>
			Cut
			<div class="rightSlot">⌘X</div>
		</div>
		<div class="item" use:melt={$itemA}>
			Copy
			<div class="rightSlot">⌘C</div>
		</div>
		<div class="item" use:melt={$itemA}>
			Paste
			<div class="rightSlot">⌘V</div>
		</div>

		<div use:melt={$separatorA} class="separator" />

		<div class="item" use:melt={$itemA}>
			Find
			<div class="rightSlot">⌘F</div>
		</div>
		<div class="item" use:melt={$itemA}>
			Replace
			<div class="rightSlot">⌥⌘F</div>
		</div>
	</div>

	<!------------>
	<!--- VIEW --->
	<!------------>
	<button type="button" class="trigger" use:melt={$triggerB} aria-label="Update dimensions">
		View
	</button>

	<div class=" menu" use:melt={$menuB}>
		<div class="item" use:melt={$itemB}>
			Command Palette..
			<div class="rightSlot">⇧⌘P</div>
		</div>
		<div class="item" use:melt={$itemB}>Open View...</div>
		<div class="separator" use:melt={$separatorB} />
		<div class="item" use:melt={$subTriggerB}>
			Appearance
			<div class="rightSlot">
				<Icon icon="bi:chevron-right" class="size-4" />
			</div>
		</div>
		<div class="menu subMenu" use:melt={$subMenuB}>
			<div use:melt={$radioGroup}>
				<div class="item" use:melt={$itemB}>Full Screen</div>
				<div class="item" use:melt={$itemB}>Zen Mode</div>
			</div>
		</div>
		<div class="separator" use:melt={$separatorB} />

		<div class="item" use:melt={$wordWrapCheckbox}>
			<div class="check">
				{#if $wordWrap}
					<Icon icon="bi:check" class="size-4" color="#eee" />
				{:else}
					<Icon icon="ic:baseline-minus" class="size-4" color="#eee" />
				{/if}
			</div>
			Word Wrap
			<div class="rightSlot">⌘H</div>
		</div>
		<div class="item" use:melt={$stickyScrollCheckbox}>
			<div class="check">
				{#if $stickyScroll}
					<Icon icon="bi:check" class="size-4" color="#eee" />
				{:else}
					<Icon icon="ic:baseline-minus" class="size-4" color="#eee" />
				{/if}
			</div>
			Sticky Scroll
		</div>
	</div>

	<!------------>
	<!--- HELP --->
	<!------------>
	<button type="button" class="trigger" use:melt={$triggerC} aria-label="Update dimensions">
		Help
	</button>

	<div class=" menu" use:melt={$menuC}>
		<div class="item" use:melt={$itemC}>About Melt UI</div>
		<div class="item" use:melt={$itemC}>Check for Updates...</div>
		<div class="separator" use:melt={$separatorC} />
		<div class="item" use:melt={$tipsAndTricksCheckbox}>
			<div class="check">
				{#if $tipsAndTricks}
					<Icon icon="bi:check" class="size-4" color="#eee" />
				{:else}
					<Icon icon="ic:baseline-minus" class="size-4" color="#eee" />
				{/if}
			</div>
			Tips & Tricks
		</div>

		<div use:melt={$separatorC} class="separator" />

		<div class="item" use:melt={$hideMeltUICheckbox}>
			<div class="check">
				{#if $hideMeltUI}
					<Icon icon="bi:check" class="size-4" color="#eee" />
				{:else}
					<Icon icon="ic:baseline-minus" class="size-4" color="#eee" />
				{/if}
			</div>
			Documentation
		</div>
		<div class="item" use:melt={$itemC} data-disabled>
			Show All Components
			<div class="rightSlot">⇧⌘N</div>
		</div>
		<div use:melt={$separatorC} class="separator" />
		<div class="item" use:melt={$itemC}>Report a bug...</div>
	</div>
</div>

<style lang="scss">
	.wrap {
		-webkit-app-region: no-drag;

		button {
			padding: 0 0.5rem;
			cursor: pointer;
			transition: background-color 0.2s;
			&:hover {
				background-color: $color-highlight;
				border-radius: 5px;
			}
		}
	}

	.menu {
		position: absolute;
		top: 100%;
		left: 0;
		z-index: 100;
		background-color: $color-bg;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		border-radius: 5px;
		padding: 0.5rem 0;
		min-width: 200px;
		transition: opacity 0.2s;
	}

	.item {
		padding: 0.2rem 1rem;
		display: flex;
		gap: 0.5rem;
		justify-content: left;
		align-items: center;
		cursor: pointer;
		transition: background-color 0.2s;

		.check {
			background: $color-main;
			border-radius: 2px;
		}

		.rightSlot {
			margin-left: auto;
			font-size: 0.8rem;
		}

		&:hover {
			background-color: #f0f0f0;
		}
	}
</style>
