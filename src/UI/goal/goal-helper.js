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

  function getDailyDifference(goal){
    return goal.wordCount - goal.startCount;
  }

  export function loadGoal(goal) {
    const percent = getPercent(goal.wordCount, goal.goalCount);
    const dailyPercent = getPercent(getDailyDifference(goal), goal.dailyGoalCount);
    return {
      percent: percent,
      dailyPercent: dailyPercent,
      progress: calculateProgress(90, percent),
      dailyProgress: calculateProgress(75, dailyPercent)
    }
  }