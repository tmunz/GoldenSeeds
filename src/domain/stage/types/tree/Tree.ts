import { random } from "../../../../utils/Random";

export interface Config {
  depth: number;
  splitAngle: number;
  splitVariation: number;
  splitProbability: number;
  lengthConservation: number;
  lengthVariation: number;
  seed: number;
}

interface Node {
  point: Point;
  level: number;
  angle: number;
  branches?: Node[];
}

interface Limb {
  from: Point;
  to: Point;
  level: number;
}

export class Tree {

  private _root: Node;
  private _limbs: Limb[];

  constructor(config: Config) {
    const { root, limbs } = Tree.calculateTree(config);
    this._root = root;
    this._limbs = limbs;
  }

  get root() {
    return this._root;
  }

  get limbs() {
    return this._limbs;
  }


  private static calculateTree(config: Config): { root: Node, limbs: Limb[] } {

    const root: Node = {
      point: { x: 0, y: 0 }, level: 0, angle: undefined, branches: [
        { point: { x: 0, y: 1 }, level: 1, angle: Math.PI / 2 }
      ]
    };
    const limbs: Limb[] = [{ from: root.point, to: root.branches[0].point, level: 0 }];

    const queue = [...root.branches];
    let seed = config.seed;
    let currentNode: Node;
    while (currentNode = queue.pop()) {
      if (currentNode.level < config.depth) {
        currentNode.branches = [];
        const branchAmount = 2;
        for (let i = 0; i < branchAmount; i++) {
          seed++;
          if (1 - config.splitProbability <= random(0, 1, seed)) {
            const branchInRange = i * branchAmount - branchAmount / 2;

            const relativeAngle = branchInRange * (config.splitAngle * Math.PI / 180);
            const splitVariation = random(-config.splitVariation / 2, config.splitVariation / 2, seed + 1000);
            const angle = currentNode.angle + relativeAngle + splitVariation;

            const baseLength = Math.pow(config.lengthConservation, currentNode.level);
            const lengthVariation = random(1 - config.lengthVariation, 1, seed + 500);
            const length = baseLength * lengthVariation;

            const point = {
              x: Math.cos(angle) * length + currentNode.point.x,
              y: Math.sin(angle) * length + currentNode.point.y,
            };
            currentNode.branches.push({ point, level: currentNode.level + 1, angle });
            limbs.push({ from: currentNode.point, to: point, level: currentNode.level });
          }
        }
        queue.unshift(...currentNode.branches);
      }
    }
    return { root, limbs };
  }
}