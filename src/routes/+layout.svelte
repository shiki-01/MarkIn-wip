<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
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
		console.log(directoryStructure);
		ready = true;
	});

	import {
		Sidebar,
		SidebarGroup,
		SidebarItem,
		SidebarWrapper,
		SidebarDropdownItem,
		SidebarDropdownWrapper,
	} from 'flowbite-svelte';
	import { CartSolid, EditOutline } from 'flowbite-svelte-icons';
	import Icon from '@iconify/svelte';
	import DirectTree from '$lib/DirectTree.svelte';

	$: isSidebarVisible = true;

	const handleCloseWindow = () => {
		window.electron.window.close();
	};

	const handleMaximizeWindow = () => {
		window.electron.window.maximize();
	};

	const handleMinimizeWindow = () => {
		window.electron.window.minimize();
	};
</script>

<div class="main" style="grid-template-columns: {isSidebarVisible ? '250px 1fr' : '0 1fr'};">
	<div
		class="sidebar"
		style="transform: {isSidebarVisible ? 'translateX(0)' : 'translateX(-100%)'};"
	>
		<Sidebar class="h-full">
			<SidebarWrapper class="h-full">
				<SidebarGroup>
					<div class="flex justify-between items-center p-3 pt-0">
						<button><Icon icon="ic:sharp-menu" class="size-6" /></button>
						<button
							on:click={() => {
								isSidebarVisible = !isSidebarVisible;
							}}
						>
							<Icon
								icon="material-symbols:arrow-back-ios-new-rounded"
								class="size-6"
							/>
						</button>
					</div>
					<SidebarItem label="Account">
						<svelte:fragment slot="icon">
							<Icon icon="material-symbols:account-circle" class="size-6" />
						</svelte:fragment>
					</SidebarItem>
					<SidebarDropdownWrapper label="E-commerce">
						<svelte:fragment slot="icon">
							<CartSolid
								class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
							/>
						</svelte:fragment>
						<DirectTree {directoryStructure} />
					</SidebarDropdownWrapper>
					<SidebarItem label="Setting">
						<svelte:fragment slot="icon">
							<EditOutline
								class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
							/>
						</svelte:fragment>
					</SidebarItem>
				</SidebarGroup>
			</SidebarWrapper>
		</Sidebar>
	</div>

	<div class="dragbar">
		<div class="pl-4 flex gap-4">
			{#if !isSidebarVisible}
				<button class="h-full">
					<Icon icon="ic:sharp-menu" class="size-6" />
				</button>
				<button
					on:click={() => {
						isSidebarVisible = !isSidebarVisible;
					}}
					class="h-full"
				>
					<Icon icon="material-symbols:arrow-forward-ios-rounded" class="size-6" />
				</button>
			{/if}
		</div>
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

	{#if ready}
		<div class="w-full h-full">
			<slot />
		</div>
	{/if}
</div>

<style lang="postcss">
	.main {
		display: grid;
		grid-template-rows: 50px 1fr;
		height: 100vh;
		transition: grid-template-columns 0.3s ease-out;
	}
	.sidebar {
		grid-row: 1 / 3;
		overflow: hidden;
		transition: transform 0.3s ease-out;
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
