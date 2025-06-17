// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

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
}

// Helper function to navigate to code blocks
async function navigateToBlock(
  direction: "next" | "previous",
  position: "start" | "end"
) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  const doc = editor.document;
  let currentLine = editor.selection.active.line;
  const totalLines = doc.lineCount;

  // Expanded regex for block starts in many languages
  const blockStartRegex = new RegExp(
    [
      // Common OOP and function keywords
      "^\\s*(function|class|interface|trait|struct|enum|impl|type|fn|def)\\b",
      // C/C++/C#/Java/Go/Rust function signature (return type + name + paren)
      "^\\s*\\w[\\w\\s*&:<>]*\\w\\s*\\([^)]*\\)\\s*(\\{|$)",
      // CSS/LESS/SCSS: lines ending with {
      "^.*\\{\\s*$",
    ].join("|"),
    "i"
  );
  let targetLine = -1;

  // Find all block starts
  const blockStarts: number[] = [];
  for (let i = 0; i < totalLines; i++) {
    if (blockStartRegex.test(doc.lineAt(i).text)) {
      blockStarts.push(i);
    }
  }

  // Helper to find block end given a block start
  function findBlockEnd(start: number): number {
    let end = start;
    for (let i = start + 1; i < totalLines; i++) {
      if (blockStartRegex.test(doc.lineAt(i).text)) {
        break;
      }
      if (!doc.lineAt(i).isEmptyOrWhitespace) {
        end = i;
      }
    }
    return end;
  }

  // Find the current block index
  let currentBlockIdx = -1;
  for (let i = 0; i < blockStarts.length; i++) {
    const start = blockStarts[i];
    const end = findBlockEnd(start);
    if (currentLine >= start && currentLine <= end) {
      currentBlockIdx = i;
      break;
    }
  }

  if (position === "end") {
    // If cursor is on or before block end, go to current block's end
    if (currentBlockIdx !== -1) {
      const blockEnd = findBlockEnd(blockStarts[currentBlockIdx]);
      if (currentLine < blockEnd) {
        const newPos = new vscode.Position(
          blockEnd,
          doc.lineAt(blockEnd).text.length
        );
        editor.selection = new vscode.Selection(newPos, newPos);
        editor.revealRange(new vscode.Range(newPos, newPos));
        return;
      } else if (currentLine === blockEnd) {
        // If at end, move to next/previous block end as requested
        if (direction === "next" && currentBlockIdx + 1 < blockStarts.length) {
          const nextEnd = findBlockEnd(blockStarts[currentBlockIdx + 1]);
          const newPos = new vscode.Position(
            nextEnd,
            doc.lineAt(nextEnd).text.length
          );
          editor.selection = new vscode.Selection(newPos, newPos);
          editor.revealRange(new vscode.Range(newPos, newPos));
          return;
        } else if (direction === "previous" && currentBlockIdx - 1 >= 0) {
          const prevEnd = findBlockEnd(blockStarts[currentBlockIdx - 1]);
          const newPos = new vscode.Position(
            prevEnd,
            doc.lineAt(prevEnd).text.length
          );
          editor.selection = new vscode.Selection(newPos, newPos);
          editor.revealRange(new vscode.Range(newPos, newPos));
          return;
        }
      }
    }
  } else if (position === "start") {
    // If cursor is on or after block start, go to current block's start
    if (currentBlockIdx !== -1) {
      const blockStart = blockStarts[currentBlockIdx];
      const blockEnd = findBlockEnd(blockStart);
      if (currentLine > blockStart) {
        const newPos = new vscode.Position(blockStart, 0);
        editor.selection = new vscode.Selection(newPos, newPos);
        editor.revealRange(new vscode.Range(newPos, newPos));
        return;
      } else if (currentLine === blockStart) {
        // If at start, move to next/previous block start as requested
        if (direction === "next" && currentBlockIdx + 1 < blockStarts.length) {
          const nextStart = blockStarts[currentBlockIdx + 1];
          const newPos = new vscode.Position(nextStart, 0);
          editor.selection = new vscode.Selection(newPos, newPos);
          editor.revealRange(new vscode.Range(newPos, newPos));
          return;
        } else if (direction === "previous" && currentBlockIdx - 1 >= 0) {
          const prevStart = blockStarts[currentBlockIdx - 1];
          const newPos = new vscode.Position(prevStart, 0);
          editor.selection = new vscode.Selection(newPos, newPos);
          editor.revealRange(new vscode.Range(newPos, newPos));
          return;
        }
      }
    }
  }

  // Fallback to original navigation logic
  if (direction === "next") {
    for (let i = currentLine + 1; i < totalLines; i++) {
      if (blockStartRegex.test(doc.lineAt(i).text)) {
        targetLine = i;
        break;
      }
    }
  } else {
    for (let i = currentLine - 1; i >= 0; i--) {
      if (blockStartRegex.test(doc.lineAt(i).text)) {
        targetLine = i;
        break;
      }
    }
  }

  if (targetLine !== -1) {
    if (position === "start") {
      const newPos = new vscode.Position(targetLine, 0);
      editor.selection = new vscode.Selection(newPos, newPos);
      editor.revealRange(new vscode.Range(newPos, newPos));
    } else {
      const blockEnd = findBlockEnd(targetLine);
      const newPos = new vscode.Position(
        blockEnd,
        doc.lineAt(blockEnd).text.length
      );
      editor.selection = new vscode.Selection(newPos, newPos);
      editor.revealRange(new vscode.Range(newPos, newPos));
    }
  } else {
    vscode.window.showInformationMessage(
      "No more code blocks found in this direction."
    );
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
