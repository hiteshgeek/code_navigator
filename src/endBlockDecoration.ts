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
  // Robust curly-brace block matcher for JS/TS/PHP
  const stack: { start: number; header: string }[] = [];
  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i).text;
    // Detect block start: '{' (handle multiple on one line)
    let openIdx = line.indexOf("{");
    while (openIdx !== -1) {
      // For else/catch/finally, use this line as header
      // For all others, use this line as header
      stack.push({ start: i, header: line.trim() });
      openIdx = line.indexOf("{", openIdx + 1);
    }
    // Detect block end: '}' (handle multiple on one line)
    let closeIdx = line.indexOf("}");
    while (closeIdx !== -1) {
      const block = stack.pop();
      if (block) {
        blocks.push({
          startLine: block.start,
          endLine: i,
          headerText: block.header,
        });
      }
      closeIdx = line.indexOf("}", closeIdx + 1);
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
      contentText: ` //${block.startLine + 1} : ${block.headerText}`,
      color: "#888888", // Subtle gray color
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
