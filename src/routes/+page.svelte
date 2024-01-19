<script lang="ts">
    import Board from "../components/Board.svelte";
    import type { Cell } from "../interfaces/cell";
    import { Type } from "../interfaces/type";
    let defaultCell : Cell = { cellType: Type.None };
    let grid = Array.from({length: 7}, e => Array(6).fill(defaultCell));
   
</script>



<main>
    <div class="game">
        <div class="board">
            <Board {grid} />
        </div>
    </div>
</main>

<style>
    main {
      margin: 0.5rem;
    }
    
    .board {
      display: flex;
      flex-direction: column;
      padding: 0.75rem;
      border-radius: 5px;
      margin-top: 5rem;
    }

    .game {
      display: flex;
      justify-content: center;
      gap: 2rem
    }
</style>