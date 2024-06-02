<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';

	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import { writable } from 'svelte/store';
	import Icon from '@iconify/svelte';
	import { fly } from 'svelte/transition';

	const settingsSync = writable(true);
	const hideMeltUI = writable(false);

	const {
		elements: { trigger, menu, item, separator, arrow },
		builders: { createSubmenu, createMenuRadioGroup, createCheckboxItem },
		states: { open },
	} = createDropdownMenu({
		forceVisible: true,
		loop: true,
	});

	const {
		elements: { subMenu, subTrigger },
		states: { subOpen },
	} = createSubmenu();

	const {
		elements: { radioGroup, radioItem },
		helpers: { isChecked },
	} = createMenuRadioGroup({
		defaultValue: 'Hunter Johnston',
	});

	const {
		elements: { checkboxItem },
	} = createCheckboxItem({
		checked: settingsSync,
	});

	const {
		elements: { checkboxItem: checkboxItemA },
	} = createCheckboxItem({
		checked: hideMeltUI,
	});

	const personsArr = ['Hunter Johnston', 'Thomas G. Lopes', 'Adrian Gonz', 'Franck Poingt'];

	let ready: boolean = false;
	onMount(() => (ready = true));
</script>

<div class="dragbar">
	<button type="button" class="trigger" use:melt={$trigger} aria-label="Update dimensions">
		<Icon icon="mdi:menu" class="size-7" />
		<span class="sr-only">Open Popover</span>
	</button>

	<span class="control">
		<Icon icon="mingcute:minimize-line" class="size-7 cursor-pointer" style="right: 40px;" />
		<Icon icon="mdi:window-maximize" class="size-7 cursor-pointer" style="right: 80px;" />
		<Icon icon="mdi:close" class="size-7 cursor-pointer" style="right: 0;" />
	</span>

	{#if $open}
		<div class="menu" use:melt={$menu} transition:fly={{ duration: 150, y: -10 }}>
			<div class="item" use:melt={$item}>
				<span />
				About Melt UI
			</div>
			<div class="item" use:melt={$item}>
				<span />
				Check for Updates...
			</div>
			<div class="separator" use:melt={$separator} />
			<div class="item" use:melt={$checkboxItem}>
				<div class="check" style="width: 24px;">
					{#if $settingsSync}
						<Icon icon="carbon:checkmark" class="size-4" />
					{/if}
				</div>
				Settings Sync is On
			</div>
			<div class="item !hidden md:!flex" use:melt={$subTrigger}>
				<span />
				Profiles
				<div class="rightSlot">
					<Icon icon="carbon:chevron-right" class="size-4" />
				</div>
			</div>
			{#if $subOpen}
				<div
					class="menu subMenu p-2"
					use:melt={$subMenu}
					transition:fly={{ x: -50, duration: 150 }}
				>
					<div class="text">People</div>
					<div use:melt={$radioGroup}>
						{#each personsArr as person}
							<div class="item" use:melt={$radioItem({ value: person })}>
								<div class="check">
									{#if $isChecked(person)}
										<div class="dot" />
									{/if}
								</div>
								{person}
							</div>
						{/each}
					</div>
				</div>
			{/if}
			<div use:melt={$separator} class="separator" />

			<div class="item" use:melt={$checkboxItemA}>
				<div class="check">
					{#if $hideMeltUI}
						<Icon icon="carbon:checkmark" class="size-4" />
					{/if}
				</div>
				Hide Melt UI
				<div class="rightSlot">⌘H</div>
			</div>
			<div class="item" use:melt={$item} data-disabled>
				<span />
				Show All Components
				<div class="rightSlot">⇧⌘N</div>
			</div>
			<div use:melt={$separator} class="separator" />
			<div class="item" use:melt={$item}>
				<span />
				Quit Melt UI
				<div class="rightSlot">⌘Q</div>
			</div>
			<div use:melt={$arrow} />
		</div>
	{/if}
</div>

{#if ready}
	<slot />
{/if}

<style lang="postcss">
	.dragbar {
		-webkit-app-region: drag;
		z-index: 100;
		height: 40px;
		width: 100%;
		display: flex;
		justify-content: space-between;
	}

	.control {
		-webkit-app-region: no-drag;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		height: 40px;
	}

	.trigger {
		-webkit-app-region: no-drag;
		width: 40px;
		height: 40px;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.menu {
		position: absolute;
		width: 260px;
		top: 40px;
		right: 0;
		z-index: 100;
		border-radius: 0.5rem;
		@apply bg-gray-50 shadow-lg rounded-md;
	}

	.item {
		padding: 0.5rem 1rem;
		cursor: pointer;
		display: grid;
		grid-template-columns: 20px 1fr auto;
		align-items: center;
		@apply size-10 w-full;
	}

	.separator {
		height: 1px;
		background-color: rgba(0, 0, 0, 0.1);
	}

	.check {
		margin-right: 0.5rem;
	}

	.dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background-color: black;
	}
</style>
