import type { Cell } from "../interfaces/cell"
import { Type } from "../interfaces/type";


export function countNumMoves(grid: Cell[][]): number {
    let count = 0
    for (let col = 0; col < grid[0].length; col++) {
      if (!grid[col][0]) {
        count++
      }
    }
    return count;
}



export function checkWin(grid : Cell[][]){
    const BOARDHEIGHT = 6;
    const BOARDWIDTH = 7;
    for(let c = 0; c < BOARDWIDTH; c++){
        for(let r = 0; r < BOARDHEIGHT; r++){
            if(grid[c][r].cellType != Type.None){
                if(r+3 < BOARDHEIGHT){
                    if(grid[c][r].cellType == grid[c][r + 1].cellType && grid[c][r].cellType == grid[c][r + 2].cellType && grid[c][r].cellType ==  grid[c][r + 3].cellType){
                        return grid[c][r].cellType;
                    }
                }
                if(c + 3 < BOARDWIDTH){
                    if(grid[c][r].cellType == grid[c + 1][r].cellType && grid[c][r].cellType == grid[c + 2][r].cellType && grid[c][r].cellType ==  grid[c + 3][r].cellType){
                        return grid[c][r].cellType;
                    }
                }

                if(c + 3 < BOARDWIDTH && r + 3 < BOARDHEIGHT){
                    if(grid[c][r].cellType == grid[c + 1][r + 1].cellType && grid[c][r].cellType == grid[c + 2][r + 2].cellType && grid[c][r].cellType ==  grid[c + 3][r + 3].cellType){
                        return grid[c][r].cellType;
                    }
                }
                if(c > 3 && typeof grid[c - 3][r + 3] !== "undefined"){
                    if(grid[c][r].cellType == grid[c - 1][r + 1].cellType && grid[c][r].cellType == grid[c - 2][r + 2].cellType && grid[c][r].cellType ==  grid[c - 3][r + 3].cellType){
                        return grid[c][r].cellType;
                    }
                }
            }

            
        }
    }
    return Type.None;
}

export function checkEnd(grid: Cell[][]){
    if(checkWin(grid) != Type.None) {
        return true;
    }

    if(grid[0][0].cellType != Type.None && grid[1][0].cellType != Type.None && grid[2][0].cellType != Type.None && grid[3][0].cellType != Type.None && grid[4][0].cellType != Type.None && grid[5][0].cellType != Type.None && grid[6][0].cellType != Type.None){
        return true;
    }

    return false;
}


export function getLegalMoves(grid: Cell[][]){
    return Array.from({ length: 7 }, (_, col) => col)
            .filter(col => grid[col][0].cellType === Type.None);
}

export function makeMove(grid: Cell[][], move: number, turn: Type){


    for(let depth = 0; depth < 6; depth++){
        if(grid[move][depth].cellType != Type.None ){
            grid[move][depth - 1] = { cellType: turn };
            grid = grid;
            return;
        }
    }
    grid[move][5] = { cellType: turn};

}

export function outcome(grid: Cell[][]){
    if(checkEnd(grid) && checkWin(grid) != Type.None){
        return Type.Draw;
    }

    if(checkWin(grid) == Type.Red){
        return Type.Red
    } else {
        return Type.Yellow
    }
}

export function sleep(ms : number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}