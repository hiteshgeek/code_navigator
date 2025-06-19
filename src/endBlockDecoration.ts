import * as vscode from "vscode";

let activeDecoration: vscode.TextEditorDecorationType | null = null;
let lastDecoratedLine: number | null = null;

export interface BlockInfo {
  startLine: number;
  endLine: number;
  headerText: string;
}

export function getAllBlockEnds(document: vscode.TextDocument): BlockInfo[] {
  const blocks: BlockInfo[] = [];
  const lang = document.languageId;
  // Advanced curly-brace block matcher for JS/TS/PHP with correct if/else/try/catch association
  const stack: {
    start: number;
    header: string;
    type?: string;
    parentHeader?: string;
  }[] = [];
  const blockHeaderRegex =
    /^(\s*)(if|else if|else|try|catch|finally|for|while|switch|case|default)\b/i;
  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i).text;
    // Handle lines with both '}' and '{' (e.g., '} else {')
    let idx = 0;
    while (idx < line.length) {
      if (line[idx] === "}") {
        const block = stack.pop();
        if (block) {
          blocks.push({
            startLine: block.parentHeader ? block.start : block.start,
            endLine: i,
            headerText: block.parentHeader ? block.parentHeader : block.header,
          });
        }
        idx++;
        continue;
      }
      if (line[idx] === "{") {
        // Determine block type for special handling
        let type = undefined;
        let headerText = line.trim();
        let parentHeader = undefined;
        // If this line is only an opening curly brace, use the previous non-empty line as header
        if (/^\s*{\s*$/.test(line)) {
          let prev = i - 1;
          while (prev >= 0 && document.lineAt(prev).text.trim() === "") {
            prev--;
          }
          if (prev >= 0) {
            headerText = document.lineAt(prev).text.trim() + " {";
          }
        }
        const match = blockHeaderRegex.exec(line);
        if (match) {
          type = match[2].toLowerCase();
        }
        if (["else", "else if", "catch", "finally"].includes(type || "")) {
          // Find the last if/try on the stack
          for (let j = stack.length - 1; j >= 0; j--) {
            if (
              (type === "else" || type === "else if") &&
              (stack[j].type === "if" || stack[j].type === "else if")
            ) {
              parentHeader = stack[j].header;
              break;
            } else if (
              (type === "catch" || type === "finally") &&
              stack[j].type === "try"
            ) {
              parentHeader = stack[j].header;
              break;
            }
          }
          stack.push({ start: i, header: headerText, type, parentHeader });
        } else {
          stack.push({ start: i, header: headerText, type });
        }
        idx++;
        continue;
      }
      idx++;
    }
  }
  return blocks;
}

export function showEndBlockDecoration(
  editor: vscode.TextEditor,
  block: BlockInfo
) {
  if (activeDecoration) {
    editor.setDecorations(activeDecoration, []);
    activeDecoration.dispose();
    activeDecoration = null;
  }
  lastDecoratedLine = block.endLine;
  activeDecoration = vscode.window.createTextEditorDecorationType({
    after: {
      contentText: ` //end of (${block.startLine + 1}) : ${block.headerText}`,
      color: "#777777", // Subtle gray color
      fontStyle: "italic", // Remove italic for less emphasis
    },
    isWholeLine: false,
  });
  const range = new vscode.Range(
    block.endLine,
    editor.document.lineAt(block.endLine).range.end.character,
    block.endLine,
    editor.document.lineAt(block.endLine).range.end.character
  );
  editor.setDecorations(activeDecoration, [range]);
}

export function hideEndBlockDecoration(editor: vscode.TextEditor) {
  if (activeDecoration) {
    editor.setDecorations(activeDecoration, []);
    activeDecoration.dispose();
    activeDecoration = null;
    lastDecoratedLine = null;
  }
}
