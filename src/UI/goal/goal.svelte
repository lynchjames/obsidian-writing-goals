<script lang="ts">
    import Nav from './nav.svelte';
    import  GoalSummary from './goal-summary.svelte';
    import  Stats from '../stats/stats.svelte';
    import { onDestroy, onMount } from "svelte";
	  import { dailyGoalColor, goalColor, goalHistory, noteGoals } from '../stores/goal-store';
	  import type { NoteGoal, Notes } from '../note-goal';
	  import type { GoalHistory } from '../goal-history/history';
	  import type { HistoryStatsItem, HistoryStatsItems } from '../goal-history/history-stats';
    
    export let path: string;
    export let isMobile: boolean;
    export let color: string;
    export let dailyColor: string;
    export let linkedChartData: HistoryStatsItems;
    export let showProgressChart: boolean;
    export let onGoalClick: (path:string) => void;
    export let onHistoryUpdate: (val:GoalHistory) => any;

    let goals: Notes;
    let keys: string[];
    let goal: NoteGoal;
    let chartData: any;
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
    })

    $: transform(linkedChartData[path]);

    const unsubNoteGoals = noteGoals.subscribe(val => {
        if(!val[path]){
          return;
        }
        goals = val;
        keys = Object.keys(goals);
        currentIndex = keys.indexOf(path);
        updateGoal();
    });

    const unsubHistory = goalHistory.subscribe(val => {
      if(val) {
        linkedChartData = onHistoryUpdate(val);
      }
    });

    const unsubGoalColor = goalColor.subscribe(val => {
      gColor = val
    });

    const unsubDailyGoalColor = dailyGoalColor.subscribe(val => {
      dGColor = val
    });

    onDestroy(unsubNoteGoals);
    onDestroy(unsubHistory);
    onDestroy(unsubGoalColor);
    onDestroy(unsubDailyGoalColor);

    function transform(stats: HistoryStatsItem[]) {
      chartData = stats ? Object.fromEntries(stats.map(s => [s.date, s.value])) : {};
    }
    
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
      updateGoal(1);
    }

    function onPreviousClick() {
      updateGoal(-1);
    }

    function onClick() {
      onGoalClick(path);
    }

</script>

{#if goal && (goal.goalCount > 0 || goal.dailyGoalCount > 0)}

    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="writing-goals-container {goal.dailyGoalCount > 0 ? 'wg-daily-goal' : ''}">
      <Nav 
        {isMobile}
        showArrows={keys.length > 1} goal={goal} 
        onNextClick={onNextClick} 
        onPreviousClick={onPreviousClick}
        />
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
        <Stats 
          {path}
          showProgress={showProgressChart}
          color={goal.dailyGoalCount > 0 ? dGColor : gColor}
          chartData={chartData}
          />
    </div>
{/if}

<style>
  .writing-goals-container {
      margin: auto;
      max-width: 400px;
      cursor: pointer;
  }

  .note-goal-completed .note-goal-text {
      fill: var(--text-on-accent-inverted);
      font-weight: bold;
  }

  .note-goal-text {
      fill: var(--text-normal);
  }

  .writing-goals {
      padding: 0 40px;
  }

  .writing-goals .wg-bar {
      stroke-width: 18px;
  }

  .writing-goals .wg-daily-bar {
      stroke-width: 10px;
  }

  .wg-daily-goal .writing-goals .wg-bar{
      stroke-width: 10px;
  }

  .wg-bar, .wg-simple .wg-bar {
      transition: stroke-dashoffset 0.5s linear;
  }

  .wg-daily-bar, .wg-daily-bar {
      transition: stroke-dashoffset 0.5s linear;
  }

  .wg-background, .wg-daily-background {
      fill: var(--background-primary);
  }

  .note-goal-completed, .daily-note-goal-completed {
      fill: var(--background-modifier-success);
  }

  .workspace-split.mod-root .writing-goals .background {
      fill: var(--background-secondary-alt);
  }

</style>