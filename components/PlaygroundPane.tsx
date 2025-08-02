
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, PlaygroundContent } from '../types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Terminal, AlertTriangle, Info, X, Trash2 } from 'lucide-react';

interface PlaygroundPaneProps {
  canvas: Canvas;
  onUpdateContent: (canvasId: string, content: PlaygroundContent) => void;
  onUpdateTitle: (canvasId: string, newTitle: string) => void;
  hideTitle?: boolean;
}

const Editor: React.FC<{ language: string; value: string; onChange: (value: string) => void; header: string; }> = ({ language, value, onChange, header }) => {
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const preRef = useRef<HTMLPreElement>(null);

    const syncScroll = useCallback(() => {
        if(textAreaRef.current && preRef.current) {
            preRef.current.scrollTop = textAreaRef.current.scrollTop;
            preRef.current.scrollLeft = textAreaRef.current.scrollLeft;
        }
    }, [])

    return (
        <div className="h-full flex flex-col bg-[#1e1e1e] rounded-lg border border-zinc-700 overflow-hidden">
            <div className="px-3 py-1.5 bg-zinc-900/50 text-xs font-semibold text-zinc-300 border-b border-zinc-700">{header}</div>
            <div className="relative flex-1 text-sm font-mono">
                <SyntaxHighlighter 
                    language={language} 
                    style={vscDarkPlus} 
                    customStyle={{ margin: 0, background: '#1e1e1e', padding: '0.75rem', height: '100%', overflow:'hidden', lineHeight: '1.6' }} 
                    codeTagProps={{ style: { fontFamily: 'inherit' } }}
                    PreTag={ (props) => <pre {...props} ref={preRef}></pre> }
                >
                    {value + '\n'}
                </SyntaxHighlighter>
                <textarea
                    ref={textAreaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onScroll={syncScroll}
                    spellCheck="false"
                    className="absolute top-0 left-0 w-full h-full p-3 bg-transparent text-transparent caret-white outline-none resize-none"
                    style={{ fontFamily: 'inherit', lineHeight: '1.6' }}
                />
            </div>
        </div>
    );
};

const CustomConsole: React.FC<{ logs: any[]; onClear: () => void }> = ({ logs, onClear }) => {
    const logTypeStyles: { [key: string]: string } = {
        log: 'text-zinc-300',
        warn: 'text-yellow-400',
        error: 'text-red-400',
    };
    const logTypeIcons: { [key: string]: React.ReactNode } = {
        warn: <AlertTriangle size={14} className="mr-2 flex-shrink-0" />,
        error: <X size={14} className="mr-2 flex-shrink-0" />,
        log: <Info size={14} className="mr-2 flex-shrink-0 text-blue-400" />,
    }
    const logsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="h-full flex flex-col bg-zinc-900/50">
            <div className="p-2 border-b border-zinc-700 text-sm font-semibold text-zinc-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2"><Terminal size={16}/> Console</div>
                <button onClick={onClear} title="Clear console" className="p-1 text-zinc-400 hover:text-white"><Trash2 size={14}/></button>
            </div>
            <div className="flex-1 p-2 overflow-y-auto font-mono text-xs">
                {logs.map((log, i) => (
                    <div key={i} className={`flex items-start py-1 border-b border-white/5 ${logTypeStyles[log.type] || 'text-zinc-300'}`}>
                        {logTypeIcons[log.type]}
                        <pre className="whitespace-pre-wrap break-words">{log.args.map((arg: any) => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg).join(' ')}</pre>
                    </div>
                ))}
                <div ref={logsEndRef} />
            </div>
        </div>
    );
};


const PlaygroundPane: React.FC<PlaygroundPaneProps> = ({ canvas, onUpdateContent, onUpdateTitle, hideTitle = false }) => {
    const [content, setContent] = useState(canvas.playgroundContent || { html: '', css: '', js: '' });
    const [srcDoc, setSrcDoc] = useState('');
    const [logs, setLogs] = useState<any[]>([]);
    
    const [editorPaneWidth, setEditorPaneWidth] = useState(50);
    const isDragging = useRef(false);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdateTitle(canvas.id, e.target.value);
    }
    
    // Debounce updates to parent
    useEffect(() => {
        const handler = setTimeout(() => {
            onUpdateContent(canvas.id, content);
        }, 500);
        return () => clearTimeout(handler);
    }, [content, canvas.id, onUpdateContent]);

    // Update srcDoc when content changes
    useEffect(() => {
        const consoleInterceptor = `
            <script>
                const originalConsole = {...window.console};
                window.console = {
                    ...originalConsole,
                    log: (...args) => { window.parent.postMessage({ source: 'playground-log', type: 'log', args }, '*'); originalConsole.log(...args); },
                    warn: (...args) => { window.parent.postMessage({ source: 'playground-log', type: 'warn', args }, '*'); originalConsole.warn(...args); },
                    error: (...args) => { window.parent.postMessage({ source: 'playground-log', type: 'error', args }, '*'); originalConsole.error(...args); },
                };
                window.addEventListener('error', (e) => {
                     window.parent.postMessage({ source: 'playground-log', type: 'error', args: [e.message] }, '*');
                });
            </script>
        `;

        setSrcDoc(`
            <html>
                <head>
                    <style>${content.css}</style>
                    ${consoleInterceptor}
                </head>
                <body>
                    ${content.html}
                    <script>${content.js}</script>
                </body>
            </html>
        `);
    }, [content]);
    
    // Listen for logs from iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.source === 'playground-log' && ['log', 'warn', 'error'].includes(event.data.type)) {
                setLogs(prev => [...prev, event.data]);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);
    
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        isDragging.current = true;
        e.preventDefault();
    }, []);

    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging.current) return;
        const newWidth = (e.clientX / window.innerWidth) * 100;
        if(newWidth > 20 && newWidth < 80) { // Constrain width
             setEditorPaneWidth(newWidth);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);


    const handleContentChange = (language: 'html' | 'css' | 'js', value: string) => {
        setContent(prev => ({ ...prev, [language]: value }));
    };

    return (
        <div className="flex flex-col h-full bg-zinc-800 text-zinc-200">
             {!hideTitle && (
               <div className="flex-shrink-0 bg-zinc-900/80 backdrop-blur-sm p-4 border-b border-zinc-700 z-10">
                  <input
                    type="text"
                    value={canvas.title}
                    onChange={handleTitleChange}
                    placeholder="Playground Title"
                    className="text-2xl font-bold bg-transparent focus:outline-none w-full text-zinc-100"
                  />
               </div>
              )}
            <div className="flex-1 flex overflow-hidden">
                <div className="flex flex-col gap-px bg-zinc-700" style={{width: `${editorPaneWidth}%`}}>
                    <Editor header="HTML" language="html" value={content.html} onChange={(v) => handleContentChange('html', v)} />
                    <Editor header="CSS" language="css" value={content.css} onChange={(v) => handleContentChange('css', v)} />
                    <Editor header="JavaScript" language="javascript" value={content.js} onChange={(v) => handleContentChange('js', v)} />
                </div>
                <div onMouseDown={handleMouseDown} className="w-2 cursor-col-resize bg-zinc-700 hover:bg-blue-600 transition-colors"></div>
                <div className="flex-1 flex flex-col bg-zinc-800">
                    <iframe
                        srcDoc={srcDoc}
                        title="preview"
                        sandbox="allow-scripts allow-modals"
                        className="w-full flex-1 border-0 bg-white"
                    />
                    <div className="h-1/3 border-t-2 border-zinc-700 resize-y overflow-auto">
                       <CustomConsole logs={logs} onClear={() => setLogs([])} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaygroundPane;