import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Project, Canvas, BlockType, CanvasType } from '../types';
import { FileText, Plus, Trash2, Pin, Search, Code, ChevronDown } from 'lucide-react';

interface NotebookPaneProps {
  project: Project;
  activeCanvasId: string | null;
  onSelectCanvas: (id: string) => void;
  onAddCanvas: (type: CanvasType) => void;
  onDeleteCanvas: (id: string) => void;
  onTogglePinCanvas: (id: string) => void;
  hideHeader?: boolean;
}

const AddCanvasMenu: React.FC<{ onAddCanvas: (type: CanvasType) => void }> = ({ onAddCanvas }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);


  const handleSelect = (type: CanvasType) => {
    onAddCanvas(type);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 p-1 text-zinc-500 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-500 transition-colors rounded-full hover:bg-black/5 dark:hover:bg-zinc-700"
      >
        <Plus size={20} />
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 shadow-lg rounded-lg border border-gray-200 dark:border-zinc-700 p-1 z-10">
          <button onClick={() => handleSelect(CanvasType.NOTE)} className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-zinc-700 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-md">
            <FileText size={16} /> New Note
          </button>
          <button onClick={() => handleSelect(CanvasType.PLAYGROUND)} className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-zinc-700 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-md">
            <Code size={16} /> New Playground
          </button>
        </div>
      )}
    </div>
  );
};


const getPreviewText = (canvas: Canvas): string => {
  if (canvas.type === CanvasType.PLAYGROUND) {
    return 'HTML/CSS/JS Playground';
  }

  if (!canvas.blocks || canvas.blocks.length === 0) return 'No content';

  const firstText = canvas.blocks.find(b => b.type === BlockType.TEXT || b.type === BlockType.HEADING);
  if (firstText) {
    if (firstText.type === BlockType.HEADING) return `H: ${firstText.content}`;
    return firstText.content.substring(0, 100);
  }
  const firstBlock = canvas.blocks[0];
  if(firstBlock) {
      if(firstBlock.type === BlockType.TODO) {
         try {
            return JSON.parse(firstBlock.content).text || `[${firstBlock.type.toLowerCase()} block]`;
         } catch { return `[${firstBlock.type.toLowerCase()} block]`; }
      }
      return `[${firstBlock.type.toLowerCase()} block]`;
  }
  return 'No content';
};


const NotebookPane: React.FC<NotebookPaneProps> = ({ project, activeCanvasId, onSelectCanvas, onAddCanvas, onDeleteCanvas, onTogglePinCanvas, hideHeader = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const sortedCanvases = useMemo(() => 
    [...(project.canvases || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  [project.canvases]);
  
  const filteredCanvases = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) {
        return sortedCanvases;
    }
    return sortedCanvases.filter(canvas => {
        const titleMatch = canvas.title.toLowerCase().includes(term);
        const contentMatch = canvas.blocks && canvas.blocks.some(block => {
            let contentToSearch = '';
            try {
                if (block.type === BlockType.CODE) {
                    contentToSearch = JSON.parse(block.content).code || '';
                } else if (block.type === BlockType.TODO) {
                    contentToSearch = JSON.parse(block.content).text || '';
                } else {
                    contentToSearch = block.content;
                }
            } catch {
                contentToSearch = block.content; // Fallback for malformed JSON
            }
            return contentToSearch.toLowerCase().includes(term);
        });
        return titleMatch || contentMatch;
    });
  }, [sortedCanvases, searchTerm]);

  const pinnedCanvases = filteredCanvases.filter(c => c.isPinned);
  const unpinnedCanvases = filteredCanvases.filter(c => !c.isPinned);

  const renderCanvasItem = (canvas: Canvas) => (
    <li key={canvas.id} className="mb-1 group">
      <button
        onClick={() => onSelectCanvas(canvas.id)}
        className={`w-full text-left p-3 rounded-lg transition-colors ${
          activeCanvasId === canvas.id
            ? 'bg-blue-100 dark:bg-blue-900/50'
            : 'hover:bg-black/5 dark:hover:bg-zinc-700/50'
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2.5 min-w-0">
             {canvas.type === CanvasType.PLAYGROUND 
                ? <Code size={14} className="text-zinc-500 dark:text-zinc-400 flex-shrink-0" /> 
                : <FileText size={14} className="text-zinc-500 dark:text-zinc-400 flex-shrink-0" />
             }
            <h3 className="font-semibold text-sm text-zinc-800 dark:text-zinc-100 truncate">
                {canvas.title}
            </h3>
          </div>
          <div className={`flex items-center -mr-2 -mt-1 flex-shrink-0 transition-opacity ${activeCanvasId === canvas.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <button 
                  onClick={(e) => { e.stopPropagation(); onTogglePinCanvas(canvas.id); }}
                  className="p-1 text-zinc-400 dark:text-zinc-400 hover:text-yellow-500 dark:hover:text-yellow-400"
                  title={canvas.isPinned ? "Unpin" : "Pin"}
                  aria-label={canvas.isPinned ? "Unpin" : "Pin"}
              >
                  <Pin size={14} className={canvas.isPinned ? 'fill-current text-yellow-500' : ''} />
              </button>
              <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteCanvas(canvas.id); }}
                  className="p-1 text-zinc-400 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-500"
                  title="Delete"
                  aria-label="Delete"
              >
                  <Trash2 size={14} />
              </button>
          </div>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate pl-[26px] pr-4">
          {getPreviewText(canvas)}
        </p>
      </button>
    </li>
  );

  return (
    <div className="h-full flex flex-col">
      {!hideHeader && (
        <div className="p-4 pt-3 border-b border-gray-200/80 dark:border-zinc-700">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold truncate text-zinc-800 dark:text-zinc-200">{project.name}</h2>
            <AddCanvasMenu onAddCanvas={onAddCanvas} />
          </div>
          <div className="relative">
              <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/5 dark:bg-zinc-700/70 rounded-md py-1.5 pl-8 pr-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredCanvases.length > 0 ? (
          <>
            {pinnedCanvases.length > 0 && (
                <div className="px-3 pt-2 pb-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Pinned</div>
            )}
            <ul>
              {pinnedCanvases.map(renderCanvasItem)}
            </ul>

            {unpinnedCanvases.length > 0 && pinnedCanvases.length > 0 && (
                <div className="px-3 pt-4 pb-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Notes</div>
            )}
            <ul>
              {unpinnedCanvases.map(renderCanvasItem)}
            </ul>
          </>
        ) : (
          <div className="text-center text-zinc-500 dark:text-zinc-400 pt-16 px-4">
            <FileText size={32} className="mx-auto mb-2 text-zinc-400" />
            <p className="text-sm">{searchTerm ? 'No results found' : 'This project is empty.'}</p>
            <p className="text-xs">{searchTerm ? `No canvases matched "${searchTerm}".` : 'Add a canvas to get started.'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotebookPane;