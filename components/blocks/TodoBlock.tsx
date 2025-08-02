import React, { useMemo } from 'react';
import { Block } from '../../types';

interface TodoBlockProps {
  block: Block;
  onUpdate: (block: Block) => void;
}

const TodoBlock: React.FC<TodoBlockProps> = ({ block, onUpdate }) => {
  const todoData = useMemo(() => {
    try {
      const data = JSON.parse(block.content);
      return {
        checked: typeof data.checked === 'boolean' ? data.checked : false,
        text: typeof data.text === 'string' ? data.text : '',
      };
    } catch {
      return { checked: false, text: '' };
    }
  }, [block.content]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newData = { ...todoData, text: e.target.value };
    onUpdate({ ...block, content: JSON.stringify(newData) });
  };
  
  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newData = { ...todoData, checked: e.target.checked };
    onUpdate({ ...block, content: JSON.stringify(newData) });
  };

  return (
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        checked={todoData.checked}
        onChange={handleCheckChange}
        className="w-5 h-5 rounded text-blue-500 bg-transparent border-gray-400/80 dark:bg-zinc-700 dark:border-zinc-600 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2"
      />
      <input
        type="text"
        value={todoData.text}
        onChange={handleTextChange}
        placeholder="To-do item"
        className={`w-full bg-transparent focus:outline-none ${todoData.checked ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-800 dark:text-zinc-200'}`}
      />
    </div>
  );
};

export default TodoBlock;