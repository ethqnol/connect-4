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

let computerWin = false;
let playerWin = false;
let draw = false;
let placeholderPosition = tweened(0, { easing: cubicOut });
let column = 0;
let turn : number = Turn.Player
let rollouts = 0;
let seconds : number = 0;
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

function checkDraw(){
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
    await new Promise<void>(async resolve => {
           await  mcts.search();
            let bestMove = mcts.best();
            playMove(bestMove);
            mcts.update(bestMove);
            rollouts = mcts.rollouts;
            seconds = mcts.time;
            // Update the turn and check for the end of the game
            turn = Turn.Player;
            if (checkEnd()) {
                console.log("Game Over!");
                if(checkDraw() == true){
                    draw == true;
                    return;
                }
                computerWin = true;
                return;
            }

            resolve();
    });

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
    turn = Turn.Computer
    await sleep(200);
    mcts.update(index);

    if(checkEnd()){

        if(checkDraw() == true){
            draw == true;
            return;
        }
        playerWin = true;
        return;
    }
    
    
    computerMove();
    return;
}
function sleep(ms : number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


</script>


{#if playerWin == false && computerWin == false && draw == false}
    <div class="board">
        {#if turn == Turn.Player}
            <div class="placeholder" style="left: {$placeholderPosition}px"><Temporary /></div>
        {/if}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="grid" bind:this={boardNode} on:mousemove={handleMousemove} on:click={(event) => { handleInput(column); }}>
            <div class="column">
                {#each grid as column}
                    <div class="row">
                        {#each column as cell}
                            <GridCell {cell} />
                        {/each}
                    </div>
                {/each}
            </div>
        </div>
    </div>

    {#if turn == Turn.Computer}
        <div class="computer-thinking"> <p class="thinking-animation"> Computer Is Thinking</p> </div>
    {:else}
        <div class="computer-thinking"> 
            <h4>Stats For Nerds (On Prev Computer Move):</h4>
            <p> Rolled out <strong>{ rollouts }</strong> simulations in <strong>{ seconds/1000 }</strong> secs</p>
        </div>
    {/if}
{:else}
    <h1> {#if computerWin} Computer Wins {:else if draw == true} Draw! {:else} Player Wins {/if}</h1>
    <h2> Final Board State: </h2>
    <div class="board">
        <div class="grid">
            <div class="column">
                {#each grid as column}
                    <div class="row">
                        {#each column as cell}
                            <GridCell {cell} />
                        {/each}
                    </div>
                {/each}
            </div>
        </div>
    </div>


{/if}
<style>
    .board {
        padding: 16px;
        border-radius: 4px;
        background-color: #155bcb;
        position: relative;
    }

    .computer-thinking {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        white-space: pre-line;
        font-size: 18px;
        font-weight: bold;
        color: #333;
        padding: 10px 20px;
        border-radius: 5px;
        background-color: #eee; 
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

    h4{
        padding: 5px;
        margin: 0;
    }

    p {
        font-size: 0.9rem;
        font-weight: 520;
        margin: 5px;
        font-family: 'Courier New', Courier, monospace;
    }
    
    .thinking-animation{
        animation: thinkingAnimation 1.5s infinite alternate;
        color: black;
        font-weight: 600;
    }
    @keyframes thinkingAnimation {
      0% {
        opacity: 0.7;
        transform: scale(1);
      }
      100% {
        opacity: 1;
        transform: scale(1.4);
      }
    }
</style>