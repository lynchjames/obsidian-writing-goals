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

export class WritingGoals {
    [key: string]: WritingGoal
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

export class WritingSprintGoals {
    [key: string]: WritingSprintGoal
}

export interface TGoal {
    path: string
    title: string
    goalType: GoalType
}