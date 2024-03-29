import { Type } from "../interfaces/type";
import type { Cell } from "../interfaces/cell";
import { sleep } from "./utils"
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
    originalGrid : Game;
    rollouts: number;
    time: number;
    constructor(grid: Cell[][]){
        this.root = new Node(NaN, null);
        this.originalGrid = new Game(Type.Red, structuredClone(grid));
        this.rollouts = 0;
        this.time = 0;
    }

    selection(){
        let grid =  new Game(structuredClone(this.originalGrid.player), structuredClone(this.originalGrid.grid));
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

            grid.makeMove(node.move);

            if(node.N == 0){
                return {node: node, grid: grid};
            }
            
        }
        
        if(this.expand(node, grid)){
            node = node.children[Math.floor(Math.random() * node.children.length)];
            grid.makeMove(node.move)
        }

        return {node: node, grid: grid};
    }

    expand(parent: Node, grid: Game){
        if(grid.checkEnd()){
            return false;
        }
        const legal : number[] = grid.getLegalMoves();

        for(let i = 0; i < legal.length; i++){
            const matchingChild = parent.children.find(child => child.move === legal[i]);
            if(!matchingChild){
                parent.children.push(new Node(legal[i], parent))
            }
        }


        return true;
    }

    rollout(grid: Game){
        while(grid.checkEnd() == false){
            let legalMoves = grid.getLegalMoves();
            grid.makeMove( legalMoves[Math.floor(Math.random() * legalMoves.length)])
        }

        return grid.outcome();
    }

   backprop(node: Node | null, turn: Type, outcome: Type){
        let reward = 0;

        if(outcome != turn){
            reward = 1;
        }

        while(node != null){

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
        let timeLimit = 5000;
        let rolloutCount = 0;
        let start = Date.now()
        let extra = Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000
        for(let i = 0; i < 120000 + extra ; i ++){
              let selected = this.selection();
              let node = selected.node;
              let grid = selected.grid;
              let outcome = this.rollout(grid);
              this.backprop(node, grid.player, outcome);
              rolloutCount = rolloutCount + 1;
              if(i % 10000 == 0){
                await new Promise((resolve) => requestAnimationFrame(resolve));
              }
              
              console.log("here, ", i)
        }
        this.rollouts = rolloutCount;
        this.time = Date.now() - start;
        return new Promise<void>((resolve) => resolve());
    }

    best(){
        if(this.originalGrid.checkEnd() == true){
            return -1;
        }
        let children = this.root.children;
        let maxNode = children[0];
        for(let i = 1; i < children.length; i++){
            let newNode = children[i];
            if(newNode.N > maxNode.N){
                maxNode = newNode;
            }
        }

        let maxNodes = children.filter(n => n.N === maxNode.N);

        let node = maxNodes[Math.floor(Math.random() * maxNodes.length)];
        return node.move;

    }

    update(move: number){
        console.log(this.originalGrid.player)
        this.originalGrid.makeMove(move);
        const matchingChild = this.root.children.find(child => child.move === move);

        if (matchingChild) {
            this.root = matchingChild;

        } else {
            this.root = new Node(NaN, null);
        }
    }
}


export class Game {
    player: Type;
    grid: Cell[][];


    constructor(player: Type, board: Cell[][]){
        this.player = player;
        this.grid = board;
    }

    makeMove(move: number) {
        
        for(let depth = 0; depth < 6; depth++){
            if(this.grid[move][depth].cellType != Type.None ){
                this.grid[move][depth - 1] = { cellType: this.player };
                if(this.player == Type.Red){
                    this.player = Type.Yellow;
                } else {
                    this.player = Type.Red;
                }
                return;
            }
        }
        this.grid[move][5] = { cellType: this.player };

        if(this.player == Type.Red){
            this.player = Type.Yellow;
        } else {
            this.player = Type.Red;
        }
    }

    getLegalMoves(){
        return Array.from({ length: 7 }, (_, col) => col)
                .filter(col => this.grid[col][0].cellType === Type.None);
    }

    checkWin(){
        const BOARDHEIGHT = 6;
        const BOARDWIDTH = 7;
        for(let c = 0; c < BOARDWIDTH; c++){
            for(let r = 0; r < BOARDHEIGHT; r++){
                if(this.grid[c][r].cellType != Type.None){
                    if(r+3 < BOARDHEIGHT){
                        if(this.grid[c][r].cellType == this.grid[c][r + 1].cellType && this.grid[c][r].cellType == this.grid[c][r + 2].cellType && this.grid[c][r].cellType ==  this.grid[c][r + 3].cellType){
                            return this.grid[c][r].cellType;
                        }
                    }
                    if(c + 3 < BOARDWIDTH){
                        if(this.grid[c][r].cellType == this.grid[c + 1][r].cellType && this.grid[c][r].cellType == this.grid[c + 2][r].cellType && this.grid[c][r].cellType ==  this.grid[c + 3][r].cellType){
                            return this.grid[c][r].cellType;
                        }
                    }
    
                    if(c + 3 < BOARDWIDTH && r + 3 < BOARDHEIGHT){
                        if(this.grid[c][r].cellType == this.grid[c + 1][r + 1].cellType && this.grid[c][r].cellType == this.grid[c + 2][r + 2].cellType && this.grid[c][r].cellType ==  this.grid[c + 3][r + 3].cellType){
                            return this.grid[c][r].cellType;
                        }
                    }
                    if(c >= 3 && typeof this.grid[c - 3][r + 3] !== "undefined"){
                        if(this.grid[c][r].cellType == this.grid[c - 1][r + 1].cellType && this.grid[c][r].cellType == this.grid[c - 2][r + 2].cellType && this.grid[c][r].cellType ==  this.grid[c - 3][r + 3].cellType){
                            return this.grid[c][r].cellType;
                        }
                    }
                }
    
                
            }
        }
        return Type.None;
    }



    checkEnd(){
        if(this.checkWin() != Type.None) {
            return true;
        }
    
        if(this.grid[0][0].cellType != Type.None && this.grid[1][0].cellType != Type.None && this.grid[2][0].cellType != Type.None && this.grid[3][0].cellType != Type.None && this.grid[4][0].cellType != Type.None && this.grid[5][0].cellType != Type.None && this.grid[6][0].cellType != Type.None){
            return true;
        }
    
        return false;
    }

    outcome(){
        if(this.checkEnd() && this.checkWin() != Type.None){
            return Type.Draw;
        }
    
        if(this.checkWin() == Type.Red){
            return Type.Red
        } else {
            return Type.Yellow
        }
    }
}