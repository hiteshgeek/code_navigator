# Code Navigator (code-navigator-hiteshgeek)

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/hiteshgeek.code-navigator-hiteshgeek?label=VS%20Code%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=hiteshgeek.code-navigator-hiteshgeek)
[![GitHub](https://img.shields.io/github/stars/hiteshgeek/code_navigator?style=social)](https://github.com/hiteshgeek/code_navigator)

Code Navigator (code-navigator-hiteshgeek) is a Visual Studio Code extension that lets you quickly jump to the next or previous code block (function, class, struct, trait, interface, control flow, etc.) in any programming language using keyboard shortcuts.

## Highlights

- **Full PHP AST-based navigation**: Accurate navigation for PHP classes, interfaces, traits, methods, functions, and control flow blocks (if, else if, else, switch, case) using `nikic/php-parser`.
- **User-configurable block types**: Enable/disable navigation for enums, control flow, and more via extension settings.
- **Interface and trait navigation always enabled for PHP**.
- **Works with a wide variety of languages**: JavaScript, TypeScript, Python, PHP, Java, C, C++, C#, Go, Rust, CSS, LESS, SCSS, and more.
- **Automated packaging**: PHP dependencies are bundled automatically; `vendor/` is ignored by git.
- **Customizable keybindings**: Change shortcuts in VS Code Keyboard Shortcuts settings.

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
- PHP (with full AST support)
- Java
- C, C++, C#
- Go
- Rust
- CSS, LESS, SCSS

## How It Works

- For PHP, uses a robust AST parser (`nikic/php-parser`) for perfect block detection, including control flow and all OOP constructs.
- For other languages, uses the VS Code Symbol Provider API for fast, language-aware navigation.
- User settings control which block types are navigable.

## Limitations

- For non-PHP languages, detection is based on the Symbol Provider API and may not handle all edge cases or deeply nested/anonymous blocks.
- For best results, use with conventional code formatting.

## Links

- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=hiteshgeek.code-navigator-hiteshgeek)
- [GitHub Repository](https://github.com/hiteshgeek/code_navigator)
- [Report Issues](https://github.com/hiteshgeek/code_navigator/issues)

## License

MIT

## Author

- Hitesh Vaghela ([hiteshgeek](https://github.com/hiteshgeek))
