import { App, TAbstractFile } from "obsidian";
import { GoalHelper } from "./goal-helper";
import { WritingSprintGoals } from "./goal-entities";
import { sprintGoals } from "../UI/stores/sprint-goal-store";

export class SprintGoalHelper {

    app: App;
    goalHelper: GoalHelper;
    sprintGoals: WritingSprintGoals;

    constructor(app: App, goalHelper: GoalHelper) {
        this.app = app;
        this.goalHelper = goalHelper;
        this.sprintGoals = new WritingSprintGoals();
    }

    async createSprintGoal(path: string, sprintGoalCount: number, sprintMinutes: number) {
        const sprintGoal = await this.goalHelper.createSprintGoal(this.app.vault.getAbstractFileByPath(path), sprintGoalCount, sprintMinutes);
        this.sprintGoals[path] = sprintGoal;
        sprintGoals.set(this.sprintGoals);
        return sprintGoal;
    }

    async updateSpringGoal(file: TAbstractFile) {
        console.log(this.sprintGoals);
        const sprintGoal = this.sprintGoals[file.path];
        if (sprintGoal != null) {
            this.sprintGoals[file.path] = await this.goalHelper.createSprintGoal(file, sprintGoal.sprintGoalCount, sprintGoal.sprintMinutes, sprintGoal.startCount);
        }
        sprintGoals.set(this.sprintGoals);
    }
}