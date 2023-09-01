<script lang="ts">
    import { onDestroy } from "svelte";
    import { showGoalMessage } from '../stores/goal-store';
    import type { NoteGoal } from '../note-goal';

    export let goal: NoteGoal;
    export let percent: number;
    export let dailyPercent: number;
    export let gColor: string;
    export let dGColor: string;

    let showMessage: boolean = true;

    function getOverallGoalCountText(goal:NoteGoal) {
      return goal.dailyGoalCount > 0 ? goal.wordCount.toLocaleString() + ' of' : '';
    }

    const unsubNShowGoalMessage = showGoalMessage.subscribe(val => {
        showMessage = val;
    });

    onDestroy(unsubNShowGoalMessage);

    function getColorStyle(color:string) {
        return `color: ${color}`;
    }

</script>

<style>

</style>

{#if showMessage}
    {#if goal.dailyGoalCount > 0}
    <h3>
        {#if dailyPercent >= 100}
        {goal.dailyGoalCount.toLocaleString()} <span class="note-daily-goal note-goal-completed">daily word goal</span> completed!
        {:else}
        {goal.dailyGoalCount.toLocaleString()} <span class="note-daily-goal" style="{getColorStyle(dGColor)}">daily word goal</span>
        {/if}
    </h3>
    {/if}
    {#if goal.goalCount > 0}
        <h3>
        {#if percent >= 100}
            {goal.goalCount.toLocaleString()} <span class="note-goal note-goal-completed">word goal completed!</span>
        {:else}
            {getOverallGoalCountText(goal)} {goal.goalCount.toLocaleString()}&nbsp;<span class="note-goal" style="{getColorStyle(gColor)}">word goal</span> 
        {/if}
        </h3>
    {/if}
{/if}

