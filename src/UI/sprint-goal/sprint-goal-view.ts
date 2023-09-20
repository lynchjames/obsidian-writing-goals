import { ItemView, WorkspaceLeaf } from 'obsidian';
import SprintGoal from './sprint-goal.svelte';
import type { WritingGoalsSettings } from '../../core/settings/settings';
import { GOAL_ICON, VIEW_TYPE_GOAL_SPRINT } from '../../core/constants';
import type WritingGoals from '../../main';
import { SprintGoalHelper } from '../../core/sprint-goal-helper';
import SprintGoalModal from '../modals/sprint-goal-modal';


export default class SprintGoalView extends ItemView {

    settings: WritingGoalsSettings;
    path: string;
    plugin: WritingGoals;
    goal: any;
    sprintGoalHelper: SprintGoalHelper;
    linkedListData: { [key: string]: number; };
    timerInterval: number;

    constructor(leaf: WorkspaceLeaf, plugin: WritingGoals, sprintGoalHelper: SprintGoalHelper) {
        super(leaf);
        this.plugin = plugin;
        this.settings = this.plugin.settings;
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
    }

    protected async onClose(): Promise<void> {
        window.clearInterval(this.timerInterval);
    }

    async updatePath(path: string) {
        this.path = path;
        await this.setGoal();
    }

    onGoalClick = (path: string) => {
        const file = this.app.vault.getAbstractFileByPath(path);
        const modal = new SprintGoalModal(this.plugin, this.sprintGoalHelper);
        modal.init(file);
        modal.open();
    }

    onSprintReset = () => {
        this.setGoal();
    }

    createInterval = (updateFunc: () => void) => {
        if (this.timerInterval != null) {
            window.clearInterval(this.timerInterval);
            this.timerInterval = undefined;
        } else {
            this.timerInterval = this.plugin.registerInterval(window.setInterval(() => {
                updateFunc();
            }, 1000));
        }
    }

    async setGoal() {
        if (this.path == null) {
            return;
        }
        const { customColors, defaultSprintGoalCount, defaultSprintMinutes } = this.settings;
        const sprintGoal = await this.sprintGoalHelper.resetStartCountForSpringGoal(this.app.vault.getAbstractFileByPath(this.path)) ??
            await this.sprintGoalHelper.createSprintGoal(this.path, defaultSprintGoalCount, defaultSprintMinutes);
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
                onGoalClick: this.onGoalClick,
                onSprintReset: this.onSprintReset,
                createInterval: this.createInterval
            }
        });
    }


}


