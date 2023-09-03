import { ItemView, WorkspaceLeaf } from 'obsidian';
import Stats from './stats.svelte';
import type { WritingGoalsSettings } from '../settings/settings';
import { GOAL_ICON, VIEW_TYPE_GOAL, VIEW_TYPE_STATS } from '../constants';
import { ObsidianFileHelper } from '../IO/obsidian-file';
import type WritingGoals from '../main';
import GoalModal from '../modals/goal-modal';
import type { GoalHistoryHelper, HistoryStatsItem } from '../goal-history/history';
import moment from 'moment';


export default class StatsView extends ItemView {
   
    fileHelper: ObsidianFileHelper;
    settings: WritingGoalsSettings;
    historyHelper: GoalHistoryHelper
    path:string;
    plugin: WritingGoals;
    stats: any;

    constructor(leaf: WorkspaceLeaf, plugin: WritingGoals, historyHelper: GoalHistoryHelper){
        super(leaf);
        this.plugin = plugin;
        this.fileHelper = new ObsidianFileHelper(this.plugin.settings);
        this.historyHelper = historyHelper;
    }

    getViewType(): string {
        return VIEW_TYPE_STATS;
    }

    getDisplayText(): string {
        return 'Writing goal stats';
    }

    getIcon() {
        return GOAL_ICON;
    }
    
    onload(): void {
        
    }

    async onOpen() {
        this.setStats();
    }

    async onClose() {

    }

    async setStats() {
        if(this.stats != null) {
            this.stats.$destroy();
        }
        const heatmapData = await this.historyHelper.getStats();
        const linkedListData = this.getLinkedChartData(heatmapData);
        this.stats = new Stats({
            target: (this as any).contentEl,
            props: {
                path: this.path,
                heatMapData: heatmapData,
                data: linkedListData,
                rootEl: this.containerEl
            },
        });    
    }

    getLinkedChartData(data: HistoryStatsItem[]){
        const result = Object.fromEntries(data.filter(d => d.value > 0).map(d => [moment(new Date(d.date)).format("ddd DD MMM YYYY"), d.value]));
        return result;
    }
}


