# Change Log

All notable changes to the "code-navigator" extension will be documented in this file.

## [0.0.4] - 2025-06-19

- **Key Feature: End Block Annotation!**
  - When you navigate to the end of any code block, a temporary inline annotation appears at the end line, showing:

    `//end of line_number : content of first line`

    This annotation remains visible as long as your cursor is at the end of the block, making it easy to identify the block's start and scope at a glance. This works for all supported languages and is implemented as a reusable component for future extensibility.
- Refactored navigation logic for better multi-language support and maintainability.

## [0.0.3] - 2025-06-18

- **Keybindings updated:** All navigation commands now support both `Ctrl+Win` (Windows/Linux) and `Ctrl+Cmd` (macOS) shortcuts for cross-platform consistency.

## [0.0.2] - 2025-06-18

- Full PHP AST-based navigation: supports classes, interfaces, traits, methods, functions, and control flow blocks (if, else if, else, switch, case) when enabled in settings.
- User settings now respected for block types (enum, control flow, etc.).
- Interface and trait navigation always enabled for PHP.
- Improved packaging automation for PHP dependencies.

## [0.0.1] - 2025-06-17

- Initial release
