import { ItemView, WorkspaceLeaf, Platform, TFile } from 'obsidian';
import StatsDetail from './stats-detail.svelte';
import type { WritingGoalsSettings } from '../../core/settings/settings';
import { GOAL_ICON, VIEW_TYPE_STATS_DETAIL } from '../../core/constants';
import type WritingGoals from '../../main';
import type { GoalHistory, GoalHistoryHelper } from '../../core/goal-history/history';


export default class StatsDetaillView extends ItemView {
   
    settings: WritingGoalsSettings;
    path:string;
    plugin: WritingGoals;
    statsDetail: any;
    historyHelper: GoalHistoryHelper;
    linkedListData: { [key: string]: number; };

    constructor(leaf: WorkspaceLeaf, plugin:WritingGoals, historyHelper:GoalHistoryHelper){
        super(leaf);
        this.plugin = plugin;
        this.historyHelper = historyHelper;
    }

    getViewType(): string {
        return VIEW_TYPE_STATS_DETAIL;
    }

    getDisplayText(): string {
        return 'Writing goal stats';
    }

    getIcon() {
        return GOAL_ICON;
    }
    
    async onload(): Promise<void> {

    }

    async onOpen() {
        await this.setStats();
    }

    onGoalClick = (path:string) => {
        const fileOrFolder = this.app.vault.getAbstractFileByPath(path);
        this.plugin.openGoalModal(fileOrFolder);
    }

    onHistoryUpdate = (val: GoalHistory) => {
        if(val != null){
            const historyStats = this.historyHelper.transformHistory(val);
            return historyStats;
        }
    }

    onTitleClick = (path: string) => {
        const isFile = this.app.vault.getAbstractFileByPath(path) instanceof TFile;
        if(isFile){
            this.app.workspace.openLinkText('', path, "tab");
        }
    }

    async setStats() {
        const goalHistory = await this.historyHelper.loadHistory();
        const linkedChartData = await this.historyHelper.transformHistory(goalHistory);
        console.log(linkedChartData);
        const {customGoalBarColor, customDailyGoalBarColor, showProgressChart} = this.plugin.settings;
        const isMobile = Platform.isMobile;
        const onHistoryUpdate = this.onHistoryUpdate;
        const onGoalClick = this.onGoalClick;
        const onTitleClick = this.onTitleClick;

        //Goal svelte componet creation must happen immediately after existing component is destroyed.
        if(this.statsDetail != null) {
            this.statsDetail.$destroy();
        }
        this.statsDetail = new StatsDetail({
            target: (this as any).contentEl,
            props: {
                isMobile: isMobile,
                color: customGoalBarColor,
                dailyColor: customDailyGoalBarColor,
                chartData: linkedChartData,
                onHistoryUpdate: onHistoryUpdate,
                onGoalClick: onGoalClick,
                onTitleClick: onTitleClick
            }
        });    
    }
}


