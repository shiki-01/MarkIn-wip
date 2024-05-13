<script lang="ts">
	import MenuBar from '$lib/components/MenuBar.svelte';
	import Icon from '@iconify/svelte';
	import { slide } from 'svelte/transition';
	import 'the-new-css-reset';
	import '@fontsource-variable/m-plus-1';
	import '@fontsource/noto-color-emoji';
	import '@fontsource-variable/jetbrains-mono';
	function closeWindow() {
		window.electron.send('close-window');
	}

	function minimizeWindow() {
		window.electron.send('minimize-window');
	}

	function maximizeWindow() {
		window.electron.send('maximize-window');
	}

	$: isOpen = false;

	function toggleMenu() {
		isOpen = !isOpen;
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
	<div>
		<MenuBar />
	</div>
	<div class="no-drag" />
	<button class="minimize-button" on:click={minimizeWindow} />
	<button class="maximize-button" on:click={maximizeWindow} />
	<button class="close-button" on:click={closeWindow} />
</div>

<div class="body" class:open={isOpen}>
	<div>
		<div class="open">
			<button on:click={toggleMenu}>
				{#if isOpen}
					<Icon icon="material-symbols:dock-to-left-outline" width={25} color="black" />
				{:else}
					<Icon icon="material-symbols:dock-to-right-outline" width={25} color="black" />
				{/if}
			</button>
		</div>
		{#if isOpen}
			<header transition:slide={{ duration: 200, axis: `x` }}>
				<div class="user">
					<div class="icon">
						<Icon icon="mdi:account" color="#eee" />
					</div>
					<span>Guest</span>
				</div>
			</header>
		{/if}
	</div>
	<main>
		<slot />
	</main>
</div>

<style lang="scss">
	.dragbar {
		-webkit-app-region: drag;
		position: absolute;
		z-index: 100;
		height: 40px;
		width: 100%;
		display: grid;
		grid-template-columns: 220px 1fr 40px 40px 40px;
		justify-content: flex-end;
		align-items: center;
		border-bottom: 2px solid $color-border;

		& > div:not(.no-drag) {
			-webkit-app-region: no-drag;
			padding-left: 10px;
			grid-column: 1 / 2;
		}

		& > .no-drag {
			-webkit-app-region: no-drag;
			grid-column: 2 / 3;
		}
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

	.body {
		padding-top: 40px;
		display: grid;
		grid-template-columns: 45px 1fr;
		transition: grid-template-columns 0.2s;

		&.open {
			grid-template-columns: 220px 1fr;
		}

		div {
			display: grid;
			grid-template-rows: 45px 1fr;
			background: $color-bg;
			border-right: 2px solid $color-border;
			transition: border-right 0.2s;

			header {
				height: calc(100vh - 40px - 45px);
				display: grid;
				grid-template-rows: 40px 40px 40px 1fr;
				padding: 10px;

				.user {
					display: grid;
					align-items: center;
					justify-content: center;
					gap: 10px;
					color: $color-text;
					grid-template-columns: 40px 1fr;
					border: none;

					.icon {
						width: 40px;
						height: 40px;
						display: grid;
						place-items: center;
						background: $color-main;
						border-radius: 50%;
					}
				}
			}

			.open {
				display: grid;
				align-items: top;
				justify-content: start;
				width: 45px;
				height: calc(100vh - 40px);
				border: none;

				button {
					padding: 10px;
					background: none;
					width: 45px;
					height: 45px;
					position: relative;
					border: none;
					cursor: pointer;
					transition: background 0.2s;

					&:hover {
						background: none;
					}
				}
			}
		}

		main {
		}
	}
</style>
