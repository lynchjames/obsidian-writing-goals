<script lang="ts">
    import { onMount } from 'svelte';
    import { onDestroy } from "svelte";
	  import { noteGoals } from '../stores/goal-store';
	import type { NoteGoal, Notes } from '../stores/note-goal';

    export let mode: string;
    export let path: string;

    let goals: Notes;
    let goal: NoteGoal;
    let progress: number = 0;
    let radius: number = 90;

    const unsubNoteGoals = noteGoals.subscribe(val => {
        if(!val[path]){
          return;
        }
        goals = val;
        updateGoal();
        calculateProgress();
    });

    onDestroy(unsubNoteGoals);
    
    function updateGoal() {
      goal = goals[path];      
    }

    function calculateProgress() {
      let val = (goal.wordCount/goal.goalCount)*100;
      let c = Math.PI*(radius*2);
    
      if (val < 0) { val = 0;}
      if (val > 100) { val = 100;}
      
      progress = ((100-val)/100)*c;
    }
</script>

<style>


</style>

{#if goal && goal.goalCount > 0}
    {#if mode == 'full'}
      <div class="writing-goals-container">
        <h3 class="title">
          <span class="goal-note-title">{goal.title}</span>
        </h3>
        <svg class="writing-goals" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <circle id="background" r="100" cx="100" cy="100"></circle>
          <circle id="bar" r="90" cx="100" cy="100" transform="rotate(-90, 100, 100)" stroke-width="0.9em" fill="transparent" stroke-dasharray="565.48" stroke-linecap="round" stroke-dashoffset="{progress}"></circle>
          <text fill="#306856" stroke="#000" stroke-width="0" x="100" y="100" id="svg_4" font-size="40" text-anchor="middle" xml:space="preserve" font-weight="bold" style="stroke: var(--text-accent)">{goal.wordCount.toLocaleString()}</text>
          <text fill="#306856" stroke="#000" stroke-width="0" x="100" y="140" id="svg_8" font-size="16" text-anchor="middle" xml:space="preserve" font-weight="bold">words</text>
        </svg>
        <h3>
          of <span class="note-goal">{goal.goalCount.toLocaleString()}</span> word goal
        </h3>
      </div>
    {/if}
    {#if mode == 'simple'}
      <div class="writing-goals-simple-container">
        <svg class="writing-goals-simple" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <circle id="background" r="100" cx="100" cy="100"></circle>
          <circle id="bar" r="90" cx="100" cy="100" transform="rotate(-90, 100, 100)" stroke-width="2.2em" fill="transparent" stroke-dasharray="565.48" stroke-linecap="round" stroke-dashoffset="{progress}"></circle>
        </svg>
        </div>
    {/if}
{/if}