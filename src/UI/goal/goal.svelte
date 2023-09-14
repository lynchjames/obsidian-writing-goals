<script lang="ts">
    import GoalProgress from "./components/goal-progress.svelte";
    import Nav from "../nav/components/nav.svelte";
    import  GoalSummary from "./components/goal-summary.svelte";
    import  Stats from "../stats/components/stats.svelte";
    import { onDestroy, onMount } from "svelte";
	  import { wgcolors, goalHistory, noteGoals } from "../stores/goal-store";
	  import type { NoteGoal, Notes } from "../../core/note-goal";
	  import type { GoalHistory } from "../../core/goal-history/history";
	  import type { HistoryStatsItem, HistoryStatsItems } from "../../core/goal-history/history-stats";
  	import { loadGoal } from "./goal-helper.js";
	  import type { WritingGoalColors } from "../../core/settings/colors";
    
    export let path: string;
    export let isMobile: boolean;
    export let colors: WritingGoalColors;
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
    let goalColors: WritingGoalColors;

    onMount(() => {
      goalColors = colors;
    })

    $: transform(linkedChartData[path]);

    const unsubNoteGoals = noteGoals.subscribe(val => {
        if(!val[path]){
          return;
        }
        goals = val;
        keys = Object.keys(goals).sort((a, b) => goals[a].title.localeCompare(goals[b].title));
        currentIndex = keys.indexOf(path);
        updateGoal();
    });

    const unsubHistory = goalHistory.subscribe(val => {
      if(val) {
        linkedChartData = onHistoryUpdate(val);
      }
    });

    const unsubColors = wgcolors.subscribe(val => {
      goalColors = val;
    });

    onDestroy(unsubNoteGoals);
    onDestroy(unsubHistory);
    onDestroy(unsubColors);

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
    <div class="writing-goals-container {goal.dailyGoalCount > 0 ? "wg-daily-goal" : ""}">
      <Nav 
        {isMobile}
        showArrows={keys.length > 1} goal={goal} 
        onNextClick={onNextClick} 
        onPreviousClick={onPreviousClick}
      />

      <GoalProgress
        {path}
        goal={goals[path]}
        goalData={loadGoal(goal)}
        colors={goalColors}
        {onGoalClick}
      />

      <GoalSummary 
        goal={goal} 
        goalData={loadGoal(goal)}
        colors={goalColors} 
      />

      <Stats 
        {path}
        showProgress={showProgressChart}
        color={goal.dailyGoalCount > 0 ? goalColors.dailyGoalColor : goalColors.goalColor}
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