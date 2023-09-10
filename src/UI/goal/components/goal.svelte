<script lang="ts">
    import GoalProgress from './goal-progress.svelte';
    import Nav from './nav.svelte';
    import  GoalSummary from './goal-summary.svelte';
    import  Stats from '../../stats/components/stats.svelte';
    import { onDestroy, onMount } from "svelte";
	  import { dailyGoalColor, goalColor, goalHistory, noteGoals } from '../../stores/goal-store';
	  import type { NoteGoal, Notes } from '../../../core/note-goal';
	  import type { GoalHistory } from '../../../core/goal-history/history';
	  import type { HistoryStatsItem, HistoryStatsItems } from '../../../core/goal-history/history-stats';
    
    export let path: string;
    export let isMobile: boolean;
    export let color: string;
    export let dailyColor: string;
    export let linkedChartData: HistoryStatsItems;
    export let showProgressChart: boolean;
    export let onGoalClick: (path:string) => void;
    export let onNavClick: (path:string) => void;
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

    function getDailyDifference(goal){
      return goal.wordCount - goal.startCount;
    }


    function onNextClick() {
      updateGoal(1);
      onNavClick(path)
    }

    function onPreviousClick() {
      updateGoal(-1);
      onNavClick(path)
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
      
      <GoalProgress
        {path}
        goal={goals[path]}
        {color}
        {dailyColor}
        {onGoalClick}
      />
      
      <GoalSummary 
        goal={goal} 
        percent={percent} 
        dailyPercent={dailyPercent} 
        color={gColor} 
        dailyColor={dGColor} 
      />

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

</style>