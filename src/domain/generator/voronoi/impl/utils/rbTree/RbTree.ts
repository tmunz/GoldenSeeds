import { RbTreeNode } from './RbTreeNode';

// ---------------------------------------------------------------------------
// Red-Black tree code (based on C version of "rbtree" by Franck Bui-Huu
// https://github.com/fbuihuu/libtree/blob/master/rb.c
//
export class RbTree<TreeNode extends RbTreeNode<TreeNode>> {
  private root: TreeNode | undefined;

  constructor() {
    this.root = undefined;
  }

  getRoot(): TreeNode | undefined {
    return this.root;
  }

  insertAsSuccessorTo(successor: TreeNode, node: TreeNode | undefined): void {
    let parent: TreeNode | undefined;

    if (node) {
      successor.prev = node;
      successor.next = node.next;
      if (node.next) {
        node.next.prev = successor;
      }
      node.next = successor;

      if (node.right) {
        node = node.right;
        while (node.left) {
          node = node.left;
        }
        node.left = successor;
      } else {
        node.right = successor;
      }

      parent = node;
    } else if (this.root) {
      node = this.getFirst(this.root);
      successor.prev = undefined;
      successor.next = node;
      node.prev = successor;

      node.left = successor;
      parent = node;
    } else {
      successor.prev = undefined;
      successor.next = undefined;

      this.root = successor;
      parent = undefined;
    }

    successor.left = undefined;
    successor.right = undefined;
    successor.parent = parent;
    successor.red = true;
    let grandpa: TreeNode | undefined;
    let uncle: TreeNode | undefined;
    node = successor;
    while (parent && parent.red) {
      grandpa = parent.parent;
      if (grandpa && parent === grandpa.left) {
        uncle = grandpa.right;
        if (uncle && uncle.red) {
          parent.red = false;
          uncle.red = false;
          grandpa.red = true;
          node = grandpa;
        } else {
          if (node === parent.right) {
            this.rotateLeft(parent);
            node = parent;
            parent = node.parent;
          }
          if (parent) {
            parent.red = false;
            grandpa.red = true;
            this.rotateRight(grandpa);
          }
        }
      } else if (grandpa) {
        uncle = grandpa.left;
        if (uncle && uncle.red) {
          parent.red = uncle.red = false;
          grandpa.red = true;
          node = grandpa;
        } else {
          if (node === parent.left) {
            this.rotateRight(parent);
            node = parent;
            parent = node.parent;
          }
          if (parent) {
            parent.red = false;
            grandpa.red = true;
            this.rotateLeft(grandpa);
          }
        }
      }
      parent = node.parent;
    }

    if (this.root) {
      this.root.red = false;
    }
  }

  removeNode(node: TreeNode): void {
    if (node.next) {
      node.next.prev = node.prev;
    }
    if (node.prev) {
      node.prev.next = node.next;
    }
    node.next = undefined;
    node.prev = undefined;

    let parent: TreeNode | undefined = node.parent;
    const left: TreeNode | undefined = node.left;
    const right: TreeNode | undefined = node.right;
    let next: TreeNode | undefined;

    if (!left) {
      next = right;
    } else if (!right) {
      next = left;
    } else {
      next = this.getFirst(right);
    }

    if (parent) {
      if (parent.left === node) {
        parent.left = next;
      } else {
        parent.right = next;
      }
    } else {
      this.root = next;
    }

    let isRed = false;
    if (next && left && right) {
      isRed = next.red ?? false;
      next.red = node.red;
      next.left = left;
      left.parent = next;
      if (next !== right) {
        parent = next.parent;
        next.parent = node.parent;
        node = next.right;
        parent.left = node;
        next.right = right;
        right.parent = next;
      } else {
        next.parent = parent;
        parent = next;
        node = next.right;
      }
    } else {
      isRed = node.red ?? false;
      node = next;
    }

    if (node) {
      node.parent = parent;
    }

    if (isRed) {
      return;
    }

    if (node && node.red) {
      node.red = false;
      return;
    }

    let sibling: TreeNode;
    do {
      if (node === this.root) {
        break;
      }

      if (node === parent.left) {
        sibling = parent.right;
        if (sibling.red) {
          sibling.red = false;
          parent.red = true;
          this.rotateLeft(parent);
          sibling = parent.right;
        }

        if ((sibling.left && sibling.left.red) || (sibling.right && sibling.right.red)) {
          if (!sibling.right || !sibling.right.red) {
            sibling.left.red = false;
            sibling.red = true;
            this.rotateRight(sibling);
            sibling = parent.right;
          }
          sibling.red = parent.red;
          parent.red = sibling.right.red = false;
          this.rotateLeft(parent);
          node = this.root;
          break;
        }
      } else {
        sibling = parent.left;
        if (sibling.red) {
          sibling.red = false;
          parent.red = true;
          this.rotateRight(parent);
          sibling = parent.left;
        }

        if ((sibling.left && sibling.left.red) || (sibling.right && sibling.right.red)) {
          if (!sibling.left || !sibling.left.red) {
            sibling.right.red = false;
            sibling.red = true;
            this.rotateLeft(sibling);
            sibling = parent.left;
          }
          sibling.red = parent.red;
          parent.red = sibling.left.red = false;
          this.rotateRight(parent);
          node = this.root;
          break;
        }
      }

      sibling.red = true;
      node = parent;
      parent = parent.parent;
    } while (!node.red);

    if (node) {
      node.red = false;
    }
  }

  private rotateLeft(node: TreeNode): void {
    const p: TreeNode = node;
    const q: TreeNode = node.right;
    const parent: TreeNode = p.parent;

    if (parent) {
      if (parent.left === p) {
        parent.left = q;
      } else {
        parent.right = q;
      }
    } else {
      this.root = q;
    }

    q.parent = parent;
    p.parent = q;
    p.right = q.left;

    if (p.right) {
      p.right.parent = p;
    }
    q.left = p;
  }

  private rotateRight(node: TreeNode): void {
    const p: TreeNode = node;
    const q: TreeNode | undefined = node.left;
    const parent: TreeNode | undefined = p.parent;
    if (parent) {
      if (parent.left === p) {
        parent.left = q;
      } else {
        parent.right = q;
      }
    } else {
      this.root = q;
    }

    if (q) {
      q.parent = parent;
      p.parent = q;
      p.left = q.right;

      if (p.left) {
        p.left.parent = p;
      }
      q.right = p;
    }
  }

  private getFirst(node: TreeNode): TreeNode {
    while (node.left) {
      node = node.left;
    }
    return node;
  }
}
