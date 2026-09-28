export interface FileTreeNode {
  name: string;
  path: string;
  children: FileTreeNode[];
  isFile: boolean;
}

/** Builds a folder tree from flat paths, collapsing single-child folder chains (a/b/c). */
export function buildFileTree(paths: string[]): FileTreeNode[] {
  const root: FileTreeNode = { name: '', path: '', children: [], isFile: false };

  for (const path of paths) {
    let node = root;
    path.split('/').forEach((part, index, parts) => {
      const isFile = index === parts.length - 1;
      const childPath = parts.slice(0, index + 1).join('/');
      let child = node.children.find((c) => c.name === part && c.isFile === isFile);
      if (!child) {
        child = { name: part, path: childPath, children: [], isFile };
        node.children.push(child);
      }
      node = child;
    });
  }

  return root.children.map(compact).sort(byFolderThenName);
}

function compact(node: FileTreeNode): FileTreeNode {
  let current = node;
  while (!current.isFile && current.children.length === 1 && !current.children[0].isFile) {
    const child = current.children[0];
    current = { ...child, name: `${current.name}/${child.name}` };
  }
  return { ...current, children: current.children.map(compact).sort(byFolderThenName) };
}

function byFolderThenName(a: FileTreeNode, b: FileTreeNode): number {
  if (a.isFile !== b.isFile) return a.isFile ? 1 : -1;
  return a.name.localeCompare(b.name);
}
