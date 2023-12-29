<script lang="ts">
    import type { Cell } from "../interfaces/cell";
    import { Type } from "../interfaces/type";


</script>

<div class="cell">
    <div class="red-cell"> </div>
</div>


<style>
.cell {
    width: 60px;
    height: 60px;
    background-color: transparent;
    border-radius: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
}


.red-cell {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background-color: rgb(202, 15, 15);
    border: 2px solid rgba(0, 0, 0, 0.1);
    
}
</style>