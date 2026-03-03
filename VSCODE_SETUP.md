# VSCode Setup Instructions

Complete guide to set up VS Code for ElderConnect+ development.

## Recommended VS Code Extensions

### Flutter & Dart Development
1. **Flutter** (flutter.flutter)
   - Full Flutter development support
   - Widget previews
   - Hot reload integration

2. **Dart** (dart-code.dart-code)
   - Dart language support
   - Code analysis
   - Debugging capabilities

3. **Awesome Flutter Snippets** (nash.awesome-flutter-snippets)
   - Common Flutter code snippets
   - Boilerplate generation

### Backend Development
4. **Deno** (denoland.vscode-deno)
   - Deno/TypeScript support
   - Edge function development

5. **PostgreSQL** (cweijan.vscode-postgresql)
   - PostgreSQL connections
   - SQL execution
   - Database visualization

6. **Thunder Client** (rangav.vscode-thunder-client)
   - API testing (alternative to Postman)

### General Development
7. **Prettier** (esbenp.prettier-vscode)
   - Code formatter
   - Auto-formatting on save

8. **ESLint** (dbaeumer.vscode-eslint)
   - JavaScript linting
   - Code quality

9. **Git Graph** (mhutchie.git-graph)
   - Visual git history
   - Branch visualization

10. **GitLens** (eamodio.gitlens)
    - Git blame
    - Commit history

11. **REST Client** (humao.rest-client)
    - REST API testing
    - .http file support

12. **Docker** (ms-vscode.docker)
    - Docker container management
    - Dockerfile support

## Installation

### Quick Install
```bash
# Copy extension IDs from list above
code --install-extension flutter.flutter
code --install-extension dart-code.dart-code
code --install-extension nash.awesome-flutter-snippets
code --install-extension denoland.vscode-deno
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension mhutchie.git-graph
code --install-extension eamodio.gitlens
code --install-extension humao.rest-client
code --install-extension ms-vscode.docker
```

## VS Code Settings

Create `.vscode/settings.json` in project root:

```json
{
  // Editor Settings
  "editor.formatOnSave": true,
  "editor.formatOnPaste": false,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.insertSpaces": true,
  "editor.tabSize": 2,
  "editor.wordWrap": "on",
  "editor.rulers": [80, 100, 120],

  // Files
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "files.exclude": {
    "**/.git": true,
    "**/build": true,
    "**/.dart_tool": true,
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true
  },

  // Dart Settings
  "dart.allowAnalytics": false,
  "dart.enableSdkFormatter": true,
  "dart.lineLength": 100,
  "dart.showTodos": true,
  "[dart]": {
    "editor.defaultFormatter": "dart-code.dart-code",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll": true
    }
  },

  // JavaScript/TypeScript Settings
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },

  // Search Exclude
  "search.exclude": {
    "**/node_modules": true,
    "**/.git": true,
    "**/build": true,
    "**/.dart_tool": true,
    "**/.next": true
  },

  // Git Settings
  "git.autofetch": true,
  "git.confirmSync": false,
  "gitlens.advanced.messages": {
    "suppressCommitHasNoPreviousCommitWarning": false
  },

  // Docker
  "docker.showExplorer": true,

  // Terminal
  "terminal.integrated.defaultProfile.osx": "zsh",
  "terminal.integrated.defaultProfile.windows": "PowerShell",
  "terminal.integrated.defaultProfile.linux": "bash"
}
```

## Launch Configuration

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Flutter (Debug)",
      "type": "dart",
      "request": "launch",
      "program": "mobile/lib/main.dart",
      "cwd": "mobile",
      "console": "integratedTerminal",
      "showFrontend": true,
      "args": ["--dart-define", "FLAVOR=dev"]
    },
    {
      "name": "Flutter (Release)",
      "type": "dart",
      "request": "launch",
      "program": "mobile/lib/main.dart",
      "cwd": "mobile",
      "args": ["--release"]
    },
    {
      "name": "Dart Tests",
      "type": "dart",
      "request": "launch",
      "program": "mobile/test",
      "cwd": "mobile",
      "console": "integratedTerminal"
    },
    {
      "name": "Admin Dashboard",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/admin/node_modules/.bin/next",
      "args": ["dev"],
      "cwd": "${workspaceFolder}/admin",
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ],
  "compounds": [
    {
      "name": "Full Stack Dev",
      "configurations": ["Flutter (Debug)", "Admin Dashboard"],
      "preLaunchTask": "supabase:start"
    }
  ]
}
```

## Tasks Configuration

Create `.vscode/tasks.json` for common tasks:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "supabase:start",
      "type": "shell",
      "command": "supabase start",
      "cwd": "${workspaceFolder}/backend",
      "presentation": {
        "reveal": "always",
        "panel": "shared"
      },
      "runOptions": {
        "runOn": "folderOpen"
      }
    },
    {
      "label": "supabase:stop",
      "type": "shell",
      "command": "supabase stop",
      "cwd": "${workspaceFolder}/backend"
    },
    {
      "label": "flutter:test",
      "type": "shell",
      "command": "flutter test",
      "cwd": "${workspaceFolder}/mobile",
      "presentation": {
        "reveal": "always"
      }
    },
    {
      "label": "flutter:analyze",
      "type": "shell",
      "command": "flutter analyze",
      "cwd": "${workspaceFolder}/mobile",
      "presentation": {
        "reveal": "always"
      }
    },
    {
      "label": "flutter:format",
      "type": "shell",
      "command": "dart format .",
      "cwd": "${workspaceFolder}/mobile"
    },
    {
      "label": "admin:test",
      "type": "shell",
      "command": "npm test",
      "cwd": "${workspaceFolder}/admin"
    },
    {
      "label": "admin:build",
      "type": "shell",
      "command": "npm run build",
      "cwd": "${workspaceFolder}/admin"
    }
  ]
}
```

## Keyboard Shortcuts

Add to `.vscode/keybindings.json`:

```json
[
  {
    "key": "ctrl+shift+b",
    "command": "workbench.action.tasks.runTask",
    "args": "flutter:analyze"
  },
  {
    "key": "ctrl+shift+t",
    "command": "workbench.action.tasks.runTask",
    "args": "flutter:test"
  },
  {
    "key": "shift+alt+f",
    "command": "editor.action.formatDocument"
  }
]
```

## Useful Features

### Multi-Root Workspace
Open entire project as workspace for better navigation:
1. File > Open Folder
2. Select `ElderConnect+` directory
3. VS Code recognizes all subdirectories

### Flutter DevTools
Automatically opens with Flutter debugging:
```
Click "Open DevTools" in Debug Console
```

### Dart Analysis
- **Problems Panel**: Shows all analysis issues
- **Outline**: Shows file structure
- **Timeline**: Shows widget building

## Performance Tips

### Reduce Resource Usage
```json
{
  "dart.enableCompletionCommitCharacters": false,
  "dart.showInlineCodeLens": false,
  "[dart]": {
    "editor.selectionHighlight": false
  }
}
```

### Speed Up Linting
```json
{
  "dart.analyzeAngularTemplates": false,
  "dart.additionalAnalyzerFileExcludePatterns": [
    "**/test/**"
  ]
}
```

## Remote Development

### SSH Remote
```json
{
  "remote.SSH.defaultExtensions": [
    "flutter.flutter",
    "dart-code.dart-code",
    "esbenp.prettier-vscode"
  ]
}
```

## Troubleshooting

### Extensions Not Loading
```bash
# Reinstall extensions
code --disable-extensions
code  # Restart
```

### Dart Analysis Slow
```bash
# Clear analysis cache
rm -rf ~/.dartServer
```

### Git Not Showing
```bash
# Initialize git
cd ElderConnect+
git init
```

## Resources

- [VS Code Documentation](https://code.visualstudio.com/docs)
- [Flutter VS Code Setup](https://flutter.dev/docs/development/tools/vs-code)
- [Dart Language Server](https://github.com/dart-lang/sdk/tree/main/pkg/analysis_server)

---

For issues or suggestions: hello@elderconnect.plus
