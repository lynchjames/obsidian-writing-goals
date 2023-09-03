<script lang="ts">
    import { LinkedChart, LinkedLabel} from "svelte-tiny-linked-charts"
    import { goalHistory } from "../stores/goal-store";
    import { onDestroy, onMount } from "svelte";
	import type WritingGoals from "../main";
	import moment from "moment";
	import type { GoalHistoryItem } from "../goal-history/history";

    export let path: string;
    export let plugin: WritingGoals;
    export let data: any;
    export let dailyColor: string;
    let chartData:any;

    onMount(() => {
      chartData = data;
    });

    const unsubHistory = goalHistory.subscribe(val => {
      if(val != null && val[path] != null){
        const allowNegativeGoalProgress = plugin.settings.allowNegativeGoalProgress;
        const historyItems = val[path] as GoalHistoryItem[]
        console.log('tranform input from store', historyItems);
        chartData = Object.fromEntries(historyItems.map(d => {
          const diff = d.endCount - d.startCount;
          const count = allowNegativeGoalProgress || diff >= 0 ? diff : 0; 
          return [moment(new Date(d.date)).format("ddd DD MMM YYYY"), count];
        }));
        console.log('data for chart', chartData);
      }
    });

    onDestroy(unsubHistory);
    
</script>


{#if data != null}
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