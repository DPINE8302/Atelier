
import { Project, BlockType, CanvasType } from './types';

export const initialData: Project[] = [
  {
    id: 'proj_1',
    name: 'Welcome to Atelier',
    parentId: null,
    canvases: [
      {
        id: 'canvas_1',
        title: 'Getting Started Guide',
        type: CanvasType.NOTE,
        createdAt: new Date().toISOString(),
        isPinned: true,
        blocks: [
          {
            id: 'block_1',
            type: BlockType.HEADING,
            content: 'Welcome to Atelier!',
          },
          {
            id: 'block_2',
            type: BlockType.TEXT,
            content: 'Atelier is your personal digital workshop, designed for focused work and creativity. This guide will walk you through its powerful features. Your work is saved automatically to your browser.',
          },
          {
            id: 'block_3',
            type: BlockType.HEADING,
            content: 'Core Features Checklist',
          },
          {
            id: 'block_4_1',
            type: BlockType.TODO,
            content: '{"checked":true,"text":"**Hierarchical Projects:** Organize your work with nested folders."}',
          },
          {
            id: 'block_4_2',
            type: BlockType.TODO,
            content: '{"checked":true,"text":"**Rich Notes:** Write using full Markdown support."}',
          },
          {
            id: 'block_4_3',
            type: BlockType.TODO,
            content: '{"checked":true,"text":"**Code Playgrounds:** Experiment with live HTML, CSS, and JS."}',
          },
          {
            id: 'block_4_4',
            type: BlockType.TODO,
            content: '{"checked":true,"text":"**Drag & Drop:** Reorder blocks within any note."}',
          },
          {
            id: 'block_4_5',
            type: BlockType.TODO,
            content: '{"checked":true,"text":"**Focus Mode & Themes:** Customize your workspace."}',
          },
           {
            id: 'block_4_6',
            type: BlockType.TODO,
            content: '{"checked":true,"text":"**Import & Export:** Backup and share your projects."}',
          },
          {
            id: 'block_5',
            type: BlockType.HEADING,
            content: 'Markdown in Action',
          },
          {
            id: 'block_6',
            type: BlockType.TEXT,
            content: 'You can use Markdown to format your text. For example:\n\n- Create lists of items.\n- Use **bold** and *italic* text for emphasis.\n- Add `inline code` for small snippets.\n\n> And even create blockquotes to highlight important information!',
          },
          {
            id: 'block_7',
            type: BlockType.HEADING,
            content: 'Code Blocks & Playgrounds',
          },
          {
            id: 'block_7_1',
            type: BlockType.TEXT,
            content: '**Code Blocks** (like the one below) are for displaying static code snippets. You can select the language and use the **copy button**.\nFor live, runnable code, create a **New Playground** from the notebook menu.',
          },
          {
            id: 'block_8',
            type: BlockType.CODE,
            content: '{"language":"python","code":"# This is a Python code block\\ndef fibonacci(n):\\n    a, b = 0, 1\\n    while a < n:\\n        print(a, end=\' \')\\n        a, b = b, a+b\\n\\nfibonacci(1000)"}',
          },
           {
            id: 'block_9',
            type: BlockType.HEADING,
            content: 'Organization Tools',
           },
           {
            id: 'block_10',
            type: BlockType.TEXT,
            content: 'Use the **pin icon** on a note to keep it at the top of its project. Use the **search bar** to find notes instantly by title or content. **Double-click a project** in the library panel to rename it.',
           },
           {
            id: 'block_11',
            type: BlockType.HEADING,
            content: 'Backups and Sharing',
           },
           {
            id: 'block_12',
            type: BlockType.TEXT,
            content: 'Hover over a project in the library and use the **`...` menu** to **Export** it as a JSON file. You can then **Import** it back on any device using the **upload button** at the bottom of the library panel. This is great for backups or sharing your work!',
           },
        ],
      },
       {
        id: 'canvas_playground_1',
        title: 'My First Playground',
        type: CanvasType.PLAYGROUND,
        createdAt: new Date().toISOString(),
        isPinned: false,
        playgroundContent: {
          html: '<h1>Hello, Playground!</h1>\\n<p>Edit the HTML, CSS, and JS panels to see the live preview update.</p>\\n<div id="root"></div>',
          css: 'body { font-family: sans-serif; color: #333; }\\nh1 { color: #007aff; }\\n#root { border: 1px solid #ccc; padding: 1rem; margin-top: 1rem; }',
          js: 'const root = document.getElementById("root");\\nconsole.log("Logging to the custom console!");\\nconsole.warn("This is a warning.");\\nconsole.error("This is an error.");\\nroot.textContent = "Hello from JavaScript!";'
        }
      }
    ],
  },
  {
    id: 'proj_2',
    name: 'Web Development Snippets',
    parentId: 'proj_1', // This is now a sub-project
    canvases: [],
  }
];

export const SUPPORTED_LANGUAGES = ['javascript', 'python', 'html', 'css', 'ruby', 'json', 'typescript', 'csharp', 'jsx', 'tsx', 'markdown'];
