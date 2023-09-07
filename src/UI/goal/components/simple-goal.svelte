<script lang="ts">

    import { onDestroy, onMount } from "svelte";
    import { dailyGoalColor, goalColor, noteGoals } from '../../stores/goal-store';
    import type { NoteGoal, Notes } from '../../../core/note-goal';
    
    export let path: string;
    export let color: string;
    export let dailyColor: string;


    let goals: Notes;
    let keys: string[];
    let goal: NoteGoal;
    let percent: number = 0;
    let dailyPercent: number = 0;
    let progress: number = 0;
    let dailyProgress: number = 0;
    let simpleDailyProgress: number = 0;
    let gColor: string;
    let dGColor: string;

    onMount(() => {
      gColor = color;
      dGColor = dailyColor;
    })

    const unsubNoteGoals = noteGoals.subscribe(val => {
        if(!val[path]){
          return;
        }
        goals = val;
        goal = goals[path];
        keys = Object.keys(goals);
        loadGoal();
    });

    const unsubGoalColor = goalColor.subscribe(val => {
      gColor = val
    });

    const unsubDailyGoalColor = dailyGoalColor.subscribe(val => {
      dGColor = val
    });

    onDestroy(unsubNoteGoals);
    onDestroy(unsubGoalColor);
    onDestroy(unsubDailyGoalColor);

    function loadGoal() {
      percent = getPercent(goal.wordCount, goal.goalCount);
      dailyPercent = getPercent(getDailyDifference(goal), goal.dailyGoalCount);
      progress = calculateProgress(90, percent);
      dailyProgress = calculateProgress(75, dailyPercent);
      simpleDailyProgress = calculateProgress(50, dailyPercent);
    }

    function calculateProgress(rad, per) {
      let c = Math.PI*(rad*2);
    
      if (per < 0) { per = 0;}
      if (per > 100) { per = 100;}
      
      return ((100-per)/100)*c;
    }

    function getPercent(words, goal) {
      if(goal == 0) { return 0; }
      let per = (words/goal)*100;
      if (per < 0) { per = 0;}
      if (per > 100) { per = 100;}
      return per;
    }

    function getPercentText(percent:number) {
      const prefix = goal.dailyGoalCount > 0 ? "Daily goal" : "Goal";
      return `${prefix} ${percent.toFixed(0)}% complete`;
    }

    function getLineCap(per:number) {
      return  per < 95 ? 'round' : 'butt';
    }

    function getDailyDifference(goal){
      return goal.wordCount - goal.startCount;
    }

    function getCompletedClass(percent) {
      return percent == 100 ? 'note-goal-completed' : '';
    }

    function getDailyCompletedClass(dailyPercent) {
      return dailyPercent == 100 ? 'daily-note-goal-completed' : '';
    }

</script>

 <div class="writing-goals-simple-container" data-path="{path}" title="{getPercentText(percent)}">
    <svg class="writing-goals-simple" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <circle class="wg-background {getCompletedClass(percent)}" r="100" cx="100" cy="100"></circle>
        <circle class="wg-bar" r="90" cx="100" cy="100" transform="rotate(-90, 100, 100)" fill="transparent" 
        stroke="{gColor}" stroke-dasharray="565.48" stroke-linecap="{getLineCap(percent)}" stroke-dashoffset="{progress}"></circle>
        {#if goal.dailyGoalCount > 0}
            <circle r="50" class="wg-daily-background {getDailyCompletedClass(dailyPercent)}"  cx="100" cy="100"></circle>
            <circle class="wg-daily-bar" r="50" cx="100" cy="100" transform="rotate(-90, 100, 100)" fill="transparent" stroke-dasharray="314.15" stroke-linecap="{getLineCap(dailyPercent)}" 
            stroke="{dGColor}" stroke-dashoffset="{simpleDailyProgress}"></circle>
        {/if}
    </svg>
</div>

<style>
    .writing-goals-simple-container {
      align-self: center;
      width: 25px;
      height: 15px;
      margin: -10px 0 0 10px;
    }
    
    .writing-goals-simple {
        fill: var(--background-primary);
        max-width: 50px;
    }
    
    .writing-goals-simple .wg-bar { 
      stroke-width: 22px;
    }

    .writing-goals-simple .wg-daily-bar {
        stroke-width: 22px;
    }

    .wg-simple .wg-bar {
        transition: stroke-dashoffset 0.5s linear;
    }

    .wg-goals-simple .wg-daily-bar {
        transition: stroke-dashoffset 0.5s linear;
    }
</style>