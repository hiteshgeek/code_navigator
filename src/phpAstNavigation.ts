import * as vscode from "vscode";
import { getPhpAst } from "./phpAstBridge";
import { navigateToJsBlock } from "./jsSymbolNavigation";

export async function navigateToBlock(
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
  const enableControlFlowBlocks = config.get<boolean>(
    "enableControlFlowBlocks"
  );
  // ...add more as needed for your block types

  let flatBlockSymbols: any[] = [];
  if (doc.languageId === "php") {
    // Use AST for PHP
    const ast = await getPhpAst(doc.fileName);
    // Combine all block types for navigation
    let blocks = [
      ...(ast.functions || []),
      ...(ast.classMethods || []),
      ...(ast.classes || []),
    ];
    if (enableControlFlowBlocks && ast.controlFlowBlocks) {
      blocks = blocks.concat(ast.controlFlowBlocks);
    }
    flatBlockSymbols = blocks
      .filter((b) => {
        if (b.type === "enum" && !enableEnumBlocks) return false;
        if (
          (b.type === "if" ||
            b.type === "elseif" ||
            b.type === "else" ||
            b.type === "switch" ||
            b.type === "case") &&
          !enableControlFlowBlocks
        )
          return false;
        // Always include class, method, function, interface, trait
        return true;
      })
      .map((b) => ({
        name: b.name,
        kind:
          b.type === "class"
            ? vscode.SymbolKind.Class
            : b.type === "trait"
            ? vscode.SymbolKind.Struct
            : b.type === "interface"
            ? vscode.SymbolKind.Interface
            : b.type === "enum"
            ? vscode.SymbolKind.Enum
            : b.type === "if" ||
              b.type === "elseif" ||
              b.type === "else" ||
              b.type === "switch" ||
              b.type === "case"
            ? vscode.SymbolKind.Event // Use Event for control flow blocks (or pick another unused kind)
            : vscode.SymbolKind.Method,
        range: new vscode.Range(b.startLine - 1, 0, b.endLine - 1, 0),
        selectionRange: new vscode.Range(
          b.startLine - 1,
          0,
          b.startLine - 1,
          0
        ),
        children: [],
        detail: b.type,
      }));
  } else if (["javascript", "typescript"].includes(doc.languageId)) {
    await navigateToJsBlock(direction, position);
    return;
  } else {
    // Use Symbol Provider for other languages
    const allSymbols =
      (await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
        "vscode.executeDocumentSymbolProvider",
        doc.uri
      )) || [];
    function flatten(
      symbols: vscode.DocumentSymbol[]
    ): vscode.DocumentSymbol[] {
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
      vscode.SymbolKind.Variable, // <-- Added Variable
    ];
    flatBlockSymbols = flatten(allSymbols).filter((sym) => {
      if (sym.kind === vscode.SymbolKind.Enum && !enableEnumBlocks)
        return false;
      if (sym.kind === vscode.SymbolKind.Interface && !enableNamespaceBlocks)
        return false;
      if (sym.kind === vscode.SymbolKind.Struct && !enableRegionBlocks)
        return false;
      // For variables, only include if likely a function/arrow function
      if (sym.kind === vscode.SymbolKind.Variable) {
        // Heuristic: name or detail contains 'function' or '=>' or 'ƒ' (shown in some themes)
        const isFuncLike =
          (sym.detail && /function|=>|ƒ/.test(sym.detail)) ||
          /function|arrow|=>|ƒ/.test(sym.name);
        // Additional heuristic: if the variable's range spans more than 1 line, check the document text for 'function' keyword
        if (!isFuncLike && sym.range.end.line > sym.range.start.line) {
          const text = doc.getText(sym.range);
          if (/function\s*\(/.test(text)) return true;
        }
        return isFuncLike;
      }
      // Always include function, method, class, etc.
      return eligibleKinds.includes(sym.kind);
    });
  }

  // Sort by relevant line
  function getRelevantLine(sym: any, position: "start" | "end") {
    return position === "start"
      ? sym.selectionRange?.start.line ?? sym.range.start.line
      : sym.range.end.line;
  }
  flatBlockSymbols.sort(
    (a, b) => getRelevantLine(a, position) - getRelevantLine(b, position)
  );

  // Navigation logic
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
    return;
  }
  vscode.window.showInformationMessage(
    "No more code blocks found in this direction."
  );
}
