<script lang="ts">
    import GoalProgress from "../goal/components/goal-progress.svelte";
    import GoalSummary from "../goal/components/goal-summary.svelte";
    import { LinkedChart, LinkedLabel} from "svelte-tiny-linked-charts"
    import { dailyGoalColor, goalColor, goalHistory, noteGoals } from "../stores/goal-store";
    import { onDestroy, onMount } from "svelte";
	  import type { Notes } from '../../core/note-goal';
	  import type { GoalHistory } from "../../core/goal-history/history";
	  import type { HistoryStatsItem, HistoryStatsItems } from "../../core/goal-history/history-stats";
	  import { loadGoal } from "../goal/goal-helper.js";

    export let chartData:HistoryStatsItems;
    export let color: string;
    export let dailyColor: string;
    export let onHistoryUpdate: (val:GoalHistory) => HistoryStatsItems
    export let onGoalClick: (path:string) => void;
    export let onTitleClick: (path:string) => void;

    let goals: Notes;
    let keys: string[];
    let gColor: string;
    let dGColor: string;
    

    onMount(() => {
      gColor = color;
      dGColor = dailyColor;
    })

    const unsubNoteGoals = noteGoals.subscribe(val => {
        goals = val;
        keys = Object.keys(goals).sort((a, b) => a.localeCompare(b));
    });

    const unsubHistory = goalHistory.subscribe(val => {
      if(val) {
        chartData = onHistoryUpdate(val);
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
      return stats ? Object.fromEntries(stats.map(s => [s.date, s.value])) : {};
    }
    
</script>

<div class="stats-detail-container">
  {#each keys as key}
     
  <div class="stats-detail-item">
    <div class="stats-detail-title">
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <h3 on:click={onTitleClick(key)}>{goals[key].title}</h3>

      <div class="linked-chart-date-label">
        <LinkedLabel linked="link-stats-details-1" />
      </div>
    </div>
    
    <div class="stats-detail">
      
      <div class="stats-detail-goal">
          <GoalProgress 
            path={key} 
            goal={goals[key]}
            color={color}
            dailyColor={dailyColor}  
            {onGoalClick}
            goalData={loadGoal(goals[key])}
          />

      </div>
    
  
      <div class="linked-chart-stats-detail">
          
        <LinkedChart 
          data={transform(chartData[key])}
          linked="link-stats-details-1"
          showValue
          fadeOpacity={0.3}
          barMinWidth={2}
          gap={1}
          grow={false}
          align="left"
          valuePrepend=""
          valueAppend="words"  
          valuePosition="top"
          barMinHeight={2}
          hideBarBelow={1}
          fill="{goals[key].dailyGoalCount > 0 ? dGColor : gColor}"
          transition={500}
        />
      </div>
    </div>

    <GoalSummary 
      goal={goals[key]} 
      goalData={loadGoal(goals[key])}
      color={gColor} 
      dailyColor={dGColor} 
    />

  </div>
  {/each}
</div>
<style>
  .stats-detail-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .stats-detail-item {
    display: flex;
    flex-direction: column;
    background-color: var(--background-secondary);
    border-radius: 8px;
    max-width: var(--file-line-width);
    margin: 8px auto;
    padding: 8px 32px;
    width: 100%;
  }

  .stats-detail-title {
    display: flex;
    flex-direction: row;
    margin-bottom: 8px;
  }

  .stats-detail-item .stats-detail {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;    
  }

  .stats-detail-goal {
    cursor: pointer;
    flex: 1;
    max-width: 130px;
  }

  .linked-chart-stats-detail {
    flex: 1;
    margin: 8px 8px 0 32px;
    min-width: 180px;
  }

  .stats-detail-item h3 {
      color: var(--color-text-title);
      cursor: pointer;
      margin: 8px 0;
  }

  .linked-chart-date-label {
      margin: auto;
  }
</style>