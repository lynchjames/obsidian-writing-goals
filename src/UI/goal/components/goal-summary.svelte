<script lang="ts">
    import { onDestroy } from "svelte";
    import { showGoalMessage } from '../../stores/goal-store';
    import type { NoteGoal } from '../../../core/note-goal';

    export let goal: NoteGoal;
    export let goalData: { percent: number, dailyPercent: number, progress: number, dailyProgress: number};
    export let color: string;
    export let dailyColor: string;

    let showMessage: boolean = true;

    function getOverallGoalCountText(goal:NoteGoal) {
      return goal.wordCount.toLocaleString() + ' of';
    }

    const unsubNShowGoalMessage = showGoalMessage.subscribe(val => {
        showMessage = val;
    });

    onDestroy(unsubNShowGoalMessage);

    function getColorStyle(color:string) {
        return `color: ${color}`;
    }

</script>

{#if showMessage}
    {#if goal.goalCount > 0}
    <h3>
        {#if goalData.percent >= 100}
            {goal.goalCount.toLocaleString()} <span class="note-goal note-goal-completed">word goal completed!</span>
        {:else}
            {getOverallGoalCountText(goal)} {goal.goalCount.toLocaleString()}&nbsp;<span class="note-goal" style="{getColorStyle(color)}">word goal</span> 
        {/if}
    </h3>
    {/if}
    {#if goal.dailyGoalCount > 0}
    <h3>
        {#if goalData.dailyPercent >= 100}
            {goal.dailyGoalCount.toLocaleString()} <span class="note-daily-goal note-goal-completed">daily word goal</span> completed!
        {:else}
            {goal.dailyGoalCount.toLocaleString()} <span class="note-daily-goal" style="{getColorStyle(dailyColor)}">daily word goal</span>
        {/if}
    </h3>
    {/if}
{/if}

<style>
    h3 {
        color: var(--color-text-title);
        text-align: center;
        font-size: 1em;
        margin: 4px 0;
    }

    .note-goal-completed {
        color: var(--text-success);
    }
</style>