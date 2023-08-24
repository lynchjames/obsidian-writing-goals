<script lang="ts">
    import { onMount } from 'svelte';
    import { onDestroy } from "svelte";
	  import { goalCount, noteTitle, wordCount } from '../stores/goal-store';

    export let mode: string;
    let title: string = ''; 
    let words: number = 0;
    let goal: number = 0;
    let progress: number = 0;
    let radius: number = 90;

    const unsubNoteTitle = noteTitle.subscribe(val => {
        title = val;
    });

    const unsubWordCount = wordCount.subscribe(val => {
        words = val;
        calculateProgress();
    });

    const unsubGoalCount = goalCount.subscribe(val => {
        goal = val;
        calculateProgress();
    });

    onDestroy(unsubWordCount);
    onDestroy(unsubGoalCount);
    
    function calculateProgress() {
      let val = (words/goal)*100;
      let c = Math.PI*(radius*2);
    
      if (val < 0) { val = 0;}
      if (val > 100) { val = 100;}
      
      progress = ((100-val)/100)*c;
    }
</script>

<style>


</style>

{#if goal > 0}
  <div id="writing-goals-container">
    {#if mode = 'full'}
    <h3 class="title">
      <span class="goal-note-title">{title}</span>
    </h3>
    <svg id="writing-goals" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <circle id="background" r="100" cx="100" cy="100"></circle>
      <circle id="bar" r="90" cx="100" cy="100" transform="rotate(-90, 100, 100)" stroke-width="0.9em" fill="transparent" stroke-dasharray="565.48" stroke-linecap="round" stroke-dashoffset="{progress}"></circle>
      <text fill="#306856" stroke="#000" stroke-width="0" x="100" y="100" id="svg_4" font-size="40" text-anchor="middle" xml:space="preserve" font-weight="bold" style="stroke: var(--text-accent)">{words.toLocaleString()}</text>
      <text fill="#306856" stroke="#000" stroke-width="0" x="100" y="140" id="svg_8" font-size="16" text-anchor="middle" xml:space="preserve" font-weight="bold">words</text>
    </svg>
    <h3>
      of <span class="note-goal">{goal.toLocaleString()}</span> word goal
    </h3>
    {:else}
      <svg id="writing-goals" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <circle id="background" r="100" cx="100" cy="100"></circle>
        <circle id="bar" r="90" cx="100" cy="100" transform="rotate(-90, 100, 100)" stroke-width="0.9em" fill="transparent" stroke-dasharray="565.48" stroke-linecap="round" stroke-dashoffset="{progress}"></circle>
      </svg>
    {/if}
  </div>
{:else}
  <span>Create Goal</span>
{/if}