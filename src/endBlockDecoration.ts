import * as vscode from "vscode";

let endBlockDecoration: vscode.TextEditorDecorationType | undefined;
let endBlockLine: number | undefined;
let cursorListener: vscode.Disposable | undefined;

export function showEndBlockDecoration(
  editor: vscode.TextEditor,
  doc: vscode.TextDocument,
  endLine: number,
  startLine: number,
  startLineText: string
) {
  // Dispose previous decoration and listener if any
  if (endBlockDecoration) endBlockDecoration.dispose();
  if (cursorListener) cursorListener.dispose();

  endBlockDecoration = vscode.window.createTextEditorDecorationType({
    after: {
      contentText: ` //end of ${startLine + 1} : ${startLineText}`,
      color: "#888",
      margin: "0 0 0 1em",
    },
    isWholeLine: false,
  });
  const range = new vscode.Range(
    endLine,
    doc.lineAt(endLine).text.length,
    endLine,
    doc.lineAt(endLine).text.length
  );
  editor.setDecorations(endBlockDecoration, [range]);
  endBlockLine = endLine;
  // Listen for cursor movement to remove decoration if cursor leaves end line
  cursorListener = vscode.window.onDidChangeTextEditorSelection((e) => {
    if (
      e.textEditor.document === doc &&
      endBlockDecoration &&
      (e.selections.length === 0 ||
        e.selections[0].active.line !== endBlockLine)
    ) {
      endBlockDecoration.dispose();
      endBlockDecoration = undefined;
      endBlockLine = undefined;
      if (cursorListener) cursorListener.dispose();
    }
  });
}
