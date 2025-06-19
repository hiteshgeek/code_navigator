import * as vscode from "vscode";
import { showEndBlockDecoration } from "./endBlockDecoration";

export async function navigateToJsBlock(
  direction: "next" | "previous",
  position: "start" | "end"
) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  const doc = editor.document;
  let currentLine = editor.selection.active.line;

  // Read extension settings
  const config = vscode.workspace.getConfiguration("codeNavigator");
  const enableEnumBlocks = config.get<boolean>("enableEnumBlocks");
  const enableNamespaceBlocks = config.get<boolean>("enableNamespaceBlocks");
  const enableRegionBlocks = config.get<boolean>("enableRegionBlocks");

  const allSymbols =
    (await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
      "vscode.executeDocumentSymbolProvider",
      doc.uri
    )) || [];
  function flatten(symbols: vscode.DocumentSymbol[]): vscode.DocumentSymbol[] {
    return symbols.reduce(
      (acc, sym) => acc.concat(sym, flatten(sym.children)),
      [] as vscode.DocumentSymbol[]
    );
  }
  const eligibleKinds = [
    vscode.SymbolKind.Function,
    vscode.SymbolKind.Method,
    vscode.SymbolKind.Class,
    vscode.SymbolKind.Struct,
    vscode.SymbolKind.Interface,
    vscode.SymbolKind.Enum,
    vscode.SymbolKind.Module,
    vscode.SymbolKind.Namespace,
    vscode.SymbolKind.Variable,
  ];
  let flatBlockSymbols = flatten(allSymbols).filter((sym) => {
    if (sym.kind === vscode.SymbolKind.Enum && !enableEnumBlocks) return false;
    if (sym.kind === vscode.SymbolKind.Interface && !enableNamespaceBlocks)
      return false;
    if (sym.kind === vscode.SymbolKind.Struct && !enableRegionBlocks)
      return false;
    if (sym.kind === vscode.SymbolKind.Variable) {
      const isFuncLike =
        (sym.detail && /function|=>|ƒ/.test(sym.detail)) ||
        /function|arrow|=>|ƒ/.test(sym.name);
      if (!isFuncLike && sym.range.end.line > sym.range.start.line) {
        const text = doc.getText(sym.range);
        if (/function\s*\(/.test(text)) return true;
      }
      return isFuncLike;
    }
    return eligibleKinds.includes(sym.kind);
  });

  function getRelevantLine(sym: any, position: "start" | "end") {
    return position === "start"
      ? sym.selectionRange?.start.line ?? sym.range.start.line
      : sym.range.end.line;
  }
  flatBlockSymbols.sort(
    (a, b) => getRelevantLine(a, position) - getRelevantLine(b, position)
  );

  let targetIdx = -1;
  if (direction === "next") {
    targetIdx = flatBlockSymbols.findIndex(
      (sym) => getRelevantLine(sym, position) > currentLine
    );
  } else {
    for (let i = flatBlockSymbols.length - 1; i >= 0; i--) {
      if (getRelevantLine(flatBlockSymbols[i], position) < currentLine) {
        targetIdx = i;
        break;
      }
    }
  }

  if (targetIdx !== -1 && flatBlockSymbols[targetIdx]) {
    const targetSym = flatBlockSymbols[targetIdx];
    const newLine = getRelevantLine(targetSym, position);
    const newPos = new vscode.Position(
      newLine,
      position === "start" ? 0 : doc.lineAt(newLine).text.length
    );
    editor.selection = new vscode.Selection(newPos, newPos);
    editor.revealRange(
      new vscode.Range(newPos, newPos),
      vscode.TextEditorRevealType.InCenter
    );

    // Show end block decoration if navigating to end
    if (position === "end") {
      // Get the content of the start line of the block
      const startLineNum =
        targetSym.range?.start?.line ??
        targetSym.selectionRange?.start?.line ??
        0;
      const startLineText = doc.lineAt(startLineNum).text.trim();
      showEndBlockDecoration(editor, doc, newLine, startLineNum, startLineText);
    }
    return;
  }
  vscode.window.showInformationMessage(
    "No more code blocks found in this direction."
  );
}
