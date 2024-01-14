import { Type } from "../interfaces/type";
import type { Cell } from "../interfaces/cell";
import { checkEnd, outcome, getLegalMoves, makeMove, sleep } from "./utils"
export class Node {
    Q: number;
    N: number;
    move: number;
    parent: Node | null;
    children: Node[];
    outcome: number;

    constructor(move: number, parent: Node | null, outcome?: number){
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
    player: Type;
    grid : Cell[][];

    constructor(grid: Cell[][]){
        this.root = new Node(NaN, null);
        this.player = Type.Red;
        this.grid = structuredClone(grid);
    }

    selection(){
        let grid =  structuredClone(this.grid);
        let node = this.root;

        while (node.children.length > 0){
            let children : Node[] = node.children;

            let maxNode = children[0];
            for(let i = 1; i < children.length; i++){
                let newNode = children[i];
                if(newNode.value() > maxNode.value()){
                    maxNode = newNode;
                }
            }

            let maxNodes = children.filter(n => n.value() === maxNode.value());

            node = maxNodes[Math.floor(Math.random() * maxNodes.length)];
            makeMove(grid, node.move, this.player);
            if(this.player == Type.Red){
                this.player = Type.Yellow;
            } else {
                this.player = Type.Red;
            }
            if(node.N == 0){
                return {node: node, grid: grid};
            }
            
        }
        if(this.expand(node, grid)){
            node = node.children[Math.floor(Math.random() * node.children.length)];
            makeMove(grid, node.move, this.player);
            if(this.player == Type.Red){
                this.player = Type.Yellow;
            } else {
                this.player = Type.Red;
            }
        }

        return {node: node, grid: grid};
    }

    expand(parent: Node, grid: Cell[][]){
        if(checkEnd(grid)){
            return false;
        }

        const children: Node[] = getLegalMoves(grid).map(move => new Node(move, parent));
        parent.children.push(...children);

        return true;
    }

    rollout(grid: Cell[][]){
        while(checkEnd(grid) == false){
            let legalMoves = getLegalMoves(grid);
            makeMove(grid, legalMoves[Math.floor(Math.random() * legalMoves.length)], this.player);
            if(this.player == Type.Red){
                this.player = Type.Yellow;
            } else {
                this.player = Type.Red;
            }
            if(this.player == Type.Red){
                this.player = Type.Yellow;
            } else {
                this.player = Type.Red;
            }
        }

        return outcome(grid);
    }

    backprop(node: Node | null, turn: Type, outcome: Type){
        let reward = 0;

        if(outcome != turn){
            reward = 1;
        }

        for(;;){
            if(node == null && node != this.root){
                break;
            }

            node.N += 1;
            node.Q += reward;
            node = node.parent;

            if(outcome == Type.Draw){
                reward = 0;
            } else {
                reward = 1 - reward;
            }

         }
    }

    async search(){
        let timeLimit = 80;
        //let rolloutCount = 0;
        let start = Date.now()
        while (Date.now() - start <= timeLimit) {
              // Perform one MCTS step here
              let selected = this.selection();
              let node = selected.node;
              let grid = selected.grid;
              let outcome = this.rollout(grid);
              this.backprop(node, this.player, outcome);

          }

    }

    best(){
        console.log(this.grid)
        if(checkEnd(this.grid) == true){
            return -1;
        }
        let children = this.root.children;
        let maxNode = children[0];
        for(let i = 1; i < children.length; i++){
            let newNode = children[i];
            if(newNode.value() > maxNode.value()){
                maxNode = newNode;
            }
        }

        let maxNodes = children.filter(n => n.value() === maxNode.value());

        let node = maxNodes[Math.floor(Math.random() * maxNodes.length)];
        return node.move;

    }

    move(move: number){
        makeMove(this.grid, move, this.player);
        if(this.player == Type.Red){
            this.player = Type.Yellow;
        } else {
            this.player = Type.Red;
        }
        if(move in this.root.children){
            this.root = this.root.children[move];
        } else {
            this.root = new Node(NaN, null);
        }
    }
}


