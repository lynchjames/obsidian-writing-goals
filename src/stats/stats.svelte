<script lang="ts">
    import { LinkedChart, LinkedLabel} from "svelte-tiny-linked-charts"
    import { goalHistory, showProgressChart } from "../stores/goal-store";
    import { onDestroy, onMount } from "svelte";
  	import type { GoalHistory } from "../goal-history/history";
	  import { HistoryStatsItem } from "../goal-history/history-stats";

    export let path: string;
    // export let data: HistoryStatsItem[];
    export let chartData:any;
    export let color: string;
    export let showProgress: boolean;
    // export let onHistoryUpdate: (val:GoalHistory) => any;
    let showChart: boolean;

    onMount(() => {
      showChart = showProgress;
    })

    const unsubShowProgressChart = showProgressChart.subscribe(val => {
        showChart = val;
    });
    
    onDestroy(unsubShowProgressChart);
    
</script>

{#if chartData && showChart}
  <div class="linked-chart-container">
    <h3>Goal progress</h3>
    <div class="linked-chart-date-label">
      <LinkedLabel linked={`${path}-link-2`} />
    </div>
      
    <LinkedChart 
      uid={path}
      data={chartData}
      linked={`${path}-link-2`}
      showValue
      fadeOpacity={0.3}
      barMinWidth={4}
      gap={1}
      align="left"
      valuePrepend=""
      valueAppend="words"  
      barMinHeight={2}
      hideBarBelow={1}
      fill="{color}"
      valuePosition="floating"
      transition={500}
    />
  </div>
{/if}

<style>
  .linked-chart-container {
    background-color: var(--background-primary);
    border-radius: 8px;
    height: 128px;
    max-width: 550px;
    margin-top: 8px;
    padding: 4px 20px 32px 20px;
    position: relative;
}

.linked-chart-container svg {
    width: 100%;
}

.linked-chart-date-label {
    margin-bottom: 8px;
    text-align: center;
}

.linked-chart-container h3, .linked-chart-container h4 {
    color: var(--color-text-title);
    font-size: 1em;
    margin: 4px 0;
    text-align: center;
}
</style>