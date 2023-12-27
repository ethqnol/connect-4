<script lang="ts">
    import GridCell from "../components/Cell.svelte";
    import type { Cell } from "../interfaces/cell";
    import { Type } from "../interfaces/type";
    let someCell : Cell = { cellType: Type.None };
</script>


<main>
    <GridCell cell={ someCell } />
</main>