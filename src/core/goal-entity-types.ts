export enum GoalType {
    Note,
    Folder
}

export interface WritingGoal extends TGoal {
    path: string
    title: string
    goalType: GoalType
    goalCount: number
    wordCount: number
    dailyGoalCount: number
    startCount: number
}

export interface WritingSprintGoal extends TGoal {
    path: string
    title: string
    goalType: GoalType
    startCount: number
    wordCount: number
    sprintGoalCount: number
    sprintMinutes: number
}

export interface TGoal {
    path: string
    title: string
    goalType: GoalType
}