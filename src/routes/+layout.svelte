<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import * as Resizable from "$lib/components/ui/resizable";
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

<div class="main">

	<div class="dragbar">
		<div class="pl-4 flex gap-4">
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
