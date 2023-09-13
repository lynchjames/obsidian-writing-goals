import { ItemView, WorkspaceLeaf, Platform } from 'obsidian';
import Goal from './goal.svelte';
import type { WritingGoalsSettings } from '../../core/settings/settings';
import { GOAL_ICON, VIEW_TYPE_GOAL } from '../../core/constants';
import type WritingGoals from '../../main';
import type { GoalHistory, GoalHistoryHelper } from '../../core/goal-history/history';


export default class GoalView extends ItemView {
   
    settings: WritingGoalsSettings;
    path:string;
    plugin: WritingGoals;
    goal: any;
    historyHelper: GoalHistoryHelper;
    linkedListData: { [key: string]: number; };

    constructor(leaf: WorkspaceLeaf, plugin:WritingGoals, historyHelper:GoalHistoryHelper){
        super(leaf);
        this.plugin = plugin;
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
        this.path = path;
        await this.setGoal();
    }

    onGoalClick = (path:string) => {
        const fileOrFolder = this.app.vault.getAbstractFileByPath(path);
        this.plugin.openGoalModal(fileOrFolder);
    }

    onNavClick = (path:string) => {
        this.path = path;    
    }

    onHistoryUpdate = (val: GoalHistory) => {
        if(val != null){
            const historyStats = this.historyHelper.transformHistory(val);
            return historyStats;
        }
    }

    async setGoal() {
        const linkedChartData = await this.historyHelper.getStats();
        const {customGoalBarColor, customDailyGoalBarColor, showProgressChart} = this.plugin.settings;
        const isMobile = Platform.isMobile;
        const onGoalClick = this.onGoalClick;
        const onNavClick = this.onNavClick;
        const onHistoryUpdate = this.onHistoryUpdate;

        //Goal svelte componet creation must happen immediately after existing component is destroyed.
        if(this.goal != null) {
            this.goal.$destroy();
        }
        this.goal = new Goal({
            target: (this as any).contentEl,
            props: {
                path: this.path,
                isMobile: isMobile,
                color: customGoalBarColor,
                dailyColor: customDailyGoalBarColor,
                linkedChartData: linkedChartData,
                showProgressChart: showProgressChart,
                onGoalClick: onGoalClick,
                onNavClick: onNavClick,
                onHistoryUpdate: onHistoryUpdate
            }
        });    
    }
}


