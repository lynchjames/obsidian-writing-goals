import { DAILY_GOAL_BAR_COLOR, GOAL_BACKGROUND_COLOR, GOAL_BAR_COLOR, GOAL_SUCCESS_COLOR, GOAL_TEXT_COLOR } from "../constants"

export class WritingGoalColors {
    goalColor: string
    dailyGoalColor: string
    textColor: string
    backgroundColor: string
    successColor: string

    constructor() {
        this.goalColor = GOAL_BAR_COLOR;
        this.dailyGoalColor = DAILY_GOAL_BAR_COLOR;
        this.textColor = GOAL_TEXT_COLOR;
        this.backgroundColor = GOAL_BACKGROUND_COLOR
        this.successColor = GOAL_SUCCESS_COLOR;
    }
}