
import React from 'react';
import { Block, BlockType } from '../../types';

interface HeadingBlockProps {
  block: Block;
  onUpdate: (block: Block) => void;
}

const HeadingBlock: React.FC<HeadingBlockProps> = ({ block, onUpdate }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...block, content: e.target.value });
  };

  return (
    <input
      type="text"
      value={block.content}
      onChange={handleChange}
      placeholder="Heading"
      className="w-full text-3xl font-bold bg-transparent focus:outline-none border-b-2 border-transparent focus:border-blue-500 py-2 text-zinc-900 dark:text-zinc-100"
    />
  );
};

export default HeadingBlock;
