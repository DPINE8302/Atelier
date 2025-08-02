import React, { useRef, useEffect, useState } from 'react';
import { Block } from '../../types';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { Mic } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface TextBlockProps {
  block: Block;
  onUpdate: (block: Block) => void;
}

const TextBlock: React.FC<TextBlockProps> = ({ block, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef(block.content);

  useEffect(() => {
    contentRef.current = block.content;
  }, [block.content]);

  const { isListening, isAvailable, startListening, stopListening } = useSpeechRecognition({
    onTranscript: (transcript) => {
      const currentContent = contentRef.current || '';
      const newContent = (currentContent ? currentContent.trim() + ' ' : '') + transcript;
      onUpdate({ ...block, content: newContent });
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...block, content: e.target.value });
  };
  
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.focus();
    }
  }, [isEditing, block.content]);

  if (isEditing) {
    return (
      <div className="relative w-full">
        <textarea
          ref={textareaRef}
          value={block.content}
          onChange={handleChange}
          onBlur={() => setIsEditing(false)}
          placeholder="Type here, or use Markdown..."
          className="w-full bg-transparent focus:outline-none resize-none text-base leading-relaxed text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500"
          rows={1}
        />
        {isAvailable && (
          <button
            onClick={() => isListening ? stopListening() : startListening()}
            title={isListening ? 'Stop dictation' : 'Start dictation'}
            className={`absolute bottom-0 right-0 p-2 rounded-full transition-colors ${
                isListening 
                ? 'text-red-500 bg-red-100/50 dark:bg-red-900/50' 
                : 'text-zinc-500 hover:bg-gray-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Mic size={16} className={isListening ? 'animate-pulse' : ''} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="w-full min-h-[2.5rem] cursor-text markdown-content text-zinc-800 dark:text-zinc-200"
    >
      {block.content ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {block.content}
        </ReactMarkdown>
      ) : (
        <p className="text-zinc-400 dark:text-zinc-500">Type here, or use Markdown...</p>
      )}
    </div>
  );
};

export default TextBlock;