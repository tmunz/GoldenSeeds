export interface RbTreeNode<TreeNode extends RbTreeNode<TreeNode>> {
  
  parent?: TreeNode;
  prev?: TreeNode;
  next?: TreeNode;
  right?: TreeNode;
  left?: TreeNode;

  red?: boolean;
}