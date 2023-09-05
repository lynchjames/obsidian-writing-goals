<script lang="ts">
    import { LinkedChart, LinkedLabel} from "svelte-tiny-linked-charts"
    import { goalHistory, showProgressChart } from "../stores/goal-store";
    import { onDestroy, onMount } from "svelte";
  	import type { GoalHistory } from "../goal-history/history";
	  import { HistoryStatsItem } from "../goal-history/history-stats";

    export let path: string;
    export let data: HistoryStatsItem[];
    export let color: string;
    export let showProgress: boolean;
    export let onHistoryUpdate: (val:GoalHistory) => any;
    let chartData:any;
    let showChart: boolean;

    onMount(() => {
      showChart = showProgress;
    })

    $: transform(data);

    const unsubShowProgressChart = showProgressChart.subscribe(val => {
        showChart = val;
    });
    
    const unsubHistory = goalHistory.subscribe(val => {
      if(val) {
        const updatedData = onHistoryUpdate(val);
        transform(updatedData[path]);
      }
    });
    
    onDestroy(unsubShowProgressChart);
    onDestroy(unsubHistory);

    function transform(stats: HistoryStatsItem[]) {
      chartData = stats ? Object.fromEntries(stats.map(s => [s.date, s.value])) : {};
    }
    
</script>

{#if data && showChart}
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
      fadeOpacity={0.4}
      barMinWidth={5}
      valuePrepend=""
      valueAppend="words"  
      fill="{color}"
      valuePosition="floating"
      align="left"
      transition={500}
    />
  </div>
{/if}