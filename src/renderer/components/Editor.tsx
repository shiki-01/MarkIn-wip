import React, { useState, useEffect, useRef } from 'react';
import { Remarkable } from 'remarkable';
import TurndownService from 'turndown';
import { Textarea } from "@fluentui/react-components";

const md = new Remarkable();
const turndownService = new TurndownService();

export const Editor = () => {
    const [text, setText] = useState('');
    const [isTextareaFocused, setTextareaFocused] = useState(false);
    const outputRef = useRef<HTMLDivElement>(null);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(event.target.value);
    };

    useEffect(() => {
        if (outputRef.current && !isTextareaFocused) {
            outputRef.current.innerHTML = md.render(text);
        }
    }, [text, isTextareaFocused]);

    useEffect(() => {
        const observer = new MutationObserver(handleOutputChange);
        if (outputRef.current) {
            observer.observe(outputRef.current, { childList: true, characterData: true, subtree: true });
        }
        return () => observer.disconnect();
    }, []);

    const handleOutputChange = () => {
        if (outputRef.current && !isTextareaFocused) {
            const html = outputRef.current.innerHTML;
            const markdown = turndownService.turndown(html);
            setText(markdown);
        }
    };

    return (
        <div className="container">
            <Textarea
                title='Markdown Editor'
                className="input"
                onChange={handleChange}
                value={text}
                onFocus={() => setTextareaFocused(true)}
                onBlur={() => setTextareaFocused(false)}
            />
            <div
                className="output"
                ref={outputRef}
                contentEditable
                style={{border: 'none', resize: 'none', overflow: 'auto', whiteSpace: 'pre-wrap'}}
            />
        </div>
    );
}

export default Editor;
