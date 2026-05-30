interface TreeNode {
  id: number;
  parentId?: number | null;
  children?: TreeNode[];
  [key: string]: any;
}

export const buildTree = <T extends TreeNode>(
  items: T[],
  parentId: number | null = null
): T[] => {
  const tree: T[] = [];

  for (const item of items) {
    if (item.parentId === parentId || (parentId === null && item.parentId === undefined)) {
      const children = buildTree(items, item.id);
      if (children.length > 0) {
        (item as any).children = children;
      }
      tree.push(item);
    }
  }

  return tree.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
};

export const flattenTree = <T extends TreeNode>(tree: T[]): T[] => {
  const result: T[] = [];

  const flatten = (nodes: T[]) => {
    for (const node of nodes) {
      result.push(node);
      if (node.children && node.children.length > 0) {
        flatten(node.children as T[]);
      }
    }
  };

  flatten(tree);
  return result;
};
