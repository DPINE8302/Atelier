import React, { useState, useRef } from 'react';
import { Canvas, Block, BlockType, PlaygroundContent, CanvasType } from '../types';
import TextBlock from './blocks/TextBlock';
import CodeBlock from './blocks/CodeBlock';
import HeadingBlock from './blocks/HeadingBlock';
import TodoBlock from './blocks/TodoBlock';
import ImageBlock from './blocks/ImageBlock';
import PdfBlock from './blocks/PdfBlock';
import PlaygroundPane from './PlaygroundPane';
import { Plus, Code, Type, Image as ImageIcon, ListTodo, File as FileIcon, Trash2, GripVertical } from 'lucide-react';

interface CanvasPaneProps {
  canvas: Canvas;
  onUpdateBlock: (canvasId: string, block: Block) => void;
  onAddBlock: (canvasId: string, type: BlockType) => void;
  onDeleteBlock: (canvasId: string, blockId: string) => void;
  onUpdateTitle: (canvasId: string, newTitle: string) => void;
  onReorderBlocks: (canvasId: string, startIndex: number, endIndex: number) => void;
  onUpdatePlaygroundContent: (canvasId: string, content: PlaygroundContent) => void;
  hideTitle?: boolean;
}

const BlockWrapper: React.FC<{
  children: React.ReactNode;
  onDelete: () => void;
  isDraggable: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
}> = ({ children, onDelete, isDraggable, onDragStart, onDragEnter, onDragEnd }) => {
  return (
    <div className="group relative py-2 flex items-start gap-2"
        draggable={isDraggable}
        onDragStart={onDragStart}
        onDragEnter={onDragEnter}
        onDragEnd={onDragEnd}
        onDragOver={(e) => e.preventDefault()}
    >
        <div className="opacity-0 group-hover:opacity-50 transition-opacity cursor-grab" title="Drag to reorder">
            <GripVertical size={18} className="text-zinc-400 -ml-1 mt-1"/>
        </div>
      <div className="flex-1">{children}</div>
      <button
        onClick={onDelete}
        className="absolute top-1/2 -right-8 -translate-y-1/2 p-1.5 rounded-full bg-white dark:bg-zinc-700 text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all border border-gray-200/80 dark:border-transparent"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};


const AddBlockMenu: React.FC<{ onAddBlock: (type: BlockType) => void }> = ({ onAddBlock }) => {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { type: BlockType.HEADING, label: 'Heading', icon: Type },
    { type: BlockType.TEXT, label: 'Text', icon: Type },
    { type: BlockType.TODO, label: 'To-Do', icon: ListTodo },
    { type: BlockType.CODE, label: 'Code', icon: Code },
    { type: BlockType.IMAGE, label: 'Image', icon: ImageIcon },
    { type: BlockType.PDF, label: 'PDF', icon: FileIcon },
  ];

  return (
    <div className="relative my-4 flex justify-center">
       <div className="w-full border-t border-dashed border-gray-300/80 dark:border-zinc-700"></div>
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="absolute -top-4 p-2 bg-[#FBFBFA] dark:bg-zinc-900/80 rounded-full border border-gray-200/80 dark:border-zinc-700 text-zinc-500 hover:text-blue-500 hover:border-blue-500 transition-all"
        >
            <Plus size={16} />
        </button>
      {isOpen && (
        <div className="absolute top-8 z-10 w-48 bg-white dark:bg-zinc-800 shadow-lg rounded-lg border border-gray-200 dark:border-zinc-700 p-1">
          {options.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => {
                onAddBlock(type);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-zinc-700 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-md"
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CanvasPane: React.FC<CanvasPaneProps> = ({ canvas, onUpdateBlock, onAddBlock, onDeleteBlock, onUpdateTitle, onReorderBlocks, onUpdatePlaygroundContent, hideTitle = false }) => {
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleUpdate = (block: Block) => {
    onUpdateBlock(canvas.id, block);
  };
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdateTitle(canvas.id, e.target.value);
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragItem.current = index;
    e.currentTarget.classList.add('opacity-40');
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    dragOverItem.current = index;
    e.currentTarget.classList.add('bg-blue-100/50', 'dark:bg-blue-900/30', 'rounded-lg');
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
      e.currentTarget.classList.remove('bg-blue-100/50', 'dark:bg-blue-900/30', 'rounded-lg');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-40');
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
        onReorderBlocks(canvas.id, dragItem.current, dragOverItem.current);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  if (canvas.type === CanvasType.PLAYGROUND) {
    return (
        <PlaygroundPane
            canvas={canvas}
            onUpdateContent={onUpdatePlaygroundContent}
            onUpdateTitle={onUpdateTitle}
            hideTitle={hideTitle}
        />
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {!hideTitle && (
       <div className="sticky top-0 bg-[#FBFBFA]/80 dark:bg-zinc-900/80 backdrop-blur-sm p-4 border-b border-gray-200/80 dark:border-zinc-700 z-10">
          <input
            type="text"
            value={canvas.title}
            onChange={handleTitleChange}
            placeholder="Canvas Title"
            className="text-2xl font-bold bg-transparent focus:outline-none w-full text-zinc-900 dark:text-zinc-100"
          />
       </div>
      )}

      <div className="max-w-3xl mx-auto px-4 lg:px-8 pt-6 pb-24" onDrop={handleDragEnd}>
        {(canvas.blocks || []).map((block, index) => (
          <div key={block.id} onDragLeave={handleDragLeave}>
              <BlockWrapper 
                onDelete={() => onDeleteBlock(canvas.id, block.id)}
                isDraggable={true}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
              >
                {block.type === BlockType.TEXT && <TextBlock block={block} onUpdate={handleUpdate} />}
                {block.type === BlockType.CODE && <CodeBlock block={block} onUpdate={handleUpdate} />}
                {block.type === BlockType.HEADING && <HeadingBlock block={block} onUpdate={handleUpdate} />}
                {block.type === BlockType.TODO && <TodoBlock block={block} onUpdate={handleUpdate} />}
                {block.type === BlockType.IMAGE && <ImageBlock block={block} onUpdate={handleUpdate} />}
                {block.type === BlockType.PDF && <PdfBlock block={block} onUpdate={handleUpdate} />}
              </BlockWrapper>
          </div>
        ))}
        <AddBlockMenu onAddBlock={(type) => onAddBlock(canvas.id, type)} />
      </div>
    </div>
  );
};

export default CanvasPane;