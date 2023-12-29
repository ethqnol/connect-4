<script lang=ts>
import type { Cell } from "../interfaces/cell";
import { Type } from "../interfaces/type";
import { tweened } from "svelte/motion";
import { cubicOut } from "svelte/easing";
import GridCell from "./Cell.svelte";
import Temporary from "./Temporary.svelte";

const BOARDHEIGHT = 6
const BOARDWIDTH = 7

export let grid : Cell[][]
let boardNode : HTMLElement;

enum Turn {
    Player,
    Computer
}

let placeholderPosition = tweened(0, { easing: cubicOut });
let column = 0;
let turn = Turn.Player

function checkWin(){
    for(let c = 0; c < BOARDWIDTH; c++){
        for(let r = 0; r < BOARDHEIGHT; r++){
            if(grid[c][r].cellType != Type.None){
                if(grid[c][r + 3] != null){
                    if(grid[c][r].cellType == grid[c][r + 1].cellType && grid[c][r].cellType == grid[c][r + 2].cellType && grid[c][r].cellType ==  grid[c][r + 3].cellType){
                        return true;
                    }
                }
                if(grid[c + 3][r] != null){
                    if(grid[c][r].cellType == grid[c + 1][r].cellType && grid[c][r].cellType == grid[c + 2][r].cellType && grid[c][r].cellType ==  grid[c + 3][r].cellType){
                        return true;
                    }
                }

                if(grid[c + 3][r + 3] != null){
                    if(grid[c][r].cellType == grid[c + 1][r + 1].cellType && grid[c][r].cellType == grid[c + 2][r + 2].cellType && grid[c][r].cellType ==  grid[c + 3][r + 3].cellType){
                        return true;
                    }
                }
                if(c > 3 && grid[c - 3][r + 3] != null){
                    if(grid[c][r].cellType == grid[c - 1][r + 1].cellType && grid[c][r].cellType == grid[c - 2][r + 2].cellType && grid[c][r].cellType ==  grid[c - 3][r + 3].cellType){
                        return true;
                    }
                }
            }

            
        }
    }
    return false;
}

function handleMousemove(event : MouseEvent) {
    const nodeBoundX = boardNode.getBoundingClientRect().x;
    const change = event.clientX - nodeBoundX - 4;
    column = Math.min(Math.max(Math.floor(change / (60)), 0), 6);
    placeholderPosition.set(column * (60) + 16);
}

function playMove(index: number){
    for(let depth = 0; depth < BOARDHEIGHT; depth++){
        console.log(grid[depth][index])
        if(grid[index][depth].cellType != Type.None ){
            grid[index][depth - 1] = { cellType: Type.Red};
            grid = grid;
            return;
        }
    }
    grid[index][5] = { cellType: Type.Red};

    
}

function handleInput(index : number){
    if(turn != Turn.Player){
        return;
    }
    if(grid[index][0].cellType != Type.None) {
        return;
    }

    playMove(index)
    if(checkWin()){
        console.log("DSJKL:FSDHJKLF")
        return;
    }
    // turn = Turn.Computer
    return;
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