// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { navigateToBlock } from "./phpAstNavigation";

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

// This method is called when your extension is deactivated
export function deactivate() {}
