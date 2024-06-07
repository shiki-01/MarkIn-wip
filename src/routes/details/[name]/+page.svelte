<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';
	import Quill from 'quill';
	import TurndownService from 'turndown';
	import 'quill/dist/quill.snow.css';
	import * as Resizable from '$lib/components/ui/resizable';
	import { Textarea } from "$lib/components/ui/textarea";

	let direName: string;
	let fileContent: string;

	$: {
		const { params } = $page;
		direName = params.name;
	}

	$: if (direName) {
		window.electron.file.read(direName.replace(/\*/g, '\\')).then((content: string) => {
			fileContent = content;
			editor = fileContent;
		});
	}

	let editor: string = '';
	let isMarkdownEditing = true;
	let quill: { root: { innerHTML: string }; on: (arg0: string, arg1: () => void) => void };

	const turndownService = new TurndownService();

	// マークダウンをHTMLに変換
	function markdownToHtml(markdown: string) {
		return DOMPurify.sanitize(marked(markdown));
	}

	// HTMLをマークダウンに変換
	function htmlToMarkdown(html: any) {
		return turndownService.turndown(html);
	}

	// 編集モードの切り替え
	function switchToMarkdown() {
		if (!isMarkdownEditing) {
			isMarkdownEditing = true;
			quill.root.innerHTML = markdownToHtml(editor);
		}
	}

	function switchToRichText() {
		if (isMarkdownEditing) {
			isMarkdownEditing = false;
			editor = htmlToMarkdown(quill.root.innerHTML);
		}
	}

	onMount(() => {
		quill = new Quill('#quill-editor', {
			theme: 'snow',
		});

		quill.on('text-change', () => {
			if (!isMarkdownEditing) {
				editor = htmlToMarkdown(quill.root.innerHTML);
			}
		});

		// 初期設定としてリッチテキストエディタを初期化
		quill.root.innerHTML = markdownToHtml(editor);
	});

	$: if (quill && isMarkdownEditing) {
		quill.root.innerHTML = markdownToHtml(editor);
	}
</script>

<h1>{direName}</h1>
{#if direName}
	<div class="editor w-full h-full">
		<Resizable.PaneGroup direction="horizontal" >
			<Resizable.Pane defaultSize={50} minSize={15} class="p-4">
				<Textarea
					bind:value={editor}
					on:input={() => {
						switchToMarkdown();
					}}
					class="w-full h-full"
				/>
			</Resizable.Pane>
			<Resizable.Handle />
			<Resizable.Pane defaultSize={50} minSize={15} class="p-4">
				<div id="quill-editor" on:click={switchToRichText}></div>
			</Resizable.Pane>
		</Resizable.PaneGroup>
	</div>
{/if}

<style>
	.ql-tooltip {
		z-index: 9999;
	}
</style>