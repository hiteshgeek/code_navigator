import * as vscode from "vscode";

export interface Bookmark {
  filePath: string;
  line: number;
  label: string;
  headerText: string;
}

export class BookmarksProvider
  implements vscode.TreeDataProvider<BookmarkTreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    BookmarkTreeItem | undefined | void
  > = new vscode.EventEmitter<BookmarkTreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<
    BookmarkTreeItem | undefined | void
  > = this._onDidChangeTreeData.event;

  constructor(private context: vscode.ExtensionContext) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: BookmarkTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: BookmarkTreeItem): Thenable<BookmarkTreeItem[]> {
    const bookmarks: Bookmark[] = this.context.globalState.get(
      "codeNavigatorBookmarks",
      []
    );

    if (!element) {
      // Group by project
      const projects = Array.from(
        new Set(bookmarks.map((b) => this.getProjectName(b.filePath)))
      ).sort();
      return Promise.resolve(
        projects.map(
          (project) =>
            new BookmarkTreeItem(
              project,
              vscode.TreeItemCollapsibleState.Collapsed,
              undefined,
              project,
              undefined // Ensure labelName is undefined for project nodes
            )
        )
      );
    } else if (element.projectName && !element.bookmark && !element.labelName) {
      // Show labels for this project
      const projectBookmarks = bookmarks.filter(
        (b) => this.getProjectName(b.filePath) === element.projectName
      );
      const labels = Array.from(
        new Set(projectBookmarks.map((b) => b.label))
      ).sort();
      return Promise.resolve(
        labels.map(
          (label) =>
            new BookmarkTreeItem(
              label,
              vscode.TreeItemCollapsibleState.Collapsed,
              undefined,
              element.projectName, // Ensure projectName is undefined for label nodes
              label
            )
        )
      );
    } else if (element.labelName && element.projectName && !element.bookmark) {
      // Show bookmarks for this label in the correct project

      const children = bookmarks
        .filter((b) => {
          const projectMatch =
            this.getProjectName(b.filePath) === element.projectName;
          const labelMatch = b.label === element.labelName;
          return projectMatch && labelMatch;
        })
        .map(
          (b) =>
            new BookmarkTreeItem(
              `${this.getFileName(b.filePath)}:${b.line + 1}  ${b.headerText}`,
              vscode.TreeItemCollapsibleState.None,
              b
            )
        );
      return Promise.resolve(children);
    }
    return Promise.resolve([]);
  }

  getFileName(filePath: string): string {
    return filePath.split(/[\\\/]/).pop() || filePath;
  }

  getProjectName(filePath: string): string {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return "Unknown Project";
    const folder = workspaceFolders.find((wf) =>
      filePath.startsWith(wf.uri.fsPath)
    );
    return folder ? folder.name : "Unknown Project";
  }
}

export class BookmarkTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly bookmark?: Bookmark,
    public readonly projectName?: string,
    public readonly labelName?: string
  ) {
    super(label, collapsibleState);
    if (bookmark) {
      this.command = {
        command: "code-navigator.openBookmark",
        title: "Open Bookmark",
        arguments: [bookmark],
      };
      this.description = `${this.getFileName(bookmark.filePath)}:${
        bookmark.line + 1
      }`;
      this.tooltip = `${bookmark.headerText}\n${bookmark.filePath}:$${
        bookmark.line + 1
      }`;
      this.iconPath = new vscode.ThemeIcon("bookmark");
      this.contextValue = "bookmark";
    } else if (projectName && !labelName) {
      this.iconPath = new vscode.ThemeIcon("folder"); // Project-level icon
      this.contextValue = "projectLabel";
    } else if (labelName) {
      this.iconPath = new vscode.ThemeIcon("list-unordered"); // Label-level icon
      this.contextValue = "bookmarkLabel";
    }
  }
  getFileName(filePath: string): string {
    return filePath.split(/[\\\/]/).pop() || filePath;
  }
}
