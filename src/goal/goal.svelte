<script lang="ts">
    import { onDestroy } from "svelte";
	  import { noteGoals, showGoalMessage } from '../stores/goal-store';
	  import type { NoteGoal, Notes } from '../note-goal';
    export let mode: string;
    export let path: string;

    let goals: Notes;
    let goal: NoteGoal;
    let percent: number = 0;
    let dailyPercent: number = 0;
    let progress: number = 0;
    let dailyProgress: number = 0;
    let simpleDailyProgress: number = 0;
    let radius: number = 90;
    let showMessage: boolean = true;

    const unsubNoteGoals = noteGoals.subscribe(val => {
        if(!val[path]){
          return;
        }
        goals = val;
        updateGoal();
        percent = getPercent(goal.wordCount, goal.goalCount);
        dailyPercent = getPercent(getDailyDifference(goal), goal.dailyGoalCount);
        progress = calculateProgress(90, percent);
        dailyProgress = calculateProgress(75, dailyPercent);
        simpleDailyProgress = calculateProgress(50, dailyPercent);

    });

    const unsubNShowGoalMessage = showGoalMessage.subscribe(val => {
        showMessage = val;
    });

    onDestroy(unsubNoteGoals);
    onDestroy(unsubNShowGoalMessage);
    
    function updateGoal() {
      goal = goals[path];      
    }

    function calculateProgress(rad, per) {
      let c = Math.PI*(rad*2);
    
      if (per < 0) { per = 0;}
      if (per > 100) { per = 100;}
      
      return ((100-per)/100)*c;
    }

    function getPercent(words, goal) {
      let per = (words/goal)*100;
      if (per < 0) { per = 0;}
      if (per > 100) { per = 100;}
      return per;
    }

    function getLineCap(per:number) {
      return  per < 95 ? 'round' : 'butt';
    }

    function getDailyDifference(goal){
      return goal.wordCount - goal.startCount;
    }

    function getCompletedClass(){
      return percent == 100 || dailyPercent == 100 ? 'note-goal-completed' : '';
    }

    function getWordCount(goal:NoteGoal) {
      const count = goal.dailyGoalCount > 0 ? goal.wordCount - goal.startCount : goal.wordCount;
      return count.toLocaleString();
    }

    function getWordsText(goal:NoteGoal) {
      return goal.dailyGoalCount > 0 ? 'words today' : 'words'; 
    }

    function getOverallGoalCountText(goal:NoteGoal) {
      return goal.dailyGoalCount > 0 ? goal.wordCount.toLocaleString() + ' of' : '';
    }
</script>

<style>


</style>

{#if goal && goal.goalCount > 0}
    {#if mode == 'full'}
      <div class="writing-goals-container {goal.dailyGoalCount > 0 ? 'daily-goal' : ''}">
        <h3 class="title">
          <span class="goal-note-title">{goal.title}</span>
        </h3>
        <svg class="writing-goals {getCompletedClass(goal)}" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <circle id="background" class="{getCompletedClass(goal)}" r="100" cx="100" cy="100"></circle>
          <circle id="bar" r="90" cx="100" cy="100" transform="rotate(-90, 100, 100)" stroke-width="1.2em" fill="transparent" stroke-dasharray="565.48" stroke-linecap="{getLineCap(percent)}" 
            stroke-dashoffset="{progress}"></circle>
            {#if goal.dailyGoalCount > 0}
              <circle id="daily-bar" r="75" cx="100" cy="100" transform="rotate(-90, 100, 100)" stroke-width=".75em" fill="transparent" stroke-dasharray="471.23" stroke-linecap="{getLineCap(dailyPercent)}" 
                stroke-dashoffset="{dailyProgress}"></circle>
            {/if}
          <text class="note-goal-text" stroke-width="0" x="100" y="100" id="svg_4" font-size="40" text-anchor="middle" xml:space="preserve" font-weight="bold">{getWordCount(goal)}</text>
          <text class="note-goal-text" stroke-width="0" x="100" y="140" id="svg_8" font-size="16" text-anchor="middle" xml:space="preserve">{getWordsText(goal)}</text>
        </svg>
        {#if showMessage}
          {#if goal.dailyGoalCount > 0}
            <h3>
              {#if dailyPercent >= 100}
              {goal.dailyGoalCount.toLocaleString()} <span class="note-daily-goal note-goal-completed">daily word goal</span> completed!
              {:else}
                {goal.dailyGoalCount.toLocaleString()} <span class="note-daily-goal">daily word goal</span>
              {/if}
            </h3>
          {/if}
          <h3>
            {#if percent >= 100}
              {goal.goalCount.toLocaleString()} <span class="note-goal note-goal-completed">word goal completed!</span>
            {:else}
              {getOverallGoalCountText(goal)} {goal.goalCount.toLocaleString()}&nbsp;<span class="note-goal">word goal</span> 
            {/if}
          </h3>
        {/if}
      </div>
    {/if}
    {#if mode == 'simple'}
      <div class="writing-goals-simple-container" data-path="{path}">
        <svg class="writing-goals-simple" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <circle id="background" class="{getCompletedClass()}" r="100" cx="100" cy="100"></circle>
          <circle id="bar" r="90" cx="100" cy="100" transform="rotate(-90, 100, 100)" stroke-width="1.4em" fill="transparent" 
           stroke-dasharray="565.48" stroke-linecap="{getLineCap(percent)}" stroke-dashoffset="{progress}"></circle>
           {#if goal.dailyGoalCount > 0}
              <circle id="daily-bar" r="50" cx="100" cy="100" transform="rotate(-90, 100, 100)" stroke-width="1.4em" fill="transparent" stroke-dasharray="314.15" stroke-linecap="{getLineCap(dailyPercent)}" 
                stroke-dashoffset="{simpleDailyProgress}"></circle>
            {/if}
        </svg>
        </div>
    {/if}
{/if}

<!-- <svg class="writing-goals " viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <circle id="background" class="" r="100" cx="100" cy="100"></circle>
  <circle id="bar" r="90" cx="100" cy="100" transform="rotate(-90, 100, 100)" stroke-width=".8em" fill="transparent" stroke-dasharray="565.48" stroke-linecap="round" 
  stroke-dashoffset="507.8070365262542"></circle>
  <circle id="daily-bar" r="75" cx="100" cy="100" transform="rotate(-90, 100, 100)" stroke-width=".75em" fill="transparent" 
  stroke-dasharray="565.48" stroke-linecap="round" stroke-dashoffset="200" stroke="orange"></circle>
  <text class="note-goal-text" stroke-width="0" x="100" y="100" id="svg_4" font-size="40" text-anchor="middle" xml:space="preserve" font-weight="bold">1,000</text>
  <text class="note-goal-text" stroke-width="0" x="100" y="140" id="svg_8" font-size="16" text-anchor="middle" xml:space="preserve">words today</text>
</svg> -->