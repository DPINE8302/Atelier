# Atelier

**Your Personal Digital Workshop.**

Atelier is a clean, focused, and powerful digital workspace designed for creativity and productivity. It seamlessly blends note-taking, document management, and a complete code playground into a single, offline-first, installable Progressive Web App (PWA). Inspired by the elegance of professional design software, Atelier provides a distraction-free environment to capture your thoughts, build web components, and organize your work.


## ✨ Features

Atelier is packed with features to streamline your workflow:

**App & Workflow:**
*   **Installable PWA:** Install Atelier on your desktop or mobile home screen for an app-like experience.
*   **Full Offline Support:** Works flawlessly without an internet connection thanks to a dedicated service worker.
*   **Light & Dark Modes:** Choose between a clean, bright light theme and a focused dark theme, or sync with your system preference.
*   **Focus Mode:** Hide the side panels to enter an immersive, distraction-free environment.
*   **Responsive Design:** A tailored experience for both desktop (multi-pane) and mobile (single-column) devices.
*   **Real-time Save Status:** A subtle indicator lets you know your work is always being saved locally.

**Organization & Management:**
*   **Hierarchical Projects:** Organize your work with infinitely nestable folders.
*   **Project Import/Export:** Easily back up your entire workspace to a JSON file or import projects from others.
*   **Pinned Notes:** Keep important canvases at the top of your notebook for quick access.
*   **Powerful Search:** Instantly find canvases by title or content within a project.
*   **Drag & Drop Reordering:** Intuitively reorder blocks within any note.

**Notes & Content:**
*   **Full Markdown Support:** Write rich notes with headings, lists, bold, italics, code snippets, and more.
*   **Voice Dictation:** Use your voice to transcribe notes directly into text blocks.
*   **Rich Media Blocks:** Embed images and PDF documents directly into your notes.
*   **To-Do Lists:** Keep track of tasks with interactive checklists.

**For Developers:**
*   **Code Playgrounds:** A dedicated canvas type with a three-panel editor for live HTML, CSS, and JavaScript experimentation. Features a real-time preview and an integrated console to capture logs and errors.
*   **Resizable Panes:** Adjust the layout of the Code Playground to fit your needs.
*   **Static Code Blocks:** Display beautiful, syntax-highlighted code snippets in over a dozen languages with a one-click copy button.

## 🚀 Installation

Atelier can be run in the browser or installed as a PWA for a more integrated experience.

### Web Version

Because this project is built without a traditional bundler, getting started is incredibly simple.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/atelier.git
    cd atelier
    ```

2.  **Serve the directory:**
    You need a simple local server to handle the module imports correctly. You can use any static file server.
    ```bash
    # If you have Python 3
    python -m http.server
    
    # Or, if you have Node.js and npx
    npx serve .
    ```

3.  **Open in browser:**
    Navigate to `http://localhost:8000` (or the port specified by your server).

### PWA Installation

For offline access and a native app feel, you can install Atelier.

*   **On Desktop (Chrome, Edge):** While viewing the app, look for an "Install" icon in the address bar (usually on the right side). Click it and follow the prompts.
*   **On Mobile (iOS/Safari):** Tap the "Share" button, then scroll down and select "Add to Home Screen."
*   **On Mobile (Android/Chrome):** You should see a pop-up prompting you to "Add to Home Screen." If not, tap the three-dot menu and select "Install app."

## 🛠️ Tech Stack

*   **Framework:** React 19
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **PWA:** Web App Manifest & Service Worker API
*   **Icons:** Lucide React
*   **Markdown:** `react-markdown` with `remark-gfm`
*   **Syntax Highlighting:** `react-syntax-highlighter`
*   **Offline Storage:** Browser LocalStorage API
*   **Speech-to-Text:** Web Speech API

## 💖 Credits & Acknowledgements

*   **Made with 🤍 by Win.**
*   © 2025 Wiqnnc\_. All Rights Reserved.
