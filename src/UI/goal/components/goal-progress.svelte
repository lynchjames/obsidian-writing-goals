<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { dailyGoalColor, goalColor, noteGoals } from '../../stores/goal-store';
    import type { NoteGoal } from '../../../core/note-goal';
    
    export let path: string;
    export let goal: NoteGoal;
    export let goalData: { 
                          percent: number, 
                          dailyPercent: number, 
                          progress: number, 
                          dailyProgress: number
                        };
    export let color: string;
    export let dailyColor: string;
    export let onGoalClick: (path:string) => void;

    let gColor: string;
    let dGColor: string;

    onMount(() => {
      gColor = color;
      dGColor = dailyColor;
    })

    const unsubGoalColor = goalColor.subscribe(val => {
      gColor = val
    });

    const unsubDailyGoalColor = dailyGoalColor.subscribe(val => {
      dGColor = val
    });

    onDestroy(unsubGoalColor);
    onDestroy(unsubDailyGoalColor);

    function getLineCap(per:number) {
      return  per < 95 ? 'round' : 'butt';
    }

    function getCompletedClass(percent) {
      return percent == 100 ? 'note-goal-completed' : '';
    }

    function getDailyCompletedClass(dailyPercent) {
      return dailyPercent == 100 ? 'daily-note-goal-completed' : '';
    }

    function getWordCount(goal:NoteGoal) {
      const count = goal.dailyGoalCount > 0 ? 
        goal.wordCount - goal.startCount : goal.wordCount;
      return count.toLocaleString();
    }

    function getWordsText(goal:NoteGoal) {
      return goal.dailyGoalCount > 0 ? 'words today' : 'words'; 
    }

    function onClick() {
      onGoalClick(path);
    }

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<svg on:click={onClick} class="writing-goals {getCompletedClass(goalData.percent)}" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg">
<circle class="wg-background {getCompletedClass(goalData.percent)}" r="100" cx="100" cy="100"></circle>
<circle class="wg-bar" r="90" cx="100" cy="100" transform="rotate(-90, 100, 100)" fill="transparent" stroke="{gColor}" stroke-dasharray="565.48" stroke-linecap="{getLineCap(goalData.percent)}" 
    stroke-dashoffset="{goalData.progress}"></circle>
    {#if goal.dailyGoalCount > 0}
    <circle class="wg-daily-background {getDailyCompletedClass(goalData.dailyPercent)}" r="75" cx="100" cy="100"></circle>
    <circle class="wg-daily-bar" r="75" cx="100" cy="100" transform="rotate(-90, 100, 100)" fill="transparent" stroke-dasharray="471.23" stroke-linecap="{getLineCap(goalData.dailyPercent)}" 
        stroke="{dGColor}" stroke-dashoffset="{goalData.dailyProgress}"></circle>
    {/if}
<text class="note-goal-figure" stroke-width="0" x="100" y="100" id="svg_4" font-size="40" text-anchor="middle" xml:space="preserve" font-weight="bold">{getWordCount(goal)}</text>
<text class="note-goal-text" stroke-width="0" x="100" y="140" id="svg_8" font-size="18" text-anchor="middle" xml:space="preserve">{getWordsText(goal)}</text>
</svg>

<style>
  .writing-goals-container {
      margin: auto;
      max-width: 400px;
      cursor: pointer;
  }

  .note-goal-completed .note-goal-figure, .note-goal-completed .note-goal-text {
      fill: var(--text-on-accent-inverted);
      font-weight: bold;
  }

  .note-goal-figure {
      fill: var(--text-normal);
  }

  .note-goal-text {
      fill: var(--text-normal);
  }

  .writing-goals {
      padding: 0 40px;
  }

  .writing-goals .wg-bar {
      stroke-width: 14px;
  }

  .writing-goals .wg-daily-bar {
      stroke-width: 10px;
  }

  .wg-daily-goal .writing-goals .wg-bar{
      stroke-width: 10px;
  }

  .wg-bar, .wg-simple .wg-bar {
      transition: stroke-dashoffset 0.5s linear;
  }

  .wg-daily-bar, .wg-daily-bar {
      transition: stroke-dashoffset 0.5s linear;
  }

  .wg-background, .wg-daily-background {
      fill: var(--background-primary);
  }

  .note-goal-completed, .daily-note-goal-completed {
      fill: var(--background-modifier-success);
  }

  .workspace-split.mod-root .writing-goals .background {
      fill: var(--background-secondary-alt);
  }

</style>

