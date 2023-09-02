<script lang="ts">
    import SvelteHeatmap from 'svelte-heatmap';
    import { LinkedChart, LinkedLabel, LinkedValue} from "svelte-tiny-linked-charts"
	  import type { HistoryStatsItem } from "../goal-history/history";

    // export let colors = ["#a1dab4", "#42b6c4", "#2c7fb9", "#263494"];
    export let textColor = "#dadada";
    export let emptyColor = "#362627";
    export let type = "monthly";
    export let cellRadius = 2;
    export let heatmapData: HistoryStatsItem[];
    export let data: any;
    
    let heatmap:SvelteHeatmap
    let startDate = heatmapData[0].date;
    let endDate = heatmapData[heatmapData.length - 1].date;
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

<div style="max-width: 500px">
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
</div>

<LinkedLabel linked="link-2" />

<LinkedChart 
  { data } 
  linked="link-2"
  showValue
  valueDefault="Empty label"
  valuePrepend=""
  valueAppend="words"  />