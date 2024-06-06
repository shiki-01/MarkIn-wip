<script lang="ts">
	import { page } from '$app/stores';
	import { marked } from 'marked';
	import Quill from 'quill';
	import 'quill/dist/quill.snow.css';
	import TurndownService from 'turndown';

	import { afterUpdate, onMount } from 'svelte';

	let direName: string;
	let fileContent: string;

	$: {
		const { params } = $page;
		direName = params.name;
	}

	$: if (direName) {
		window.electron.file.read(direName.replace(/\*/g, '\\')).then((content: string) => {
			fileContent = content;
			text = fileContent;
		});
	}

	let text = '# Hello, Svelte!';
	let editor: HTMLElement;
	let quill: Quill;

	const turndownService = new TurndownService();

	onMount(async () => {
        quill = new Quill(editor, {
            theme: 'snow',
        });
        quill.on('text-change', toMarkdown);
    });

	let markdown = '';

	async function toMarkdown() {
		markdown = turndownService.turndown(quill.root.innerHTML);
		text = markdown;
	}

	async function toHtml() {
		markdown = text;
		editor.innerHTML = await marked(text);
	}
</script>

<h1>{direName}</h1>
{#if direName}
	<div class="editor">
		<textarea bind:value={text} on:change={toHtml} />
		<div bind:this={editor} />
	</div>
{/if}
