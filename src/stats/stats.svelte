<script lang="ts">
    import { LinkedChart, LinkedLabel, LinkedValue} from "svelte-tiny-linked-charts"
	  import type { HistoryStatsItem } from "../goal-history/history";

    export let path: string;
    export let data: any;
    export let dailyColor: string;
    
</script>


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