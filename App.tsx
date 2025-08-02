import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Project, Canvas, Block, BlockType, CanvasType, PlaygroundContent } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useMediaQuery } from './hooks/useMediaQuery';
import { useTheme } from './hooks/useTheme';
import LibraryPane from './components/LibraryPane';
import NotebookPane from './components/NotebookPane';
import CanvasPane from './components/CanvasPane';
import { Plus, Folder, FileText, Menu, ArrowLeft, Code, Sun, Moon, Expand, Minimize } from 'lucide-react';
import { initialData } from './constants';

const AppHeader: React.FC<{
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  isFocusMode: boolean;
  setFocusMode: (isFocus: boolean) => void;
  isDesktop: boolean;
}> = ({ theme, setTheme, isFocusMode, setFocusMode, isDesktop }) => {
  const isSystemDark = useMediaQuery('(prefers-color-scheme: dark)');
  const effectiveTheme = theme === 'system' ? (isSystemDark ? 'dark' : 'light') : theme;
  
  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('light');
    else { // system
       // When toggling from 'system', pick the opposite of the current effective theme
       setTheme(effectiveTheme === 'dark' ? 'light' : 'dark');
    }
  };

  return (
    <div className="absolute top-2 right-2 z-50">
        <div className="flex items-center gap-2">
            {isDesktop && (
                <button 
                    onClick={() => setFocusMode(!isFocusMode)} 
                    className="p-2 rounded-full bg-white/50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-zinc-700/70 backdrop-blur-sm"
                    title={isFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
                >
                    {isFocusMode ? <Minimize size={16} /> : <Expand size={16} />}
                </button>
            )}
             <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full bg-white/50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-zinc-700/70 backdrop-blur-sm"
                title="Toggle Theme"
            >
                {effectiveTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
        </div>
    </div>
  );
};

const regenerateIds = (projectsToImport: Project[]): Project[] => {
    const idMap = new Map<string, string>();
    // Deep copy to avoid mutating the original object from the file reader
    const regeneratedProjects: Project[] = JSON.parse(JSON.stringify(projectsToImport));

    // First pass: generate new IDs for all projects, canvases, and blocks
    regeneratedProjects.forEach(p => {
        const oldId = p.id;
        const newId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        idMap.set(oldId, newId);
        p.id = newId;

        (p.canvases || []).forEach(c => {
            const oldCanvasId = c.id;
            const newCanvasId = `canvas_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            idMap.set(oldCanvasId, newCanvasId);
            c.id = newCanvasId;

            (c.blocks || []).forEach(b => {
                const oldBlockId = b.id;
                const newBlockId = `block_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
                idMap.set(oldBlockId, newBlockId);
                b.id = newBlockId;
            });
        });
    });

    // Second pass: update parentId references to the new IDs
    regeneratedProjects.forEach(p => {
        if (p.parentId && idMap.has(p.parentId)) {
            p.parentId = idMap.get(p.parentId) || null;
        } else {
            // If the parentId is not in the imported batch, it becomes a root project.
            p.parentId = null;
        }
    });

    return regeneratedProjects;
};


const App: React.FC = () => {
  const [projects, setProjects, isSaving] = useLocalStorage<Project[]>('atelier-projects', initialData);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(projects.length > 0 ? projects[0].id : null);
  const [activeCanvasId, setActiveCanvasId] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const [isFocusMode, setFocusMode] = useState(false);

  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [isLibraryOpen, setLibraryOpen] = useState(false);

  useEffect(() => {
    setLibraryOpen(isDesktop);
  }, [isDesktop]);
  
   // Data migration for users with old data structure
  useEffect(() => {
    const needsMigration = projects.some(p => p.canvases.some(c => c.type === undefined));
    if (needsMigration) {
      console.log("Migrating data to new version...");
      setProjects(prevProjects =>
        prevProjects.map(project => ({
          ...project,
          canvases: project.canvases.map(canvas => ({
            ...canvas,
            type: canvas.type || CanvasType.NOTE,
            blocks: canvas.blocks || [],
            playgroundContent: canvas.playgroundContent || { html: '', css: '', js: '' }
          }))
        }))
      );
    }
  }, []); // Run only once on initial load

  const activeProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId), 
    [projects, activeProjectId]
  );

  const activeCanvas = useMemo(() => 
    activeProject?.canvases.find(c => c.id === activeCanvasId),
    [activeProject, activeCanvasId]
  );
  
  React.useEffect(() => {
    if (activeProject && !activeCanvasId) {
      if (activeProject.canvases.length > 0) {
        if (isDesktop) {
           setActiveCanvasId(activeProject.canvases[0].id);
        }
      }
    } else if (activeProject && activeCanvasId) {
        const canvasExists = activeProject.canvases.some(c => c.id === activeCanvasId);
        if (!canvasExists) {
             setActiveCanvasId(activeProject.canvases.length > 0 ? activeProject.canvases[0].id : null);
        }
    } else if (!activeProject && projects.length > 0) {
      setActiveProjectId(projects[0].id);
    }
  }, [activeProject, activeCanvasId, isDesktop, projects]);


  const handleAddProject = useCallback((parentId: string | null = null) => {
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      name: `New Project`,
      canvases: [],
      parentId,
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
    setActiveCanvasId(null);
    if (!isDesktop) setLibraryOpen(false);
  }, [setProjects, isDesktop]);

  const handleRenameProject = useCallback((projectId: string, newName: string) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, name: newName } : p));
  }, [setProjects]);

  const handleDeleteProject = useCallback((projectId: string) => {
      const projectsToDelete = new Set<string>();
      const findChildren = (id: string) => {
          projectsToDelete.add(id);
          projects.forEach(p => {
              if (p.parentId === id) {
                  findChildren(p.id);
              }
          });
      };
      findChildren(projectId);

      const remainingProjects = projects.filter(p => !projectsToDelete.has(p.id));
      setProjects(remainingProjects);
      
      if (projectsToDelete.has(activeProjectId)) {
          const newActiveProject = remainingProjects.length > 0 ? remainingProjects.find(p => p.parentId === null) || remainingProjects[0] : null;
          setActiveProjectId(newActiveProject?.id ?? null);
          setActiveCanvasId(newActiveProject?.canvases[0]?.id ?? null);
      }
  }, [activeProjectId, projects, setProjects]);

  const handleExportProject = useCallback((projectId: string) => {
    const projectsToExportIds = new Set<string>();
    const findChildrenRecursive = (id: string) => {
        projectsToExportIds.add(id);
        projects.forEach(p => {
            if (p.parentId === id) findChildrenRecursive(p.id);
        });
    };
    findChildrenRecursive(projectId);

    const projectData = projects.filter(p => projectsToExportIds.has(p.id));
    const rootProject = projects.find(p => p.id === projectId);
    
    if (projectData.length > 0) {
        const jsonString = JSON.stringify(projectData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `atelier-export-${rootProject?.name.replace(/\s+/g, '_').toLowerCase() || 'project'}.json`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } else {
        alert("Could not find project to export.");
    }
  }, [projects]);
  
  const handleImportProject = useCallback((jsonString: string) => {
    try {
        const importedData = JSON.parse(jsonString);
        if (!Array.isArray(importedData) || importedData.length === 0) {
            alert('Invalid or empty project file.');
            return;
        }
        // Basic validation: check for 'id' and 'name' on the first project
        if (!('id' in importedData[0] && 'name' in importedData[0] && 'canvases' in importedData[0])) {
             alert('Invalid project file format. Does not appear to be an Atelier export.');
            return;
        }
        
        const newProjects = regenerateIds(importedData);
        setProjects(prev => [...prev, ...newProjects]);
        alert(`${newProjects.length} project(s) imported successfully!`);
    } catch (error) {
        console.error('Failed to import project:', error);
        alert('Failed to import project. The file may be corrupt or not a valid Atelier export.');
    }
  }, [setProjects]);


  const handleAddCanvas = useCallback((type: CanvasType) => {
    if (!activeProjectId) return;
    
    let newCanvas: Canvas;

    if (type === CanvasType.NOTE) {
        newCanvas = {
            id: `canvas_${Date.now()}`,
            title: 'Untitled Note',
            type: CanvasType.NOTE,
            blocks: [{ type: BlockType.HEADING, content: 'New Note', id: `block_${Date.now()}` }],
            createdAt: new Date().toISOString(),
        }
    } else { // PLAYGROUND
        newCanvas = {
            id: `canvas_${Date.now()}`,
            title: 'New Playground',
            type: CanvasType.PLAYGROUND,
            playgroundContent: { html: '<h1>Hello, World!</h1>', css: 'h1 { color: blue; }', js: 'console.log("Hello from the playground!");' },
            createdAt: new Date().toISOString(),
        }
    }

    setProjects(prev =>
      prev.map(p =>
        p.id === activeProjectId
          ? { ...p, canvases: [newCanvas, ...p.canvases] }
          : p
      )
    );
    setActiveCanvasId(newCanvas.id);
  }, [activeProjectId, setProjects]);
  
  const handleDeleteCanvas = useCallback((canvasId: string) => {
    if (!activeProjectId) return;
    setProjects(prev => prev.map(p => {
        if (p.id === activeProjectId) {
            return { ...p, canvases: p.canvases.filter(c => c.id !== canvasId) };
        }
        return p;
    }));
    if (activeCanvasId === canvasId) {
        const project = projects.find(p => p.id === activeProjectId);
        const remainingCanvases = project?.canvases.filter(c => c.id !== canvasId);
        setActiveCanvasId(remainingCanvases && remainingCanvases.length > 0 ? remainingCanvases[0].id : null);
    }
  }, [activeProjectId, activeCanvasId, projects, setProjects]);

  const handleTogglePinCanvas = useCallback((canvasId: string) => {
    if (!activeProjectId) return;
    setProjects(prev => prev.map(p => {
        if (p.id === activeProjectId) {
            return { 
                ...p, 
                canvases: p.canvases.map(c => 
                    c.id === canvasId 
                        ? {...c, isPinned: !c.isPinned} 
                        : c
                ) 
            };
        }
        return p;
    }));
  }, [activeProjectId, setProjects]);

  const updateBlock = useCallback((canvasId: string, block: Block) => {
    if (!activeProjectId) return;

    setProjects(prevProjects => {
      return prevProjects.map(project => {
        if (project.id === activeProjectId) {
          return {
            ...project,
            canvases: project.canvases.map(canvas => {
              if (canvas.id === canvasId && canvas.blocks) {
                return {
                  ...canvas,
                  blocks: canvas.blocks.map(b => (b.id === block.id ? block : b)),
                };
              }
              return canvas;
            }),
          };
        }
        return project;
      });
    });
  }, [activeProjectId, setProjects]);

  const addBlock = useCallback((canvasId: string, type: BlockType) => {
    if (!activeProjectId) return;

    const newBlock: Block = {
      id: `block_${Date.now()}`,
      type,
      content: type === BlockType.CODE ? '{"language":"javascript","code":"// Start coding..."}' : '',
    };

    setProjects(prev =>
      prev.map(p =>
        p.id === activeProjectId
          ? {
              ...p,
              canvases: p.canvases.map(c =>
                (c.id === canvasId && c.blocks) ? { ...c, blocks: [...c.blocks, newBlock] } : c
              ),
            }
          : p
      )
    );
  }, [activeProjectId, setProjects]);

  const deleteBlock = useCallback((canvasId: string, blockId: string) => {
    if (!activeProjectId) return;
    setProjects(prev =>
      prev.map(p =>
        p.id === activeProjectId
          ? {
              ...p,
              canvases: p.canvases.map(c =>
                (c.id === canvasId && c.blocks)
                  ? { ...c, blocks: c.blocks.filter(b => b.id !== blockId) }
                  : c
              ),
            }
          : p
      )
    );
  }, [activeProjectId, setProjects]);
  
  const reorderBlocks = useCallback((canvasId: string, startIndex: number, endIndex: number) => {
    if (!activeProjectId) return;
    setProjects(prev => prev.map(p => {
        if (p.id === activeProjectId) {
            const canvasToUpdate = p.canvases.find(c => c.id === canvasId);
            if (!canvasToUpdate || !canvasToUpdate.blocks) return p;

            const reorderedBlocks = Array.from(canvasToUpdate.blocks);
            const [removed] = reorderedBlocks.splice(startIndex, 1);
            reorderedBlocks.splice(endIndex, 0, removed);
            
            return { 
                ...p, 
                canvases: p.canvases.map(c => 
                    c.id === canvasId ? { ...c, blocks: reorderedBlocks } : c
                ) 
            };
        }
        return p;
    }));
  }, [activeProjectId, setProjects]);
  
  const updateCanvasTitle = useCallback((canvasId: string, newTitle: string) => {
      if (!activeProjectId) return;
      setProjects(prev => prev.map(p => {
          if (p.id === activeProjectId) {
              return { ...p, canvases: p.canvases.map(c => c.id === canvasId ? {...c, title: newTitle} : c) };
          }
          return p;
      }));
  }, [activeProjectId, setProjects]);

  const handleUpdatePlaygroundContent = useCallback((canvasId: string, content: PlaygroundContent) => {
      if (!activeProjectId) return;
      setProjects(prev => prev.map(p => {
          if (p.id === activeProjectId) {
              return { ...p, canvases: p.canvases.map(c => (c.id === canvasId && c.type === CanvasType.PLAYGROUND) ? {...c, playgroundContent: content } : c) };
          }
          return p;
      }));
  }, [activeProjectId, setProjects]);


  const handleSelectProject = (id: string) => {
    setActiveProjectId(id);
    setActiveCanvasId(null);
    if (!isDesktop) {
        setLibraryOpen(false);
    }
  };

  const handleSelectCanvas = (id: string) => {
      setActiveCanvasId(id);
  }

  if (isDesktop) {
    return (
      <div className="h-screen w-screen text-zinc-800 dark:text-zinc-200 flex overflow-hidden font-sans relative">
         <AppHeader 
            theme={theme}
            setTheme={setTheme}
            isFocusMode={isFocusMode}
            setFocusMode={setFocusMode}
            isDesktop={isDesktop}
         />
        <div className={`${isFocusMode ? 'hidden' : 'flex'}`}>
            <LibraryPane
                projects={projects}
                activeProjectId={activeProjectId}
                onSelectProject={handleSelectProject}
                onAddProject={handleAddProject}
                onDeleteProject={handleDeleteProject}
                onRenameProject={handleRenameProject}
                onExportProject={handleExportProject}
                onImportProject={handleImportProject}
                isSaving={isSaving}
            />
        </div>

        <div className={`flex-shrink-0 w-[320px] bg-[#F7F7F7]/70 dark:bg-zinc-800/70 backdrop-blur-lg border-r border-gray-200/80 dark:border-zinc-700 flex-col ${isFocusMode ? 'hidden' : 'flex'}`}>
          {activeProject ? (
            <NotebookPane
              project={activeProject}
              activeCanvasId={activeCanvasId}
              onSelectCanvas={handleSelectCanvas}
              onAddCanvas={handleAddCanvas}
              onDeleteCanvas={handleDeleteCanvas}
              onTogglePinCanvas={handleTogglePinCanvas}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-500 p-4">
              <Folder size={48} className="mb-4 text-zinc-400" />
              <h2 className="text-lg font-semibold">No Project Selected</h2>
              <p className="text-sm">Select a project from the library or create a new one to get started.</p>
              <button
                  onClick={() => handleAddProject()}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  <Plus size={16} /> Create Project
              </button>
            </div>
          )}
        </div>

        <main className="flex-1 flex flex-col bg-[#FBFBFA] dark:bg-zinc-900/80">
          {activeCanvas ? (
            <CanvasPane
              key={activeCanvas.id}
              canvas={activeCanvas}
              onUpdateBlock={updateBlock}
              onAddBlock={addBlock}
              onDeleteBlock={deleteBlock}
              onUpdateTitle={updateCanvasTitle}
              onReorderBlocks={reorderBlocks}
              onUpdatePlaygroundContent={handleUpdatePlaygroundContent}
            />
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-500 p-4">
               <FileText size={48} className="mb-4 text-zinc-400" />
               <h2 className="text-lg font-semibold">No Canvas Selected</h2>
               <p className="text-sm">Select a canvas from the notebook or create one.</p>
               {activeProject && (
                  <button
                      onClick={() => handleAddCanvas(CanvasType.NOTE)}
                      className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      <Plus size={16} /> Create Note
                  </button>
               )}
            </div>
          )}
        </main>
      </div>
    );
  }

  // Tablet & Mobile Layout
  return (
    <div className="h-screen w-screen text-zinc-800 dark:text-zinc-200 flex overflow-hidden font-sans relative">
      <AppHeader 
            theme={theme}
            setTheme={setTheme}
            isFocusMode={isFocusMode}
            setFocusMode={setFocusMode}
            isDesktop={isDesktop}
      />
      <div
        className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${isLibraryOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <LibraryPane
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={handleSelectProject}
            onAddProject={handleAddProject}
            onDeleteProject={handleDeleteProject}
            onRenameProject={handleRenameProject}
            onExportProject={handleExportProject}
            onImportProject={handleImportProject}
            isSaving={isSaving}
        />
      </div>
      {isLibraryOpen && <div onClick={() => setLibraryOpen(false)} className="fixed inset-0 bg-black/30 z-30 lg:hidden"></div>}
      
      <main className="flex-1 flex flex-col w-full h-full bg-[#FBFBFA] dark:bg-zinc-900/80" aria-hidden={isLibraryOpen && !isDesktop}>
        <header className="flex-shrink-0 flex items-center justify-between p-2 h-14 bg-[#F7F7F7]/70 dark:bg-zinc-800/70 backdrop-blur-lg border-b border-gray-200/80 dark:border-zinc-700 z-20">
            <div className="w-12">
                {activeCanvas ? (
                <button onClick={() => setActiveCanvasId(null)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-zinc-700"><ArrowLeft size={20}/></button>
                ) : (
                <button onClick={() => setLibraryOpen(true)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-zinc-700"><Menu size={20}/></button>
                )}
            </div>
            
            <h1 className="text-base font-semibold truncate text-center">
                {activeCanvas?.title || activeProject?.name || 'Atelier'}
            </h1>

            <div className="w-12 text-right">
                {activeProject && !activeCanvas && (
                    <button onClick={() => handleAddCanvas(CanvasType.NOTE)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-zinc-700" title="Add Note"><Plus size={20}/></button>
                )}
            </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {activeCanvas ? (
            <CanvasPane
              key={activeCanvas.id}
              canvas={activeCanvas}
              onUpdateBlock={updateBlock}
              onAddBlock={addBlock}
              onDeleteBlock={deleteBlock}
              onUpdateTitle={updateCanvasTitle}
              onReorderBlocks={reorderBlocks}
              onUpdatePlaygroundContent={handleUpdatePlaygroundContent}
              hideTitle={true}
            />
          ) : activeProject ? (
            <NotebookPane
              project={activeProject}
              activeCanvasId={activeCanvasId}
              onSelectCanvas={handleSelectCanvas}
              onAddCanvas={handleAddCanvas}
              onDeleteCanvas={handleDeleteCanvas}
              onTogglePinCanvas={handleTogglePinCanvas}
              hideHeader={true}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-500 p-4">
              <Folder size={48} className="mb-4 text-zinc-400" />
              <h2 className="text-lg font-semibold">No Project Selected</h2>
              <p className="text-sm">Select a project from the library or create a new one to get started.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;