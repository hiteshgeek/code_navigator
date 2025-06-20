// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { navigateToBlock } from "./phpAstNavigation";
import {
  showEndBlockDecoration,
  hideEndBlockDecoration,
  getAllBlockEnds,
} from "./endBlockDecoration";
import { BookmarksProvider, Bookmark } from "./bookmarksProvider";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "code-navigator" is now active!'
  );

  const gotoNextBlockStart = vscode.commands.registerCommand(
    "code-navigator.gotoNextBlockStart",
    async () => {
      await navigateToBlock("next", "start");
    }
  );
  const gotoPreviousBlockStart = vscode.commands.registerCommand(
    "code-navigator.gotoPreviousBlockStart",
    async () => {
      await navigateToBlock("previous", "start");
    }
  );
  const gotoNextBlockEnd = vscode.commands.registerCommand(
    "code-navigator.gotoNextBlockEnd",
    async () => {
      await navigateToBlock("next", "end");
    }
  );
  const gotoPreviousBlockEnd = vscode.commands.registerCommand(
    "code-navigator.gotoPreviousBlockEnd",
    async () => {
      await navigateToBlock("previous", "end");
    }
  );

  context.subscriptions.push(
    gotoNextBlockStart,
    gotoPreviousBlockStart,
    gotoNextBlockEnd,
    gotoPreviousBlockEnd
  );

  // Helper to update end block decoration for current editor
  function updateEndBlockDecoration(editor: vscode.TextEditor | undefined) {
    if (!editor) {
      console.log("updateEndBlockDecoration: no editor");
      return;
    }
    const doc = editor.document;
    if (!doc) {
      console.log("updateEndBlockDecoration: no document");
      return;
    }
    if (!["php", "javascript", "typescript"].includes(doc.languageId)) {
      console.log(
        "updateEndBlockDecoration: unsupported language",
        doc.languageId
      );
      return;
    }
    const allBlocks = getAllBlockEnds(doc);
    const cursorLine = editor.selection.active.line;
    const block = allBlocks.find((b) => b.endLine === cursorLine);
    if (block) {
      showEndBlockDecoration(editor, block);
      console.log("updateEndBlockDecoration: decoration shown");
    } else {
      hideEndBlockDecoration(editor);
      console.log("updateEndBlockDecoration: decoration hidden");
    }
  }

  // Listen for cursor changes globally to show end block decoration
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection((e) => {
      updateEndBlockDecoration(e.textEditor);
    })
  );
  // Also update decoration when active editor changes (e.g., direct click, tab switch)
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      updateEndBlockDecoration(editor);
    })
  );
  // Also update decoration when visible ranges change (scroll, etc.)
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorVisibleRanges((e) => {
      updateEndBlockDecoration(e.textEditor);
    })
  );

  // Command to allow other modules to trigger decoration update
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "code-navigator.updateEndBlockDecoration",
      () => {
        updateEndBlockDecoration(vscode.window.activeTextEditor);
      }
    )
  );

  // Bookmarks Tree View
  const bookmarksProvider = new BookmarksProvider(context);
  vscode.window.registerTreeDataProvider(
    "codeNavigatorBookmarks",
    bookmarksProvider
  );

  // Command: Add current line to bookmarks
  context.subscriptions.push(
    vscode.commands.registerCommand("code-navigator.addBookmark", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const doc = editor.document;
      const cursorLine = editor.selection.active.line;
      const allBlocks = getAllBlockEnds(doc);
      const block = allBlocks.find(
        (b) => b.endLine === cursorLine || b.startLine === cursorLine
      );
      const headerText = block
        ? block.headerText
        : `Line ${cursorLine + 1}: ${doc.lineAt(cursorLine).text.trim()}`;
      const bookmarks: Bookmark[] = context.globalState.get(
        "codeNavigatorBookmarks",
        []
      );
      const labels = Array.from(new Set(bookmarks.map((b) => b.label)));
      const quickPickItems: vscode.QuickPickItem[] = [
        { label: "default", description: "Default label" },
        ...labels
          .filter((l) => l !== "default")
          .map((l) => ({ label: l, description: "Existing label" })),
        { label: "+ New label...", description: "Create a new label" },
      ];
      const picked = await vscode.window.showQuickPick(quickPickItems, {
        placeHolder: "Select a label for this bookmark",
      });
      if (!picked) return;
      let label = picked.label;
      if (label === "+ New label...") {
        label =
          (await vscode.window.showInputBox({
            prompt: "Enter new label for bookmark",
          })) || "default";
      }
      // Check for duplicate bookmark
      // Ensure no duplicate bookmark exists in the same label
      const existingBookmark = bookmarks.some((b) => {
        const isDuplicate =
          b.filePath === doc.uri.fsPath &&
          b.line === cursorLine &&
          b.label === label;
        return isDuplicate;
      });
      if (existingBookmark) {
        vscode.window.showWarningMessage(
          `A bookmark for this line already exists in the label: ${label}`
        );
        return;
      }
      bookmarks.push({
        filePath: doc.uri.fsPath,
        line: cursorLine,
        label,
        headerText,
      });
      await context.globalState.update("codeNavigatorBookmarks", bookmarks);
      bookmarksProvider.refresh();
      vscode.window.showInformationMessage("Bookmark added!");
    })
  );

  // Command: Open bookmark
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "code-navigator.openBookmark",
      (bookmark: Bookmark) => {
        vscode.workspace.openTextDocument(bookmark.filePath).then((doc) => {
          vscode.window
            .showTextDocument(doc, { preview: false })
            .then((editor) => {
              const pos = new vscode.Position(bookmark.line, 0);
              editor.selection = new vscode.Selection(pos, pos);
              editor.revealRange(
                new vscode.Range(pos, pos),
                vscode.TextEditorRevealType.InCenter
              );
            });
        });
      }
    )
  );

  // Context menu command: Add block to bookmarks with label selection
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "code-navigator.addBookmarkContextMenu",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;
        const doc = editor.document;
        const cursorLine = editor.selection.active.line;
        const allBlocks = getAllBlockEnds(doc);
        const block = allBlocks.find(
          (b) => b.endLine === cursorLine || b.startLine === cursorLine
        );
        const headerText = block
          ? block.headerText
          : `Line ${cursorLine + 1}: ${doc.lineAt(cursorLine).text.trim()}`;
        const bookmarks: Bookmark[] = context.globalState.get(
          "codeNavigatorBookmarks",
          []
        );
        const labels = Array.from(new Set(bookmarks.map((b) => b.label)));
        const quickPickItems: vscode.QuickPickItem[] = [
          { label: "default", description: "Default label" },
          ...labels
            .filter((l) => l !== "default")
            .map((l) => ({ label: l, description: "Existing label" })),
          { label: "+ New label...", description: "Create a new label" },
        ];
        const picked = await vscode.window.showQuickPick(quickPickItems, {
          placeHolder: "Select a label for this bookmark",
        });
        if (!picked) return;
        let label = picked.label;
        if (label === "+ New label...") {
          label =
            (await vscode.window.showInputBox({
              prompt: "Enter new label for bookmark",
            })) || "default";
        }
        // Duplicate check for context menu
        const existingBookmark = bookmarks.some((b) => {
          const isDuplicate =
            b.filePath === doc.uri.fsPath &&
            b.line === cursorLine &&
            b.label === label;
          return isDuplicate;
        });
        if (existingBookmark) {
          vscode.window.showWarningMessage(
            `A bookmark for this line already exists in the label: ${label}`
          );
          return;
        }
        bookmarks.push({
          filePath: doc.uri.fsPath,
          line: cursorLine,
          label,
          headerText,
        });
        await context.globalState.update("codeNavigatorBookmarks", bookmarks);
        bookmarksProvider.refresh();
        vscode.window.showInformationMessage(
          `Bookmark added to list: ${label}`
        );
      }
    )
  );

  // Command: Remove bookmark
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "code-navigator.removeBookmark",
      async (item: any) => {
        const bookmarks: Bookmark[] = context.globalState.get(
          "codeNavigatorBookmarks",
          []
        );
        if (!item || !item.bookmark) {
          vscode.window.showInformationMessage("No bookmark selected.");
          return;
        }
        const idx = bookmarks.findIndex(
          (b) =>
            b.filePath === item.bookmark.filePath &&
            b.line === item.bookmark.line &&
            b.label === item.bookmark.label
        );
        if (idx !== -1) {
          bookmarks.splice(idx, 1);
          await context.globalState.update("codeNavigatorBookmarks", bookmarks);
          bookmarksProvider.refresh();
          vscode.window.showInformationMessage("Bookmark removed.");
        }
      }
    )
  );

  // Command: Edit bookmark label (supports both single bookmark and label group)
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "code-navigator.editBookmarkLabel",
      async (item: any) => {
        const bookmarks: Bookmark[] = context.globalState.get(
          "codeNavigatorBookmarks",
          []
        );
        if (!item) {
          vscode.window.showInformationMessage(
            "No bookmark or label selected."
          );
          return;
        }
        // If label group node
        if (!item.bookmark && item.label) {
          const oldLabel = item.label;
          const newLabel = await vscode.window.showInputBox({
            prompt: "Edit label for all bookmarks",
            value: oldLabel,
          });
          if (!newLabel || newLabel === oldLabel) return;
          for (const b of bookmarks) {
            if (b.label === oldLabel) b.label = newLabel;
          }
          await context.globalState.update("codeNavigatorBookmarks", bookmarks);
          bookmarksProvider.refresh();
          vscode.window.showInformationMessage(
            `All bookmarks with label '${oldLabel}' updated to '${newLabel}'.`
          );
          return;
        }
        // If single bookmark node
        if (item.bookmark) {
          const idx = bookmarks.findIndex(
            (b) =>
              b.filePath === item.bookmark.filePath &&
              b.line === item.bookmark.line &&
              b.label === item.bookmark.label
          );
          if (idx === -1) return;
          const newLabel = await vscode.window.showInputBox({
            prompt: "Edit bookmark label",
            value: item.bookmark.label,
          });
          if (!newLabel) return;
          bookmarks[idx].label = newLabel;
          await context.globalState.update("codeNavigatorBookmarks", bookmarks);
          bookmarksProvider.refresh();
          vscode.window.showInformationMessage("Bookmark label updated.");
        }
      }
    )
  );

  // Command: Remove all bookmarks in a label group
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "code-navigator.removeAllBookmarksInLabel",
      async (item: any) => {
        const bookmarks: Bookmark[] = context.globalState.get(
          "codeNavigatorBookmarks",
          []
        );
        if (!item || !item.label) {
          vscode.window.showInformationMessage("No label selected.");
          return;
        }
        const label = item.label;
        const filtered = bookmarks.filter((b) => b.label !== label);
        if (filtered.length === bookmarks.length) {
          vscode.window.showInformationMessage(
            "No bookmarks found for this label."
          );
          return;
        }
        await context.globalState.update("codeNavigatorBookmarks", filtered);
        bookmarksProvider.refresh();
        vscode.window.showInformationMessage(
          `All bookmarks with label '${label}' removed.`
        );
      }
    )
  );

  // --- Bookmark Navigation Commands ---
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "code-navigator.gotoNextBookmark",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;
        const doc = editor.document;
        const bookmarks: Bookmark[] = context.globalState.get(
          "codeNavigatorBookmarks",
          []
        );
        const fileBookmarks = bookmarks
          .filter((b) => b.filePath === doc.uri.fsPath)
          .sort((a, b) => a.line - b.line);
        if (fileBookmarks.length === 0) {
          vscode.window.showInformationMessage("No bookmarks in this file.");
          return;
        }
        const currentLine = editor.selection.active.line;
        const next =
          fileBookmarks.find((b) => b.line > currentLine) || fileBookmarks[0];
        const pos = new vscode.Position(next.line, 0);
        editor.selection = new vscode.Selection(pos, pos);
        editor.revealRange(
          new vscode.Range(pos, pos),
          vscode.TextEditorRevealType.InCenter
        );
      }
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "code-navigator.gotoPreviousBookmark",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;
        const doc = editor.document;
        const bookmarks: Bookmark[] = context.globalState.get(
          "codeNavigatorBookmarks",
          []
        );
        const fileBookmarks = bookmarks
          .filter((b) => b.filePath === doc.uri.fsPath)
          .sort((a, b) => a.line - b.line);
        if (fileBookmarks.length === 0) {
          vscode.window.showInformationMessage("No bookmarks in this file.");
          return;
        }
        const currentLine = editor.selection.active.line;
        let prev = null;
        for (let i = fileBookmarks.length - 1; i >= 0; i--) {
          if (fileBookmarks[i].line < currentLine) {
            prev = fileBookmarks[i];
            break;
          }
        }
        if (!prev) prev = fileBookmarks[fileBookmarks.length - 1];
        const pos = new vscode.Position(prev.line, 0);
        editor.selection = new vscode.Selection(pos, pos);
        editor.revealRange(
          new vscode.Range(pos, pos),
          vscode.TextEditorRevealType.InCenter
        );
      }
    )
  );

  // --- Bookmark Decorations ---
  let bookmarkDecorationType: vscode.TextEditorDecorationType | undefined;
  function updateBookmarkDecorations() {
    if (bookmarkDecorationType) {
      bookmarkDecorationType.dispose();
    }
    bookmarkDecorationType = vscode.window.createTextEditorDecorationType({
      gutterIconPath: context.asAbsolutePath("images/icon.png"),
      gutterIconSize: "contain",
    });
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    const doc = editor.document;
    const bookmarks: Bookmark[] = context.globalState.get(
      "codeNavigatorBookmarks",
      []
    );
    const decorations: vscode.DecorationOptions[] = bookmarks
      .filter((b) => b.filePath === doc.uri.fsPath)
      .map((b) => ({
        range: new vscode.Range(b.line, 0, b.line, 0),
        hoverMessage: `Bookmarked: ${b.label}`,
      }));
    editor.setDecorations(bookmarkDecorationType, decorations);
  }
  // Update decorations on events
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(updateBookmarkDecorations),
    vscode.workspace.onDidChangeTextDocument(updateBookmarkDecorations),
    vscode.window.onDidChangeTextEditorSelection(updateBookmarkDecorations)
  );
  // Also update after bookmark changes
  const origRefresh = bookmarksProvider.refresh.bind(bookmarksProvider);
  bookmarksProvider.refresh = function () {
    origRefresh();
    updateBookmarkDecorations();
  };
  // Initial call
  updateBookmarkDecorations();
}

// This method is called when your extension is deactivated
export function deactivate() {}
