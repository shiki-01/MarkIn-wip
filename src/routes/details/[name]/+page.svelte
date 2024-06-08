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

		// 初期設定としてリッチテキストエディタを初期化
		quill.root.innerHTML = markdownToHtml(editor);

		const syncScroll = (source: Element, target: Element) => {
			let isSyncingSource = false;
			let isSyncingTarget = false;

			const adjustScroll = (
				src: { scrollTop: number; scrollHeight: number; clientHeight: number },
				tgt: { scrollTop: number; scrollHeight: number; clientHeight: number },
				isSource: boolean,
			) => {
				if (isSource ? isSyncingTarget : isSyncingSource) return;
				if (isSource) {
					isSyncingSource = true;
				} else {
					isSyncingTarget = true;
				}
				// スクロール比率を計算
				const ratio = src.scrollTop / (src.scrollHeight - src.clientHeight);
				// 目標要素のスクロール位置を計算し、最大スクロール範囲を超えないように調整
				const targetScrollTop = Math.min(
					ratio * (tgt.scrollHeight - tgt.clientHeight),
					tgt.scrollHeight - tgt.clientHeight,
				);

				// ソース要素が一番下にスクロールされている場合のみ、ターゲットのスクロール位置を調整
				if (src.scrollTop >= src.scrollHeight - src.clientHeight - 1) {
					tgt.scrollTop = targetScrollTop;
				}

				if (isSource) {
					isSyncingSource = false;
				} else {
					isSyncingTarget = false;
				}
			};

			source.addEventListener('scroll', () => adjustScroll(source, target, true));
			target.addEventListener('scroll', () => adjustScroll(target, source, false));
		};

		const quillEditorContainer = document.querySelector('#quill-editor .ql-editor');
		if (quillEditorContainer && textarea) {
			syncScroll(textarea, quillEditorContainer);
			syncScroll(quillEditorContainer, textarea);
		}
	});

	$: if (quill && isMarkdownEditing) {
		quill.root.innerHTML = markdownToHtml(editor);
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
						<select class="ql-size">
							<option value="small"></option>
							<option selected></option>
							<option value="large"></option>
							<option value="huge"></option>
						</select>
						<button class="ql-bold"></button>
						<button class="ql-script" value="sub"></button>
						<button class="ql-script" value="super"></button>
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
