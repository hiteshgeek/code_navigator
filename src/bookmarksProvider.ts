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
      // Group by label, sorted alphabetically
      const labels = Array.from(new Set(bookmarks.map((b) => b.label))).sort();
      return Promise.resolve(
        labels.map(
          (label) =>
            new BookmarkTreeItem(
              label,
              vscode.TreeItemCollapsibleState.Collapsed,
              undefined,
              label
            )
        )
      );
    } else if (element.label && !element.bookmark) {
      // Show bookmarks for this label
      const children = bookmarks
        .filter((b) => b.label === element.label)
        .map(
          (b) =>
            new BookmarkTreeItem(
              `${this.getFileName(b.filePath)}:${b.line + 1}  ${b.headerText}`,
              vscode.TreeItemCollapsibleState.None,
              b,
              element.label
            )
        );
      return Promise.resolve(children);
    }
    return Promise.resolve([]);
  }

  getFileName(filePath: string): string {
    return filePath.split(/[\\\/]/).pop() || filePath;
  }
}

export class BookmarkTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly bookmark?: Bookmark,
    public readonly groupLabel?: string
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
    } else {
      this.iconPath = new vscode.ThemeIcon("list-unordered");
      this.contextValue = "bookmarkLabel";
    }
  }
  getFileName(filePath: string): string {
    return filePath.split(/[\\\/]/).pop() || filePath;
  }
}
