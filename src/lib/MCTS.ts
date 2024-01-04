import { Type } from "../interfaces/type";
import type { Cell } from "../interfaces/cell";

export class Node {
    Q: number;
    N: number;
    move: number;
    parent: Node | null;
    children: Node[];
    outcome: number;

    constructor(move: number, parent: Node | null, outcome: number){
        if(!outcome){
            this.outcome = -1;
        } else {
            this.outcome = outcome;
        }

        this.move = move;
        this.parent = parent;
        this.children = [];
        this.Q = 0;
        this.N = 0;
    }

    value(){
        if(this.N == 0){
            return Infinity;
        } else if(!this.parent){
            return 0;
        } else {
            return this.Q / this.N + 1.41 * Math.sqrt(Math.log10(this.parent.N)/this.N)
        }
    }
}

export class MCTS{
    root: Node;

    constructor(root: Node){
        this.root = root;
    }

    selection(originalGrid: Cell[][]){
        let grid: Cell[][] = structuredClone(originalGrid);
        let node = this.root;

        while (node.children.length)
    }
}