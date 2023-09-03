<script lang="ts">
    import { onMount } from "svelte";
    import SvelteHeatmap from "svelte-heatmap";
    import { LinkedChart, LinkedLabel, LinkedValue} from "svelte-tiny-linked-charts"
	  import type { HistoryStatsItem } from "../goal-history/history";
    import { onDestroy } from 'svelte';
    import { dailyGoalColor } from '../stores/goal-store';

    // export let colors = ["#a1dab4", "#42b6c4", "#2c7fb9", "#263494"];
    // export let textColor = "#dadada";
    // export let emptyColor = "#362627";
    // export let type = "monthly";
    // export let cellRadius = 2;
    export let path: string;
    export let heatMapData: HistoryStatsItem[];
    export let data: any;
    export let dailyColor: string;

    let dGColor: string;
    
    // onMount(() => {
    //   dGColor = dailyColor;
    // })

    // const unsubDailyGoalColor = dailyGoalColor.subscribe(val => {
    //   dGColor = val
    // });

    // onDestroy(unsubDailyGoalColor);

    let heatmap:SvelteHeatmap
    // let startDate = heatmapData[0].date;
    // let endDate = heatmapData[heatmapData.length - 1].date;
    let monthlabel = [
    "",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
    
</script>

<!-- <div style="max-width: 500px">
  <SvelteHeatmap
    data={heatmapData}
    view={type}
    {startDate}
    {endDate}
    monthLabels={monthlabel}
    allowOverflow="true"
    fontColor={textColor}
    {emptyColor}
    {cellRadius}
  />
</div> -->


<div class="linked-chart-container">
  <h3>Daily goal progress</h3>
  <div class="linked-chart-date-label">
    <LinkedLabel linked="link-2"  />
  </div>

  <LinkedChart 
    { data } 
    linked="link-2"
    showValue
    valuePrepend=""
    valueAppend="words"  
    fill="{dailyColor}"
    height={60}
    valuePosition="floating"
    align="left"
    />
</div>