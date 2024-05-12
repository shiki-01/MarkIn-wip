<script lang="ts">
	import { onMount } from 'svelte';
	let ready: boolean = false;

	let menuItems: any[] = [];

	onMount(async () => {
		menuItems = await window.electron.invoke('get-menu');
		ready = true;
	});

	let showMenu = false;
	let showSubMenu = false;

	function toggleMenu() {
		showMenu = !showMenu;
	}

	function toggleSubMenu() {
		showSubMenu = !showSubMenu;
	}

	function closeWindow() {
		window.electron.send('close-window');
	}

	function minimizeWindow() {
		window.electron.send('minimize-window');
	}

	function maximizeWindow() {
		window.electron.send('maximize-window');
	}
</script>

<svelte:head>
	<script>
		var themeMode = localStorage.getItem('markin.v1.theme-mode');
		if (themeMode === 'system') {
			themeMode = window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light';
		}
		document.documentElement.setAttribute('data-theme', themeMode);
	</script>
</svelte:head>

<div class="dragbar">
	<button class="minimize-button" on:click={minimizeWindow} />
	<button class="maximize-button" on:click={maximizeWindow} />
	<button class="close-button" on:click={closeWindow} />
</div>

{#if ready}
	<slot />
{/if}

<style lang="scss">
	.dragbar {
		-webkit-app-region: drag;
		position: absolute;
		z-index: 100;
		height: 40px;
		width: 100%;
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}

	.icon-button {
		position: absolute;
		left: 0;
		padding: 0;

		img {
			width: 40px;
			height: 40px;
		}
	}

	.menu {
		position: absolute;
		left: 0;
		top: 40px;
	}

	.submenu {
		position: absolute;
		left: 100%;
		top: 0;
	}

	button {
		-webkit-app-region: no-drag;
		background: none;
		width: 40px;
		height: 40px;
		position: relative;
		border: none;
		cursor: pointer;
		transition: background 0.2s;

		&:hover {
			background: rgba(0, 0, 0, 0.1);
		}
	}

	.minimize-button:after,
	.maximize-button:after,
	.close-button:after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 10px;
		height: 2px;
		background: $color-text;
		transform: translate(-50%, -50%);
	}

	.maximize-button:after {
		background: none;
		width: 10px;
		height: 10px;
		border: 2px solid $color-text;
	}

	.close-button:after {
		width: 15px;
		height: 2px;
		transform: translate(-50%, -50%) rotate(45deg);
	}

	.close-button:before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 15px;
		height: 2px;
		background: $color-text;
		transform: translate(-50%, -50%) rotate(-45deg);
	}
</style>
