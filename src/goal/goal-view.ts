import { ItemView, WorkspaceLeaf } from 'obsidian';
import Goal from './goal.svelte';
import type { WritingGoalsSettings } from '../settings/settings';
import { GOAL_ICON, VIEW_TYPE_GOAL } from '../constants';
import { ObsidianFileHelper } from '../IO/obsidian-file';
import type WritingGoals from '../main';
import GoalModal from '../modals/goal-modal';
import type { GoalHistoryHelper, HistoryStatsItem } from '../goal-history/history';
import moment from 'moment';


export default class GoalView extends ItemView {
   
    fileHelper: ObsidianFileHelper;
    settings: WritingGoalsSettings;
    path:string;
    plugin: WritingGoals;
    goal: any;
    historyHelper: GoalHistoryHelper;

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

    getLinkedChartData(data: HistoryStatsItem[]){
        const result = Object.fromEntries(data.filter(d => d.value > 0).map(d => [moment(new Date(d.date)).format("ddd DD MMM YYYY"), d.value]));
        return result;
    }

    async setGoal() {
        if(this.goal != null) {
            console.log('destroying goal view');
            this.goal.$destroy();
        }
        const heatmapData = await this.historyHelper.getStats(this.path);
        const linkedListData = this.getLinkedChartData(heatmapData);
        const customGoalBarColor = this.plugin.settings.customGoalBarColor;
        const customDailyGoalBarColor = this.plugin.settings.customDailyGoalBarColor;
        this.goal = new Goal({
            target: (this as any).contentEl,
            props: {
                plugin: this.plugin,
                app: this.app,
                path: this.path,
                mode: 'full',
                color: customGoalBarColor,
                dailyColor: customDailyGoalBarColor,
                heatmapData: heatmapData,
                linkedChartData: linkedListData,
                rootEl: this.containerEl
            },
        });    
    }
}


