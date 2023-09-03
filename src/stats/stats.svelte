<script lang="ts">
    import { LinkedChart, LinkedLabel} from "svelte-tiny-linked-charts"
    import { goalHistory, showProgressChart } from "../stores/goal-store";
    import { onDestroy, onMount } from "svelte";
    import type WritingGoals from "../main";
    import moment from "moment";
    import type { GoalHistoryItem } from "../goal-history/history";

    export let path: string;
    export let plugin: WritingGoals;
    export let data: any;
    export let dailyColor: string;
    export let showProgress: boolean;
    let chartData:any;
    let showChart: boolean;

    onMount(() => {
      chartData = data;
      showChart = showProgress;
    });

    const unsubNShowProgressChart = showProgressChart.subscribe(val => {
        showChart = val;
    });

    const unsubHistory = goalHistory.subscribe(val => {
      if(val != null && val[path] != null){
        const allowNegativeGoalProgress = plugin.settings.allowNegativeGoalProgress;
        const historyItems = val[path] as GoalHistoryItem[]
        chartData = Object.fromEntries(historyItems.map(d => {
          const diff = d.endCount - d.startCount;
          const count = allowNegativeGoalProgress || diff >= 0 ? diff : 0; 
          return [moment(new Date(d.date)).format("ddd DD MMM YYYY"), count];
        }));
      }
    });

    onDestroy(unsubHistory);
    
</script>


{#if data != null && showChart}
<div class="linked-chart-container">
  <h3>Daily goal progress</h3>
  <div class="linked-chart-date-label">
    <LinkedLabel linked={`${path}-link-2`} />
  </div>
    
  <LinkedChart 
  uid={path}
  data={chartData}
  linked={`${path}-link-2`}
  showValue
  fadeOpacity={0.25}
  barMinWidth={4}
  valuePrepend=""
  valueAppend="words"  
  fill="{dailyColor}"
  valuePosition="floating"
  align="left"
  transition={500}
  />
</div>
{/if}