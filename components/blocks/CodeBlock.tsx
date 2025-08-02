
import React, { useMemo, useState } from 'react';
import { Block } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../constants';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Clipboard } from 'lucide-react';


interface CodeData {
  language: string;
  code: string;
}

interface CodeBlockProps {
  block: Block;
  onUpdate: (block: Block) => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ block, onUpdate }) => {
  const [isCopied, setIsCopied] = useState(false);

  const codeData = useMemo((): CodeData => {
    try {
      const data = JSON.parse(block.content);
      return {
        language: SUPPORTED_LANGUAGES.includes(data.language) ? data.language : 'javascript',
        code: data.code || '',
      };
    } catch {
      // Fallback for old string-based content
      return { language: 'javascript', code: block.content };
    }
  }, [block.content]);

  const updateContent = (newData: Partial<CodeData>) => {
    onUpdate({ ...block, content: JSON.stringify({ ...codeData, ...newData }) });
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateContent({ language: e.target.value });
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateContent({ code: e.target.value });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeData.code).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    });
  };
  
  // Use a ref to sync scroll between textarea and highlighter
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
  const highlighterRef = React.useRef<SyntaxHighlighter>(null);
  
  const syncScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    if (highlighterRef.current) {
        const highlighterEl = (highlighterRef.current as any).el as HTMLElement;
        if(highlighterEl) {
           highlighterEl.scrollTop = target.scrollTop;
           highlighterEl.scrollLeft = target.scrollLeft;
        }
    }
  };


  return (
    <div className="bg-[#1e1e1e] rounded-lg overflow-hidden border border-zinc-700 group">
      <div className="flex justify-between items-center px-4 py-1.5 bg-zinc-900/50">
        <select
          value={codeData.language}
          onChange={handleLanguageChange}
          className="bg-transparent text-sm text-zinc-300 border-none focus:outline-none focus:ring-0 appearance-none"
        >
          {SUPPORTED_LANGUAGES.map(lang => (
            <option key={lang} value={lang} className="bg-zinc-800 text-white">{lang}</option>
          ))}
        </select>
         <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors disabled:cursor-not-allowed"
            disabled={isCopied}
        >
            {isCopied ? <Check size={14} className="text-green-500" /> : <Clipboard size={14} />}
            {isCopied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="relative text-sm font-mono" style={{fontFamily: '"Fira Code", monospace'}}>
         <SyntaxHighlighter
            ref={highlighterRef}
            language={codeData.language} 
            style={vscDarkPlus} 
            customStyle={{ margin: 0, background: '#1e1e1e', padding: '1rem', lineHeight: '1.6', overflow: 'hidden' }} 
            codeTagProps={{style:{fontFamily: 'inherit'}}}
            showLineNumbers={true}
          >
             {codeData.code + '\n'}
         </SyntaxHighlighter>
          <textarea
              ref={textAreaRef}
              value={codeData.code}
              onChange={handleCodeChange}
              onScroll={syncScroll}
              spellCheck="false"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              className="absolute top-0 left-0 w-full h-full p-4 bg-transparent text-transparent caret-white outline-none resize-none"
              style={{
                  fontFamily: 'inherit',
                  lineHeight: 1.6,
                  paddingLeft: '3.75em' // Adjust for line numbers
              }}
          />
      </div>
    </div>
  );
};

export default CodeBlock;