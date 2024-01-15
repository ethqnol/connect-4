<script lang=ts>
import type { Cell } from "../interfaces/cell";
import { MCTS } from "../lib/MCTS"
import { Type } from "../interfaces/type";
import { tweened } from "svelte/motion";
import { cubicOut } from "svelte/easing";
import GridCell from "./Cell.svelte";
import Temporary from "./Temporary.svelte";

const BOARDHEIGHT = 6
const BOARDWIDTH = 7

export let grid : Cell[][]
let boardNode : HTMLElement;

let mcts = new MCTS(grid);

enum Turn {
    Player,
    Computer
}

let placeholderPosition = tweened(0, { easing: cubicOut });
let column = 0;
let turn = Turn.Player

export function checkWin(){

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

function checkEnd(){
    if(checkWin() != Type.None) {
        return true;
    }

    if(grid[0][0].cellType != Type.None && grid[1][0].cellType != Type.None && grid[2][0].cellType != Type.None && grid[3][0].cellType != Type.None && grid[4][0].cellType != Type.None && grid[5][0].cellType != Type.None && grid[6][0].cellType != Type.None){
        return true;
    }

    return false;
}

async function handleMousemove(event : MouseEvent) {
    const nodeBoundX = boardNode.getBoundingClientRect().x;
    const change = event.clientX - nodeBoundX - 4;
    column = Math.min(Math.max(Math.floor(change / (60)), 0), 6);
    placeholderPosition.set(column * (60) + 16);
}

function playMove(index: number){
    if(grid[0][0].cellType != Type.None){
        return false
    }
    let type = Type.Red;
    if(turn == Turn.Computer) {
        type = Type.Yellow
    }
    for(let depth = 0; depth <= BOARDHEIGHT - 1; depth++){
        if(grid[index][depth].cellType != Type.None ){
            grid[index][depth - 1] = { cellType: type};
            grid = grid;
            return;
        }
    }

    grid[index][5] = { cellType: type};
    return true;
}

async function computerMove(){
    mcts.search();
    let bestMove : number = mcts.best();
    console.log(bestMove)
    playMove(bestMove);
    mcts.update(bestMove);
    turn = Turn.Player

}

async function handleInput(index : number){
    if(turn != Turn.Player){
        return;
    }
    if(grid[index][0].cellType != Type.None) {
        return;
    }

    playMove(index);
    grid = grid;
    await sleep(200);
    mcts.update(index);

    if(checkEnd()){
        console.log(")^&*&(*)^&((^&*^)((^")
        return;
    }
    turn = Turn.Computer
    
    computerMove();
    return;
}
function sleep(ms : number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
</script>
<div class="board">
    <div class="placeholder" style="left: {$placeholderPosition}px"><Temporary /></div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="grid" bind:this={boardNode} on:mousemove={handleMousemove} on:click={(event) => { handleInput(column); }}>
        <div class="column">
            {#each grid as column, i}
                <div class="row">
                    {#each column as cell}
                        <GridCell {cell} />
                    {/each}
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    .board {
        padding: 16px;
        border-radius: 4px;
        background-color: #155bcb;
        position: relative;
    }
    .grid {
      display: flex;
      flex-direction: row;
      justify-content: center;
      position: relative;
      grid-template-columns: repeat(7, auto);
      align-items: center;
    }
    .column{
        display:flex;
        flex-direction: row;
    }

    .row{
        display:flex;
        flex-direction: column;
    }

    .placeholder {
        position: absolute;
        top: -70px;
    }
</style>