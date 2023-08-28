<script lang="ts">
    import { onDestroy } from "svelte";
	  import { noteGoals, showGoalMessage } from '../stores/goal-store';
	  import type { NoteGoal, Notes } from '../stores/note-goal';

    export let mode: string;
    export let path: string;

    let goals: Notes;
    let goal: NoteGoal;
    let percent: number = 0;
    let progress: number = 0;
    let radius: number = 90;
    let showMessage: boolean = true;

    const unsubNoteGoals = noteGoals.subscribe(val => {
        if(!val[path]){
          return;
        }
        goals = val;
        updateGoal();
        calculateProgress();
    });

    const unsubNShowGoalMessage = showGoalMessage.subscribe(val => {
        showMessage = val;
    });

    onDestroy(unsubNoteGoals);
    onDestroy(unsubNShowGoalMessage);
    
    function updateGoal() {
      goal = goals[path];      
    }

    function calculateProgress() {
      percent = (goal.wordCount/goal.goalCount)*100;
      let c = Math.PI*(radius*2);
    
      if (percent < 0) { percent = 0;}
      if (percent > 100) { percent = 100;}
      
      progress = ((100-percent)/100)*c;
    }

    function getLineCap(per:number) {
      return  per < 95 ? 'round' : 'butt';
    }

    function getCompletedClass(per:number){
      return per == 100 ? 'note-goal-completed' : '';
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
        <svg class="writing-goals {getCompletedClass(percent)}" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <circle id="background" class="{getCompletedClass(percent)}" r="100" cx="100" cy="100"></circle>
          <circle id="bar" r="90" cx="100" cy="100" transform="rotate(-90, 100, 100)" stroke-width="1.2em" fill="transparent" stroke-dasharray="565.48" stroke-linecap="{getLineCap(percent)}" 
            stroke-dashoffset="{progress}"></circle>
          <text class="note-goal-text" stroke-width="0" x="100" y="100" id="svg_4" font-size="40" text-anchor="middle" xml:space="preserve" font-weight="bold">{goal.wordCount.toLocaleString()}</text>
          <text class="note-goal-text" stroke-width="0" x="100" y="140" id="svg_8" font-size="16" text-anchor="middle" xml:space="preserve">words</text>
        </svg>
        {#if showMessage}
        <h3>
          {#if percent == 100}
           <span class="note-goal">{goal.goalCount.toLocaleString()}</span> <span class="note-goal-completed">word goal completed!</span>
          {:else}
            <span class="note-goal">{goal.goalCount.toLocaleString()}</span> word goal
          {/if}
        </h3>
        {/if}
      </div>
    {/if}
    {#if mode == 'simple'}
      <div class="writing-goals-simple-container">
        <svg class="writing-goals-simple" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <circle id="background" class="{getCompletedClass(percent)}" r="100" cx="100" cy="100"></circle>
          <circle id="bar" r="90" cx="100" cy="100" transform="rotate(-90, 100, 100)" stroke-width="1.8em" fill="transparent" 
           stroke-dasharray="565.48" stroke-linecap="{getLineCap(percent)}" stroke-dashoffset="{progress}"></circle>
        </svg>
        </div>
    {/if}
{/if}