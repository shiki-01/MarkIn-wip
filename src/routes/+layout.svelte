<script lang="ts">
	import { onMount } from 'svelte';

	let ready: boolean = false;
	onMount(() => (ready = true));

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
		background: #000;
		transform: translate(-50%, -50%);
	}

	.maximize-button:after {
		background: none;
		width: 10px;
		height: 10px;
		border: 2px solid #000;
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
		background: #000;
		transform: translate(-50%, -50%) rotate(-45deg);
	}
</style>
