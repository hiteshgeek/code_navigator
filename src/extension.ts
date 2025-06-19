// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { navigateToBlock } from "./phpAstNavigation";
import {
  showEndBlockDecoration,
  hideEndBlockDecoration,
  getAllBlockEnds,
} from "./endBlockDecoration";

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
}

// This method is called when your extension is deactivated
export function deactivate() {}
