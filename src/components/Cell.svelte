<script lang="ts">
    import type { Cell } from "../interfaces/cell";
    import { Type } from "../interfaces/type";

    export let cell: Cell;

</script>

<div class="cell">
    {#if cell.cellType == Type.None}
        <div class="blank-cell"> </div>

    {:else if cell.cellType == Type.Yellow}
        <div class="yellow-cell"> </div>
    
    {:else if cell.cellType == Type.Red}
        <div class="red-cell"> </div>
    {/if}
</div>


<style>
.cell {
    width: 60px;
    height: 60px;
    background-color: #155bcb;
    border-radius: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.yellow-cell {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background-color: yellow;
    border: 2px solid rgba(0, 0, 0, 0.1);
    
  }

.blank-cell {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background-color: rgb(244, 244, 244);
    border: 2px solid rgba(0, 0, 0, 0.1);  
}

.red-cell {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background-color: rgb(202, 15, 15);
    border: 2px solid rgba(0, 0, 0, 0.1);
    
}
</style>