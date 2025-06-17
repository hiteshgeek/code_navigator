# Code Navigator (code-navigator-hiteshgeek)

Code Navigator (code-navigator-hiteshgeek) is a Visual Studio Code extension that lets you quickly jump to the next or previous code block (function, class, struct, trait, interface, etc.) in any programming language using keyboard shortcuts.

## Features

- **Navigate to next/previous block start** (e.g., function, class, struct, etc.)
- **Navigate to next/previous block end**
- Works with a wide variety of languages: JavaScript, TypeScript, Python, PHP, Java, C, C++, C#, Go, Rust, CSS, LESS, SCSS, and more
- Customizable keybindings

## Default Keybindings

| Action                     | Shortcut (Windows/Linux) |
| -------------------------- | ------------------------ |
| Go to Next Block Start     | Ctrl+Alt+Down            |
| Go to Previous Block Start | Ctrl+Alt+Up              |
| Go to Next Block End       | Ctrl+Alt+PageDown        |
| Go to Previous Block End   | Ctrl+Alt+PageUp          |

> You can change these keybindings in your VS Code Keyboard Shortcuts settings.

## Usage

1. Open any code file in a supported language.
2. Place your cursor anywhere in the file.
3. Use the shortcuts to jump between code blocks.

## Supported Languages

- JavaScript, TypeScript
- Python
- PHP
- Java
- C, C++, C#
- Go
- Rust
- CSS, LESS, SCSS

## How It Works

Code Navigator uses a smart pattern-matching algorithm to detect block starts (such as `function`, `class`, `def`, `struct`, `fn`, `{`, etc.) and lets you jump to the start or end of these blocks. The detection is designed to work for most common programming languages and styles.

## Limitations

- Detection is based on regular expressions and may not handle all edge cases or deeply nested/anonymous blocks.
- For best results, use with conventional code formatting.

## Contributing

Pull requests and suggestions are welcome! Please open an issue or PR on [GitHub](https://github.com/hiteshgeek/code_navigator).

## License

MIT
