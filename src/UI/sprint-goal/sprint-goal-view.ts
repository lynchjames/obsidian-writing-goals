import { ItemView, WorkspaceLeaf } from 'obsidian';
import SprintGoal from './sprint-goal.svelte';
import type { WritingGoalsSettings } from '../../core/settings/settings';
import { GOAL_ICON, VIEW_TYPE_GOAL_SPRINT } from '../../core/constants';
import type WritingGoals from '../../main';
import { GoalHelper } from '../../core/goal-helper';
import { SprintGoalHelper } from '../../core/sprint-goal-helper';


export default class SprintGoalView extends ItemView {

    settings: WritingGoalsSettings;
    path: string;
    plugin: WritingGoals;
    goal: any;
    sprintGoalHelper: SprintGoalHelper;
    linkedListData: { [key: string]: number; };

    constructor(leaf: WorkspaceLeaf, plugin: WritingGoals, sprintGoalHelper: SprintGoalHelper) {
        super(leaf);
        this.plugin = plugin;
        this.sprintGoalHelper = sprintGoalHelper;
    }

    getViewType(): string {
        return VIEW_TYPE_GOAL_SPRINT;
    }

    getDisplayText(): string {
        return 'Writing sprint goal';
    }

    getIcon() {
        return GOAL_ICON;
    }

    async onload(): Promise<void> {
        if (this.goal != undefined) {
            return;
        }
        // const path = this.plugin.goalLeaves.pop();
        // if(!path){
        //     return;
        // }
        // this.path = path; 
        await this.setGoal();
    }

    async onOpen() {
        await this.setGoal();
    }

    async updatePath(path: string) {
        this.plugin.settings.goalLeaves.push(path);
        this.plugin.saveData(this.plugin.settings);
        this.path = path;
        await this.setGoal();
    }

    onGoalClick = (path: string) => {
        const fileOrFolder = this.app.vault.getAbstractFileByPath(path);
        this.plugin.openGoalModal(fileOrFolder);
    }

    onSprintReset = () => {
        this.setGoal();
    }

    async setGoal() {
        const { customColors } = this.plugin.settings;
        const onGoalClick = this.onGoalClick;
        const onSprintReset = this.onSprintReset;
        const sprintGoalCount = 1500;
        const sprintMinutes = 10;
        const sprintGoal = await this.sprintGoalHelper.createSprintGoal(this.path, sprintGoalCount, sprintMinutes);

        //Goal svelte componet creation must happen immediately after existing component is destroyed.
        if (this.goal != null) {
            this.goal.$destroy();
        }
        this.goal = new SprintGoal({
            target: (this as any).contentEl,
            props: {
                path: this.path,
                goal: sprintGoal,
                colors: customColors,
                onGoalClick: onGoalClick,
                onSprintReset: onSprintReset
            }
        });
    }
}


