import { execFile } from "child_process";
import * as path from "path";

/**
 * Calls the PHP ast-dump.php script and returns the parsed AST info for the given PHP file.
 * @param phpFilePath Absolute path to the PHP file to analyze
 * @returns Promise resolving to the AST info (functions, classMethods, etc)
 */
export function getPhpAst(phpFilePath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // Always resolve ast-dump.php relative to the extension's install directory
    const scriptPath = path.resolve(__dirname, "../ast-dump.php");
    const fs = require("fs");
    if (!fs.existsSync(scriptPath)) {
      reject(`ast-dump.php not found in extension: ${scriptPath}`);
      return;
    }
    execFile(
      "php",
      [scriptPath, phpFilePath],
      { cwd: process.cwd() },
      (error, stdout, stderr) => {
        if (error) {
          reject(stderr || error.message);
          return;
        }
        try {
          resolve(JSON.parse(stdout));
        } catch (e) {
          reject("Invalid JSON from PHP: " + stdout);
        }
      }
    );
  });
}
