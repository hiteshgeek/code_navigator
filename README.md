# Code Navigator (code-navigator-hiteshgeek)

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/hiteshgeek.code-navigator-hiteshgeek?label=VS%20Code%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=hiteshgeek.code-navigator-hiteshgeek)
[![GitHub](https://img.shields.io/github/stars/hiteshgeek/code_navigator?style=social)](https://github.com/hiteshgeek/code_navigator)

Code Navigator (code-navigator-hiteshgeek) is a Visual Studio Code extension that lets you quickly jump to the next or previous code block (function, class, struct, trait, interface, control flow, etc.) in any programming language using keyboard shortcuts.

## ✨ Key Feature: End Block Annotation

- **See exactly which block you navigated to!** When you jump to the end of any code block, a temporary inline annotation appears at the end line, showing:

  `//end of (line_number) : content of first line`

  This annotation stays visible as long as your cursor is at the end of the block, making it easy to identify the block's start and scope at a glance. Works for all supported languages!

## Highlights

- **Full PHP AST-based navigation**: Accurate navigation for PHP classes, interfaces, traits, methods, functions, and control flow blocks (if, else if, else, switch, case) using `nikic/php-parser`.
- **User-configurable block types**: Enable/disable navigation for enums, control flow, and more via extension settings.
- **Interface and trait navigation always enabled for PHP**.
- **Works with a wide variety of languages**: JavaScript, TypeScript, Python, PHP, Java, C, C++, C#, Go, Rust, CSS, LESS, SCSS, and more.
- **Automated packaging**: PHP dependencies are bundled automatically; `vendor/` is ignored by git.
- **Customizable keybindings**: Change shortcuts in VS Code Keyboard Shortcuts settings.

## Default Keybindings

| Action                     | Shortcut (Windows/Linux) | Shortcut (macOS)  |
| -------------------------- | ------------------------ | ----------------- |
| Go to Next Block Start     | Ctrl+Win+Down            | Ctrl+Cmd+Down     |
| Go to Previous Block Start | Ctrl+Win+Up              | Ctrl+Cmd+Up       |
| Go to Next Block End       | Ctrl+Win+PageDown        | Ctrl+Cmd+PageDown |
| Go to Previous Block End   | Ctrl+Win+PageUp          | Ctrl+Cmd+PageUp   |

> You can change these keybindings in your VS Code Keyboard Shortcuts settings.

## Usage

1. Open any code file in a supported language.
2. Place your cursor anywhere in the file.
3. Use the shortcuts to jump between code blocks.
4. When you land at the end of a block, look for the inline annotation to see which block you are at!

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
- **End block annotation** is implemented as a reusable component and works for all supported languages.

## Links

- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=hiteshgeek.code-navigator-hiteshgeek)
- [GitHub Repository](https://github.com/hiteshgeek/code_navigator)
- [Report Issues](https://github.com/hiteshgeek/code_navigator/issues)

## License

MIT

## Author

- Hitesh Vaghela ([hiteshgeek](https://github.com/hiteshgeek))
