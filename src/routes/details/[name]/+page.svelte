<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';
	import Quill from 'quill';
	import TurndownService from 'turndown';
	import 'quill/dist/quill.snow.css';
	import * as Resizable from '$lib/components/ui/resizable';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { H } from 'vite/dist/node/types.d-aGj9QkWt';

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

	turndownService.addRule('headings', {
		filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
		replacement: function (content, node) {
			const level = parseInt(node.nodeName.charAt(1), 10);
			const hashes = '#'.repeat(level);
			return `\n\n${hashes} ${content}\n\n`;
		},
	});

	turndownService.addRule('unorderedList', {
		filter: ['ul'],
		replacement: function (content) {
			return `\n\n${content.replace(/^\s*\n/gm, '')}\n\n`;
		},
	});

	turndownService.addRule('orderedList', {
		filter: ['ol'],
		replacement: function (content) {
			return `\n\n${content.replace(/^\s*\n/gm, '')}\n\n`;
		},
	});

	turndownService.addRule('listItem', {
		filter: ['li'],
		replacement: function (content, node) {
			let prefix = '- ';
			if (node.parentNode) {
				prefix = node.parentNode.nodeName === 'OL' ? '1. ' : '- ';
			}
			return `${prefix}${content}\n`;
		},
	});

	// マークダウンをHTMLに変換
	function markdownToHtml(markdown: string) {
		const markedResult = marked(markdown);
		if (typeof markedResult === 'string') {
			return DOMPurify.sanitize(markedResult);
		}
	}

	function initializeQuillContent() {
		const initialHtml = markdownToHtml(editor);
		if (quill && initialHtml) {
			quill.root.innerHTML = initialHtml;
		}
	}

	// HTMLをマークダウンに変換
	function htmlToMarkdown(html: any) {
		return turndownService.turndown(html);
	}

	// 編集モードの切り替え
	async function switchToMarkdown() {
		if (!isMarkdownEditing) {
			isMarkdownEditing = true;
			const html = await markdownToHtml(editor); // awaitを使用してPromiseの解決を待つ
			if (html) {
				// markdownToHtmlがundefinedを返す可能性があるため、チェックする
				quill.root.innerHTML = html;
			}
		}
	}

	function switchToRichText() {
		if (isMarkdownEditing) {
			isMarkdownEditing = false;
			editor = htmlToMarkdown(quill.root.innerHTML);
		}
	}

	let textarea: HTMLTextAreaElement;
	let qeditor: HTMLDivElement;

	onMount(() => {
		quill = new Quill('#quill-editor', {
			theme: 'snow',
			modules: {
				toolbar: '#toolbar',
			},
		});

		quill.on('text-change', () => {
			if (!isMarkdownEditing) {
				editor = htmlToMarkdown(quill.root.innerHTML);
			}
		});

		// 非同期関数を呼び出し
		initializeQuillContent();
	});

	$: if (quill && isMarkdownEditing) {
		initializeQuillContent();
	}
</script>

{#if direName}
	<div class="flex flex-col w-full h-full">
		<div class="editor w-full h-full">
			<Resizable.PaneGroup direction="horizontal" style="overflow: visible">
				<Resizable.Pane
					defaultSize={50}
					minSize={15}
					class="flex flex-col w-full h-full p-4"
				>
					<h1 class="h-[42.84px] flex align-middle">{direName}</h1>
					<textarea
						bind:value={editor}
						bind:this={textarea}
						on:input={() => {
							switchToMarkdown();
						}}
						class="w-full h-full resize-none"
					/>
				</Resizable.Pane>
				<Resizable.Handle />
				<Resizable.Pane
					defaultSize={50}
					minSize={15}
					class="w-full h-full p-4"
					style="overflow: visible"
				>
					<div id="toolbar" class="h-[45px] flex align-middle">
						<select class="ql-header">
							<option value="1"></option>
							<option value="2"></option>
							<option value="3"></option>
							<option value="4"></option>
							<option value="5"></option>
							<option value="6"></option>
							<option selected></option>
						</select>
						<button class="ql-bold"></button>
						<button class="ql-script" value="sub"></button>
						<button class="ql-script" value="super"></button>
						<button class="ql-link"></button>
						<button class="ql-image"></button>
						<button class="ql-code-block"></button>
						<button class="ql-clean"></button>
					</div>
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<div
						id="quill-editor"
						bind:this={qeditor}
						class="w-full h-full"
						on:click={switchToRichText}
					></div>
				</Resizable.Pane>
			</Resizable.PaneGroup>
		</div>
	</div>
{/if}

<style>
	:global(.ql-tooltip) {
		z-index: 9999;
	}
	#quill-editor {
		height: calc(100% - 45px);
	}
</style>
