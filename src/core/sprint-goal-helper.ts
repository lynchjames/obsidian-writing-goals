import { App, TAbstractFile } from "obsidian";
import { GoalHelper } from "./goal-helper";
import { WritingSprintGoals } from "./goal-entities";
import { sprintGoals } from "../UI/stores/sprint-goal-store";
import type { WritingSprintGoal } from "./goal-entity-types";

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
        this.updateStore();
        return sprintGoal;
    }

    async updateSprintGoal(file: TAbstractFile) {
        const sprintGoal = this.sprintGoals[file.path];
        if (sprintGoal != null) {
            this.sprintGoals[file.path] = await this.goalHelper.createSprintGoal(file, sprintGoal.sprintGoalCount, sprintGoal.sprintMinutes, sprintGoal.startCount);
            this.updateStore();
        }
    }

    async getSprintGoal(file: TAbstractFile): Promise<WritingSprintGoal> {
        return this.sprintGoals[file.path];
    }

    async resetStartCountForSpringGoal(file: TAbstractFile) {
        const sprintGoal = await this.getSprintGoal(file);
        if (sprintGoal != null) {
            sprintGoal.startCount = sprintGoal.wordCount;
            this.sprintGoals[file.path] = sprintGoal;
            this.updateStore();
        }
        return sprintGoal;
    }

    private updateStore() {
        sprintGoals.set(this.sprintGoals);
    }
}