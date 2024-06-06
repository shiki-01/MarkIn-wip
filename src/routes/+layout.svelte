<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import * as Resizable from '$lib/components/ui/resizable';
	import { Button } from '$lib/components/ui/button';
	let ready: boolean = false;
	let data: any;
	let directoryStructure: any;

	function convertToDirectoryStructure(files: any[]) {
		const root: Record<string, any> = {};

		files.forEach((file: { path: string }) => {
			let pathSegments = file.path.split('\\');
			pathSegments = pathSegments.slice(pathSegments.indexOf('ProjectData') + 1);
			let currentDirectory: Record<string, any> = root;

			pathSegments.forEach((segment: string, index: number) => {
				if (!currentDirectory[segment]) {
					if (index === pathSegments.length - 1 && segment.includes('.')) {
						currentDirectory[segment] = file;
					} else {
						currentDirectory[segment] = {};
					}
				}

				if (!segment.includes('.')) {
					currentDirectory = currentDirectory[segment];
				}
			});
		});

		return root;
	}

	onMount(async () => {
		data = await window.electron.file.getAll();
		directoryStructure = convertToDirectoryStructure(data);
		ready = true;
	});

	import Icon from '@iconify/svelte';
	import DirectTree from '$lib/DirectTree.svelte';
	import { cn } from '$lib/utils';

	let navCollapsedSize: number = 3;
	let defaultCollapsed = false;
	let isCollapsed = defaultCollapsed;

	const handleCloseWindow = () => {
		window.electron.window.close();
	};

	const handleMaximizeWindow = () => {
		window.electron.window.maximize();
	};

	const handleMinimizeWindow = () => {
		window.electron.window.minimize();
	};

	function onLayoutChange(sizes: number[]) {
		document.cookie = `PaneForge:layout=${JSON.stringify(sizes)}`;
	}

	function onCollapse() {
		isCollapsed = true;
		document.cookie = `PaneForge:collapsed=${true}`;
	}

	function onExpand() {
		isCollapsed = false;
		document.cookie = `PaneForge:collapsed=${false}`;
	}
</script>

<div class="main">
	<div class="dragbar">
		<div class="pl-4 flex gap-4"></div>
		<div class="flex justify-end items-center pr-4 gap-4">
			<button on:click={handleMinimizeWindow}>
				<Icon icon="material-symbols:chrome-minimize-rounded" class="size-6" />
			</button>
			<button on:click={handleMaximizeWindow}>
				<Icon icon="material-symbols:chrome-maximize-outline" class="size-6" />
			</button>
			<button on:click={handleCloseWindow}>
				<Icon icon="material-symbols:close-rounded" class="size-6" />
			</button>
		</div>
	</div>

	<Resizable.PaneGroup direction="horizontal" {onLayoutChange}>
		<Resizable.Pane
			defaultSize={20}
			collapsedSize={navCollapsedSize}
			collapsible
			minSize={15}
			maxSize={25}
			{onCollapse}
			{onExpand}
		>
			<div class={cn('flex h-[52px]', isCollapsed ? 'h-[52px]' : 'px-2')}>
				<div
					data-collapsed={isCollapsed}
					class="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
				>
					<div
						class="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2"
					>
						{#if isCollapsed}
							<Icon icon="carbon:menu" class="size-6" />
						{:else}
							<Button href="/"></Button>
							<Button href="/details/test"></Button>
							<DirectTree {directoryStructure} />
						{/if}
					</div>
				</div>
			</div>
		</Resizable.Pane>
		<Resizable.Handle />
		<Resizable.Pane defaultSize={80}>
			{#if ready}
				<div class="w-full h-full">
					<slot />
				</div>
			{/if}
		</Resizable.Pane>
	</Resizable.PaneGroup>
</div>

<style lang="postcss">
	.main {
		display: grid;
		height: 100vh;
		width: 100vw;
		grid-template-rows: 50px 1fr;
	}
	.dragbar {
		-webkit-app-region: drag;
		z-index: 100;
		height: 50px;
		width: 100%;
		display: flex;
		justify-content: space-between;
	}
	.dragbar button {
		-webkit-app-region: no-drag;
	}
</style>
