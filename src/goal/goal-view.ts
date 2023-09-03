import { ItemView, WorkspaceLeaf } from 'obsidian';
import Goal from './goal.svelte';
import type { WritingGoalsSettings } from '../settings/settings';
import { GOAL_ICON, VIEW_TYPE_GOAL } from '../constants';
import { ObsidianFileHelper } from '../IO/obsidian-file';
import type WritingGoals from '../main';
import GoalModal from '../modals/goal-modal';
import type { GoalHistoryHelper, HistoryStatsItem } from '../goal-history/history';
import moment from 'moment';
import { noteGoals } from '../stores/goal-store';


export default class GoalView extends ItemView {
   
    fileHelper: ObsidianFileHelper;
    settings: WritingGoalsSettings;
    path:string;
    plugin: WritingGoals;
    goal: any;
    historyHelper: GoalHistoryHelper;
    linkedListData: { [k: string]: number; };

    constructor(leaf: WorkspaceLeaf, plugin: WritingGoals, historyHelper:GoalHistoryHelper){
        super(leaf);
        this.plugin = plugin;
        this.fileHelper = new ObsidianFileHelper(this.plugin.settings);
        this.historyHelper = historyHelper;
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
    
    async onload(): Promise<void> {
        if(this.goal != undefined){
            return;
        }
        const path = this.plugin.goalLeaves.pop();
        if(!path){
            return;
        }
        this.path = path; 
        await this.setGoal();
    }

    async onOpen() {
        await this.setGoal();
    }

    async updatePath(path:string) {
        this.plugin.settings.goalLeaves.push(path);
        this.plugin.saveData(this.plugin.settings);
        this.path = path;
        await this.setGoal();
    }

    async onClose() {

    }

    async setGoal() {
    
        const linkedChartData = await this.historyHelper.getLinkedChartData(this.path);
        const customGoalBarColor = this.plugin.settings.customGoalBarColor;
        const customDailyGoalBarColor = this.plugin.settings.customDailyGoalBarColor;

        //Goal svelte componet creation must happen immediately after existing component is destroyed.
        if(this.goal != null) {
            this.goal.$destroy();
        }
        this.goal = new Goal({
            target: (this as any).contentEl,
            props: {
                plugin: this.plugin,
                app: this.app,
                path: this.path,
                mode: 'full',
                color: customGoalBarColor,
                dailyColor: customDailyGoalBarColor,
                linkedChartData: linkedChartData,
                rootEl: this.containerEl
            },
        });    
    }
}


