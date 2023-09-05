<script lang="ts">
    import Nav from './nav.svelte';
    import  GoalSummary from './goal-summary.svelte';
    import  Stats from '../stats/stats.svelte';
    import { onDestroy, onMount } from "svelte";
	  import { dailyGoalColor, goalColor, noteGoals } from '../stores/goal-store';
	  import type { NoteGoal, Notes } from '../note-goal';
	  import type { GoalHistory } from '../goal-history/history';
	import type { HistoryStatsItem, HistoryStatsItems } from '../goal-history/history-stats';
    
    export let mode: string;
    export let path: string;
    export let color: string;
    export let dailyColor: string;
    export let linkedChartData: HistoryStatsItems;
    export let showProgressChart: boolean;
    export let onGoalClick: (path:string) => void;
    export let onHistoryUpdate: (val:GoalHistory) => any;

    let goals: Notes;
    let keys: string[];
    let goal: NoteGoal;
    let chartData: HistoryStatsItem[];
    let currentIndex: number;
    let percent: number = 0;
    let dailyPercent: number = 0;
    let progress: number = 0;
    let dailyProgress: number = 0;
    let simpleDailyProgress: number = 0;
    let gColor: string;
    let dGColor: string;

    onMount(() => {
      gColor = color;
      dGColor = dailyColor;
      chartData = linkedChartData[path];
    })

    const unsubNoteGoals = noteGoals.subscribe(val => {
        if(!val[path]){
          return;
        }
        goals = val;
        keys = Object.keys(goals);
        currentIndex = keys.indexOf(path);
        updateGoal();
    });

    const unsubGoalColor = goalColor.subscribe(val => {
      gColor = val
    });

    const unsubDailyGoalColor = dailyGoalColor.subscribe(val => {
      dGColor = val
    });

    onDestroy(unsubNoteGoals);
    onDestroy(unsubGoalColor);
    onDestroy(unsubDailyGoalColor);
    
    function updateGoal(cursor?:number) {
      if(cursor){
        currentIndex += cursor;
        if(currentIndex < 0){
          currentIndex = keys.length - 1;
        }
        if(currentIndex > keys.length - 1) {
          currentIndex = 0;
        }
      }
      path = keys[currentIndex];
      goal = goals[path];     
      chartData = linkedChartData ? linkedChartData[path] : []; 
      loadGoal();
    }

    function loadGoal() {
      percent = getPercent(goal.wordCount, goal.goalCount);
      dailyPercent = getPercent(getDailyDifference(goal), goal.dailyGoalCount);
      progress = calculateProgress(90, percent);
      dailyProgress = calculateProgress(75, dailyPercent);
      simpleDailyProgress = calculateProgress(50, dailyPercent);
    }

    function calculateProgress(rad, per) {
      let c = Math.PI*(rad*2);
    
      if (per < 0) { per = 0;}
      if (per > 100) { per = 100;}
      
      return ((100-per)/100)*c;
    }

    function getPercent(words, goal) {
      if(goal == 0) { return 0; }
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

    function getCompletedClass(percent) {
      return percent == 100 ? 'note-goal-completed' : '';
    }

    function getDailyCompletedClass(dailyPercent) {
      return dailyPercent == 100 ? 'daily-note-goal-completed' : '';
    }

    function getWordCount(goal:NoteGoal) {
      const count = goal.dailyGoalCount > 0 ? 
        goal.wordCount - goal.startCount : goal.wordCount;
      return count.toLocaleString();
    }

    function getWordsText(goal:NoteGoal) {
      return goal.dailyGoalCount > 0 ? 'words today' : 'words'; 
    }

    function onNextClick() {
      updateGoal(1)
    }

    function onPreviousClick() {
      updateGoal(-1)
    }

    function onClick() {
      onGoalClick(path);
    }

</script>

<style>

</style>

{#if goal && (goal.goalCount > 0 || goal.dailyGoalCount > 0)}
    {#if mode == 'full'}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div class="writing-goals-container {goal.dailyGoalCount > 0 ? 'wg-daily-goal' : ''}">
        <Nav showArrows={keys.length > 1} goal={goal} onNextClick={onNextClick} onPreviousClick={onPreviousClick} />
        <svg on:click={onClick} class="writing-goals {getCompletedClass(percent)}" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <circle class="wg-background {getCompletedClass(percent)}" r="100" cx="100" cy="100"></circle>
          <circle class="wg-bar" r="90" cx="100" cy="100" transform="rotate(-90, 100, 100)" fill="transparent" stroke="{gColor}" stroke-dasharray="565.48" stroke-linecap="{getLineCap(percent)}" 
            stroke-dashoffset="{progress}"></circle>
            {#if goal.dailyGoalCount > 0}
            <circle class="wg-daily-background {getDailyCompletedClass(dailyPercent)}" r="75" cx="100" cy="100"></circle>
              <circle class="wg-daily-bar" r="75" cx="100" cy="100" transform="rotate(-90, 100, 100)" fill="transparent" stroke-dasharray="471.23" stroke-linecap="{getLineCap(dailyPercent)}" 
                stroke="{dGColor}" stroke-dashoffset="{dailyProgress}"></circle>
            {/if}
          <text class="note-goal-text" stroke-width="0" x="100" y="100" id="svg_4" font-size="40" text-anchor="middle" xml:space="preserve" font-weight="bold">{getWordCount(goal)}</text>
          <text class="note-goal-text" stroke-width="0" x="100" y="140" id="svg_8" font-size="16" text-anchor="middle" xml:space="preserve">{getWordsText(goal)}</text>
        </svg>
        <GoalSummary goal={goal} percent={percent} dailyPercent={dailyPercent} color={gColor} dailyColor={dGColor} />
        {#if goal.dailyGoalCount > 0}
          <Stats 
            {path}
            showProgress={showProgressChart}
            dailyColor={dGColor}
            data={chartData}
            onHistoryUpdate={onHistoryUpdate}
             />
        {/if}
      </div>
    {/if}
    {#if mode == 'simple'}
      <div class="writing-goals-simple-container" data-path="{path}">
        <svg class="writing-goals-simple" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <circle class="wg-background {getCompletedClass(percent)}" r="100" cx="100" cy="100"></circle>
          <circle class="wg-bar" r="90" cx="100" cy="100" transform="rotate(-90, 100, 100)" fill="transparent" 
          stroke="{gColor}" stroke-dasharray="565.48" stroke-linecap="{getLineCap(percent)}" stroke-dashoffset="{progress}"></circle>
           {#if goal.dailyGoalCount > 0}
              <circle r="50" class="wg-daily-background {getDailyCompletedClass(dailyPercent)}"  cx="100" cy="100"></circle>
              <circle class="wg-daily-bar" r="50" cx="100" cy="100" transform="rotate(-90, 100, 100)" fill="transparent" stroke-dasharray="314.15" stroke-linecap="{getLineCap(dailyPercent)}" 
                stroke="{dGColor}" stroke-dashoffset="{simpleDailyProgress}"></circle>
            {/if}
        </svg>
        </div>
    {/if}
{/if}