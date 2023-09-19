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
    timerIntervalSet: boolean;

    constructor(leaf: WorkspaceLeaf, plugin: WritingGoals, sprintGoalHelper: SprintGoalHelper) {
        super(leaf);
        this.plugin = plugin;
        this.settings = this.plugin.settings;
        this.sprintGoalHelper = sprintGoalHelper;
        this.timerIntervalSet = false;
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
        this.plugin.settings.goalLeaves.push(path);
        this.plugin.saveData(this.plugin.settings);
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
        if (this.timerIntervalSet) {
            window.clearInterval(this.timerInterval);
            this.timerIntervalSet = false
        } else {
            this.timerInterval = this.plugin.registerInterval(window.setInterval(() => {
                updateFunc();
            }, 1000));
            this.timerIntervalSet = true;
        }
    }

    async setGoal() {
        if (this.path == null) {
            return;
        }
        const { customColors } = this.plugin.settings;
        const onGoalClick = this.onGoalClick;
        const onSprintReset = this.onSprintReset;
        const createInterval = this.createInterval;
        const sprintGoalCount = this.settings.defaultSprintGoalCount;
        const sprintMinutes = this.settings.defaultSpringMinutes;
        const sprintGoal = await this.sprintGoalHelper.resetStartCountForSpringGoal(this.app.vault.getAbstractFileByPath(this.path)) ??
            await this.sprintGoalHelper.createSprintGoal(this.path, sprintGoalCount, sprintMinutes);
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
                onSprintReset: onSprintReset,
                createInterval: createInterval
            }
        });
    }


}


