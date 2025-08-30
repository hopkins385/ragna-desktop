# RAGNA Desktop

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-35.0.0-blue.svg)](https://electronjs.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.5.13-green.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue.svg)](https://www.typescriptlang.org/)

A powerful desktop application for document management and AI-powered chat interactions, built with Electron, Vue.js, and TypeScript.

## Features

- 🤖 **AI Chat Interface**: Interact with documents using AI-powered conversations
- 💾 **Local Storage**: All data stored locally using SQLite and vector databases
- 📄 **Document Management** (Work in Progress, currently disabled): Upload and manage various document types (PDF, DOCX, TXT)
- 🔍 **Vector Search**: Semantic search through document content using embeddings
- 🎨 **Modern UI**: Beautiful interface built with Vue 3, Tailwind CSS, and Radix Vue
- 🔒 **Privacy First**: No external API calls - everything runs locally

## Tech Stack

- **Frontend**: Vue 3, TypeScript, Tailwind CSS, Radix Vue
- **Backend**: Electron, Node.js, Express
- **Database**: SQLite (TypeORM), LanceDB (Vector Storage)
- **AI/ML**: Transformers.js, LangChain, node-llama-cpp
- **Build Tools**: Electron Vite, Electron Builder

## Prerequisites

- Node.js 22+
- npm or yarn
- Git

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/hopkins385/ragna-desktop.git
   cd ragna-desktop
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:mac` - Build for macOS
- `npm run build:win` - Build for Windows
- `npm run build:linux` - Build for Linux
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Run TypeScript type checking

## Project Structure

```
src/
├── main/           # Electron main process
│   ├── database/   # SQLite database entities and connections
│   ├── handlers/   # IPC handlers for frontend communication
│   ├── parsers/    # Document parsers (PDF, DOCX, etc.)
│   ├── services/   # Business logic services
│   └── utils/      # Utility functions
├── preload/        # Electron preload scripts
└── renderer/       # Vue.js frontend application
    ├── components/ # Vue components
    ├── pages/      # Application pages
    ├── stores/     # Pinia state management
    └── composables/ # Vue composables
```

## Building for Distribution

### macOS

```bash
npm run build:mac
```

### Windows

```bash
npm run build:win
```

### Linux

```bash
npm run build:linux
```

Built applications will be available in the `dist/` directory.

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Known Issues

### SQLite Version Lock

Due to build compatibility issues, SQLite is locked to version 5.1.6.
See: https://github.com/TryGhost/node-sqlite3/issues/1746

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Electron](https://electronjs.org/)
- UI components from [Radix Vue](https://www.radix-vue.com/)
- AI/ML powered by [Transformers.js](https://huggingface.co/docs/transformers.js)
- Vector database by [LanceDB](https://lancedb.com/)

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/hopkins385/ragna-desktop/issues) on GitHub.

---

<div align="center">
  <p>Built with ❤️ and Apprechiation by Sven Stadhouders</p>
  <p>
    <a href="https://ragna.app">Website</a> •
    <a href="https://github.com/hopkins385/ragna-studio-frontend">GitHub</a>
  </p>
</div>
