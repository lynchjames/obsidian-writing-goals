import { ItemView, WorkspaceLeaf } from 'obsidian';
import Goal from './goal.svelte';
import type { WritingGoalsSettings } from '../settings/settings';
import { GOAL_ICON, VIEW_TYPE_GOAL } from '../constants';
import { ObsidianFileHelper } from '../IO/obsidian-file';
import type WritingGoals from '../main';
import GoalModal from '../modals/goal-modal';
import type { GoalHistoryHelper } from '../goal-history/history';


export default class GoalView extends ItemView {
   
    fileHelper: ObsidianFileHelper;
    settings: WritingGoalsSettings;
    path:string;
    plugin: WritingGoals;
    goal: any;

    constructor(leaf: WorkspaceLeaf, plugin: WritingGoals){
        super(leaf);
        this.plugin = plugin;
        this.fileHelper = new ObsidianFileHelper(this.plugin.settings);
    }

    getViewType(): string {
        return VIEW_TYPE_GOAL;
    }

    getDisplayText(): string {
        return 'Writing goal';
    }

    getIcon() {
        return GOAL_ICON;
    }
    
    onload(): void {
        if(this.goal != undefined){
            return;
        }
        const path = this.plugin.goalLeaves.pop();
        if(!path){
            return;
        }
        this.path = path; 
        this.setGoal();
    }

    async onOpen() {
        this.setGoal();
        this.addAction(GOAL_ICON, "Update goal", (evt:MouseEvent) => {
            const modal = new GoalModal(this.app, this.plugin.settings, this.plugin.goalHistoryHelper);
            modal.init(this.plugin, this.app.vault.getAbstractFileByPath(this.path));
            modal.open();
        });
    }

    async updatePath(path:string) {
        this.plugin.settings.goalLeaves.push(path);
        this.plugin.saveData(this.plugin.settings);
        this.path = path;
        this.setGoal();
    }

    async onClose() {

    }

    setGoal() {
        if(this.goal != null) {
            this.goal.$destroy();
        }
        this.goal = new Goal({
            target: (this as any).contentEl,
            props: {
                path: this.path,
                mode: 'full',
                color: this.plugin.settings.customGoalBarColor,
                dailyColor: this.plugin.settings.customDailyGoalBarColor,
                rootEl: this.containerEl
            },
        });    
    }
}


