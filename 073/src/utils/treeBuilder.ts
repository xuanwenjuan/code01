interface TreeNode {
  id: number;
  parentId: number | null;
  children?: TreeNode[];
  [key: string]: any;
}

export class TreeBuilder {
  static buildTree<T extends TreeNode>(items: T[], parentId: number | null = null): T[] {
    return items
      .filter(item => item.parentId === parentId)
      .map(item => ({
        ...item,
        children: this.buildTree(items, item.id)
      })) as T[];
  }

  static flattenTree<T extends TreeNode>(tree: T[], result: T[] = []): T[] {
    for (const node of tree) {
      result.push(node);
      if (node.children && node.children.length > 0) {
        this.flattenTree(node.children as T[], result);
      }
    }
    return result;
  }

  static findNode<T extends TreeNode>(tree: T[], id: number): T | null {
    for (const node of tree) {
      if (node.id === id) {
        return node;
      }
      if (node.children && node.children.length > 0) {
        const found = this.findNode(node.children as T[], id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  static getChildrenIds<T extends TreeNode>(node: T): number[] {
    const ids: number[] = [node.id];
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        ids.push(...this.getChildrenIds(child as T));
      }
    }
    return ids;
  }
}
