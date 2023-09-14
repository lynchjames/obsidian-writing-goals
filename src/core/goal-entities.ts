export enum GoalType {
    Note,
    Folder
}

export interface WritingGoal {
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