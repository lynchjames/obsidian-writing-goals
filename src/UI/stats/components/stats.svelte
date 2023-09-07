<script lang="ts">
    import { LinkedChart, LinkedLabel} from "svelte-tiny-linked-charts"
    import { showProgressChart } from "../../stores/goal-store";
    import { onDestroy, onMount } from "svelte";

    export let path: string;
    export let chartData:any;
    export let color: string;
    export let showProgress: boolean;
    let showChart: boolean;
    let compWidth: number;
    
    $: keyCount = Object.keys(chartData).length ?? 0;

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
    <div class="linked-chart-date-label" bind:clientWidth={compWidth}>
      <LinkedLabel linked={`${path}-link-2`} />
    </div>
      
    <LinkedChart 
      uid={path}
      data={chartData}
      linked={`${path}-link-2`}
      showValue
      fadeOpacity={0.3}
      barMinWidth={keyCount > 20 ? 0 : 6}
      gap={keyCount > 50 ? 0 : 1}
      grow={keyCount > 20}
      align="left"
      valuePrepend=""
      valueAppend="words"  
      barMinHeight={2}
      hideBarBelow={1}
      fill="{color}"
      transition={500}
    />
  </div>
{/if}

<style>
  .linked-chart-container {
    background-color: var(--background-primary);
    border-radius: 8px;
    height: auto;
    max-width: 550px;
    margin-top: 8px;
    padding: 4px 20px 4px 20px;
    width: 100%;
}

.linked-chart-date-label {
    margin-bottom: 8px;
    text-align: center;
}

.linked-chart-container h3 {
    color: var(--color-text-title);
    font-size: 1em;
    margin: 4px 0;
    text-align: center;
}
</style>