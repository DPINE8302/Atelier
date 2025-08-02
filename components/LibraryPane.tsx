import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Project } from '../types';
import { Folder, Plus, Trash2, FolderPlus, ChevronRight, MoreHorizontal, Upload, Download } from 'lucide-react';

const ProjectItemMenu: React.FC<{
  onExport: () => void;
  onDelete: () => void;
  onClose: () => void;
}> = ({ onExport, onDelete, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div ref={menuRef} className="absolute top-full right-0 mt-1 w-40 bg-white dark:bg-zinc-800 shadow-lg rounded-lg border border-gray-200 dark:border-zinc-700 p-1 z-20">
            <button
                onClick={onExport}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-zinc-700 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-md"
            >
                <Download size={14} /> Export
            </button>
            <button
                onClick={onDelete}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-md"
            >
                <Trash2 size={14} /> Delete
            </button>
        </div>
    )
}

interface ProjectItemProps {
  project: Project & { children: any[] };
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onAddProject: (parentId: string | null) => void;
  onDeleteProject: (id: string) => void;
  onRenameProject: (id: string, newName: string) => void;
  onExportProject: (id: string) => void;
  level: number;
}

const ProjectItem: React.FC<ProjectItemProps> = ({ project, activeProjectId, onSelectProject, onAddProject, onDeleteProject, onRenameProject, onExportProject, level }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [name, setName] = useState(project.name);

    const handleRename = () => {
        if (name.trim()) {
            onRenameProject(project.id, name.trim());
        } else {
            setName(project.name); // Revert if empty
        }
        setIsEditing(false);
    };

    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useEffect(() => {
        if(isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const isActive = activeProjectId === project.id;
    const baseClasses = 'group w-full flex items-center gap-1.5 pr-2 rounded-md transition-colors';
    const activeClasses = 'bg-blue-500 text-white';
    const inactiveClasses = 'hover:bg-black/5 dark:hover:bg-zinc-700/50';

    return (
        <div>
            <div
                className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                style={{ paddingLeft: `${level * 16 + 4}px` }}
                onDoubleClick={() => setIsEditing(true)}
            >
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`p-0.5 rounded ${project.children.length === 0 ? 'invisible' : ''} ${isActive ? 'hover:bg-white/20' : 'text-zinc-500 hover:bg-gray-400/50 dark:text-zinc-400 dark:hover:bg-zinc-600'}`}
                >
                    <ChevronRight size={14} className={`transform transition-transform ${isExpanded ? 'rotate-90' : 'rotate-0'}`} />
                </button>
                <Folder size={16} className={`flex-shrink-0 ${isActive ? 'text-white/90' : 'text-zinc-600 dark:text-zinc-300'}`} />
                
                {isEditing ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                        className="w-full bg-transparent outline-none focus:ring-1 focus:ring-blue-400 rounded-sm px-1 -ml-1"
                    />
                ) : (
                    <button onClick={() => onSelectProject(project.id)} className="flex-1 text-left truncate text-sm py-1.5">
                        {project.name}
                    </button>
                )}
                
                <div className={`flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${isEditing ? '!opacity-0' : ''}`}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onAddProject(project.id); }}
                        className={`p-1 rounded ${isActive ? 'hover:bg-white/20' : 'text-zinc-500 hover:bg-gray-400/50 dark:text-zinc-400 dark:hover:bg-zinc-600'}`}
                        title="Add subfolder"
                    >
                        <FolderPlus size={14} />
                    </button>
                    <div className="relative">
                        <button
                            onClick={(e) => { e.stopPropagation(); setMenuOpen(true); }}
                            className={`p-1 rounded ${isActive ? 'hover:bg-white/20' : 'text-zinc-500 hover:bg-gray-400/50 dark:text-zinc-400 dark:hover:bg-zinc-600'}`}
                            title="More options"
                        >
                            <MoreHorizontal size={14} />
                        </button>
                        {isMenuOpen && (
                            <ProjectItemMenu 
                                onExport={() => { onExportProject(project.id); setMenuOpen(false); }}
                                onDelete={() => { onDeleteProject(project.id); setMenuOpen(false); }}
                                onClose={() => setMenuOpen(false)}
                            />
                        )}
                    </div>
                </div>
            </div>
            {isExpanded && project.children.length > 0 && (
                <div className="mt-1">
                    {project.children.map(child => (
                        <ProjectItem
                            key={child.id}
                            project={child}
                            activeProjectId={activeProjectId}
                            onSelectProject={onSelectProject}
                            onAddProject={onAddProject}
                            onDeleteProject={onDeleteProject}
                            onRenameProject={onRenameProject}
                            onExportProject={onExportProject}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

interface LibraryPaneProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onAddProject: (parentId: string | null) => void;
  onDeleteProject: (id: string) => void;
  onRenameProject: (id: string, newName: string) => void;
  onExportProject: (id: string) => void;
  onImportProject: (jsonString: string) => void;
  isSaving: boolean;
}

const LibraryPane: React.FC<LibraryPaneProps> = ({ projects, activeProjectId, onSelectProject, onAddProject, onDeleteProject, onRenameProject, onExportProject, onImportProject, isSaving }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const projectTree = useMemo(() => {
    const projectMap = new Map(projects.map(p => [p.id, { ...p, children: [] }]));
    const tree: any[] = [];
    
    projects.forEach(p => {
        const projectNode = projectMap.get(p.id);
        if(!projectNode) return;

        if (p.parentId && projectMap.has(p.parentId)) {
            const parent = projectMap.get(p.parentId);
            if(parent) parent.children.push(projectNode);
        } else {
            tree.push(projectNode);
        }
    });
    return tree;
  }, [projects]);

  const saveStatusText = isSaving ? 'Saving...' : 'Saved';

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportProject(content);
      }
      // Reset file input to allow importing the same file again
      if (e.target) e.target.value = '';
    };
    reader.onerror = () => {
        alert("Error reading file.");
    }
    reader.readAsText(file);
  };


  return (
    <div className="w-64 bg-[#F0F0F0]/50 dark:bg-zinc-800/50 backdrop-blur-lg border-r border-[#D9D9D9] dark:border-zinc-700/50 flex flex-col">
       <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept=".json,application/json" />
      <div className="p-2 space-y-4 flex-1 flex flex-col min-h-0">
        <div className="px-2 pt-2">
           <h1 className="text-2xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-100">Atelier</h1>
           <p className="text-xs text-zinc-500 dark:text-zinc-400">Your Personal Digital Workshop</p>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          <h2 className="px-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Projects</h2>
          <div className="space-y-1">
            {projectTree.map(project => (
              <ProjectItem
                key={project.id}
                project={project}
                activeProjectId={activeProjectId}
                onSelectProject={onSelectProject}
                onAddProject={onAddProject}
                onDeleteProject={onDeleteProject}
                onRenameProject={onRenameProject}
                onExportProject={onExportProject}
                level={0}
              />
            ))}
          </div>
        </div>

        <div className="p-2 border-t border-[#D9D9D9] dark:border-zinc-700/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddProject(null)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-black/5 dark:bg-zinc-700/60 hover:bg-black/10 dark:hover:bg-zinc-700 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-200 transition-colors"
            >
              <Plus size={16} />
              New Project
            </button>
            <button
              onClick={handleImportClick}
              title="Import Project"
              className="p-2 bg-black/5 dark:bg-zinc-700/60 hover:bg-black/10 dark:hover:bg-zinc-700 rounded-md text-zinc-700 dark:text-zinc-200 transition-colors"
            >
               <Upload size={16} />
            </button>
          </div>
        </div>
      </div>
      <footer className="px-4 py-3 flex justify-between items-center border-t border-[#D9D9D9] dark:border-zinc-700/50">
         <div className={`text-xs transition-opacity duration-300 ${isSaving ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-zinc-500 dark:text-zinc-400">{saveStatusText}</p>
         </div>
         <div className="text-right">
             <p className="text-xs text-zinc-500 dark:text-zinc-400">Made with 🤍 by Win.</p>
             <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">© 2025 Wiqnnc_. All Rights Reserved.</p>
         </div>
      </footer>
    </div>
  );
};

export default LibraryPane;