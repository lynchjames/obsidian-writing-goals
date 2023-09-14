<script lang="ts">
	import { WritingGoal } from "../../../core/goal-entities";
	import Arrow from "./arrow.svelte";
    
    export let showArrows: boolean;
    export let goal: WritingGoal;
    export let isMobile: boolean;
    export let onPreviousClick: () => void;
    export let onNextClick: () => void;

</script>

<div class="nav">
    <div>
        {#if showArrows}
            <Arrow onClick={onPreviousClick} {isMobile} direction="left" /> 
        {/if}
    </div>
    <h3 class="title">
        <span class="goal-note-title">{goal.title}</span>
    </h3>
    <div>
        {#if showArrows}
            <Arrow onClick={onNextClick} {isMobile} direction="right" /> 
        {/if}
    </div>
</div>

<style>
    .nav {
      align-items: center;
      display: flex;
      justify-content: space-between;
      margin: 0.6em 0 1em;
      padding: 0 8px;
      width: 100%;
    }
  
    .nav .title {
        margin: 0 0.1em;
    }
  </style>