# Change Log

All notable changes to the "code-navigator" extension will be documented in this file.

## [Unreleased]

### Bookmarks: Powerful Code Navigation & Organization

- **Bookmarks System**: Add any line or code block to bookmarks, assign custom labels, and organize them in a dedicated Activity Bar view.
- **Jump to Bookmarks**: Instantly jump to the next or previous bookmark in the current file with keyboard shortcuts (`Ctrl+Win+Insert`/`Delete`).
- **Visual Bookmark Markers**: Bookmarked lines are marked with a gutter icon in the editor for quick identification.
- **No Duplicates**: The extension prevents adding the same line to the same label more than once.
- **Sorted Groups**: Bookmark labels are sorted alphabetically for easy access.
- **Quick Remove**: Remove bookmarks directly from the context menu in the Activity Bar.
- **Move or Copy Bookmarks Between Labels**: Move a bookmark to another label or copy it to multiple labels directly from the Activity Bar context menu. Duplicate prevention is enforced.

## [0.1.0] - 2025-06-20

### Bookmarks: Powerful Code Navigation & Organization

- **Bookmarks System**: Add any line or code block to bookmarks, assign custom labels, and organize them in a dedicated Activity Bar view.
- **Jump to Bookmarks**: Instantly jump to the next or previous bookmark in the current file with keyboard shortcuts (`Ctrl+Win+Insert`/`Delete`).
- **Visual Bookmark Markers**: Bookmarked lines are marked with a gutter icon in the editor for quick identification.
- **No Duplicates**: The extension prevents adding the same line to the same label more than once.
- **Sorted Groups**: Bookmark labels are sorted alphabetically for easy access.
- **Remove Individual Bookmark**: Remove a single bookmark directly from the context menu in the Activity Bar.
- **Remove All Bookmarks in a Label**: Remove all bookmarks under a specific label with one action from the context menu.
- **Edit Bookmark Label**: Edit the label for a single bookmark or all bookmarks under a label directly from the Activity Bar context menu.

## [0.0.4] - 2025-06-19

- **Key Feature: End Block Annotation!**

  - When you navigate to the end of any code block, a temporary inline annotation appears at the end line, showing:

    `//end of (<line_number>) : <content of first line>`

    (Note: The prefix `end of` has been removed for a cleaner look.)

    This annotation remains visible as long as your cursor is at the end of the block, making it easy to identify the block's start and scope at a glance. This works for all supported languages and is implemented as a reusable component for future extensibility.

- Refactored navigation logic for better multi-language support and maintainability.
- **Keybindings updated:**
  - Go to Next Block Start: `Ctrl+Win+End` (Windows/Linux), `Ctrl+Cmd+End` (macOS)
  - Go to Previous Block Start: `Ctrl+Win+Home` (Windows/Linux), `Ctrl+Cmd+Home` (macOS)
  - Go to Next Block End: `Ctrl+Win+PageDown` (Windows/Linux), `Ctrl+Cmd+PageDown` (macOS)
  - Go to Previous Block End: `Ctrl+Win+PageUp` (Windows/Linux), `Ctrl+Cmd+PageUp` (macOS)

## [0.0.3] - 2025-06-18

- **Keybindings updated:** All navigation commands now support both `Ctrl+Win` (Windows/Linux) and `Ctrl+Cmd` (macOS) shortcuts for cross-platform consistency.

## [0.0.2] - 2025-06-18

- Full PHP AST-based navigation: supports classes, interfaces, traits, methods, functions, and control flow blocks (if, else if, else, switch, case) when enabled in settings.
- User settings now respected for block types (enum, control flow, etc.).
- Interface and trait navigation always enabled for PHP.
- Improved packaging automation for PHP dependencies.

## [0.0.1] - 2025-06-17

- Initial release
