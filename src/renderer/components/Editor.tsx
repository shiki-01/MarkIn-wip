import React, { useState, useEffect, useRef } from 'react';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { ResizableBox } from 'react-resizable';
import Split from 'react-split';
import htmlToDraft from 'html-to-draftjs';
import 'draft-js/dist/Draft.css';
import { stateFromHTML } from 'draft-js-import-html';
import TurndownService from 'turndown';
import { marked } from 'marked';
import WithTooltip from './Tools';
import hljs from 'highlight.js/lib/core';
import markdown from 'highlight.js/lib/languages/markdown';
import 'highlight.js/styles/github.css';

hljs.registerLanguage('markdown', markdown);

const turndownService = new TurndownService();

const EditorComponent = ({ path }: { path: string }) => {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    window.electron.project.getFile(`ProjectData/${path}`).then(async (data: string) => {
      setMarkdown(data);
      const html = await marked(data);
      const contentState = stateFromHTML(html);
      setEditorState(EditorState.createWithContent(contentState));
    });
  }, [path]);

  const saveFile = () => {
    window.electron.project.saveFile(`ProjectData/${path}`, markdown);
  }

  const handleEditorChange = (state: EditorState) => {
    setEditorState(state);
    const html = draftToHtml(convertToRaw(state.getCurrentContent()));
    const markdown = turndownService.turndown(html);
    setMarkdown(markdown);
  };

  const handleTextareaChange = async (value: string) => {
    setMarkdown(value);
    const html = await marked(value);
    const contentState = stateFromHTML(html);
    setEditorState(EditorState.createWithContent(contentState));
  }

  const handleKeyCommand = (command: string, state: EditorState) => {
    const newState = RichUtils.handleKeyCommand(state, command);
    if (newState) {
      handleEditorChange(newState);
      return 'handled';
    }
    return 'not-handled';
  }

  const toggleBold = () => {
    handleEditorChange(RichUtils.toggleInlineStyle(editorState, 'BOLD'));
  }

  const toggleHeader = () => {
    handleEditorChange(RichUtils.toggleBlockType(editorState, 'header-one'));
  }

  const [width, setWidth] = useState(200);
  const [handlePosition, setHandlePosition] = useState(width + 30);

  const handleResize = (_event: any, { size }: any) => {
    setWidth(size.width);
    setHandlePosition((size.width) + 30);
  };

  const repoInit = () => {
    const directory = path.split('/')[0];
    window.electron.git.repo.init(directory);
  }

  const repoClone = () => {
    const directory = path.split('/')[0];
    window.electron.git.repo.clone(directory, 'https://github.com/shiki-01/mdn-fes-j2a-site.git');
  }

  const repoCreate = () => {
    const directory = path.split('/')[0];
    window.electron.git.repo.create(directory);
  }

  const repoAdd = () => {
    const directory = path.split('/')[0];
    window.electron.git.repo.add(directory);
  }

  const repoCommit = () => {
    const directory = path.split('/')[0];
    window.electron.git.repo.commit(directory, 'commit');
  }

  const repoPush = () => {
    const directory = path.split('/')[0];
    window.electron.git.repo.push(directory);
  }

  return (
    <Split
      className='container'
      gutter={() => {
        const gutterElement = document.createElement("div");
        gutterElement.className = "gutter";
        return gutterElement;
      }}
      gutterStyle={() => ({})}
      sizes={[50, 50]}
      minSize={200}
      maxSize={1000}
    >
      <div className='markdown'>
        <div>
          <button onClick={saveFile}>Save</button>
          <button onClick={repoInit}>init</button>
          <button onClick={repoClone}>clone</button>
          <button onClick={repoCreate}>create</button>
          <button onClick={repoAdd}>add</button>
          <button onClick={repoCommit}>commit</button>
          <button onClick={repoPush}>push</button>
        </div>
        <textarea className="mEditor" title='Markdown Editor' data-language='markdown' value={markdown} onChange={(e) => handleTextareaChange(e.target.value)} />
      </div>
      <div className='rich'>
        <WithTooltip
          onBoldClick={toggleBold}
          onItalicClick={() => { }}
          onUnderlineClick={() => { }}
          onHighlightClick={() => { }}
        />
        <div className='dEditor'>
          <Editor
            editorState={editorState}
            onChange={handleEditorChange}
            handleKeyCommand={handleKeyCommand}
          />
        </div>
      </div>
    </Split>
  );
};

export default EditorComponent;
