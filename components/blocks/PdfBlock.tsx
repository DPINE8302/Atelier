import React, { useRef } from 'react';
import { Block } from '../../types';
import { File as FileIcon, UploadCloud, X } from 'lucide-react';

interface PdfBlockProps {
  block: Block;
  onUpdate: (block: Block) => void;
}

const PdfBlock: React.FC<PdfBlockProps> = ({ block, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ ...block, content: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePdf = () => {
    onUpdate({ ...block, content: '' });
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
      />
      {block.content ? (
        <div className="relative group">
            <embed src={block.content} type="application/pdf" className="w-full h-[600px] rounded-lg border border-gray-200 dark:border-zinc-700" />
            <button
                onClick={handleRemovePdf}
                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
            >
                <X size={16} />
            </button>
        </div>
      ) : (
        <div
          onClick={handleUploadClick}
          className="w-full border-2 border-dashed border-gray-300/80 dark:border-zinc-600 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-black/5 dark:hover:bg-zinc-800/50 transition-colors"
        >
          <UploadCloud size={48} className="mx-auto text-gray-400 dark:text-zinc-500 mb-2" />
          <p className="font-semibold text-zinc-700 dark:text-zinc-300">Click to upload a PDF</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Embed a PDF document to view it here.</p>
        </div>
      )}
    </div>
  );
};

export default PdfBlock;