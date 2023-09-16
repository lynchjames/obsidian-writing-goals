import { ItemView, WorkspaceLeaf, Platform } from 'obsidian';
import SprintGoal from './components/sprint-goal.svelte';
import type { WritingGoalsSettings } from '../../core/settings/settings';
import { GOAL_ICON, VIEW_TYPE_GOAL, VIEW_TYPE_GOAL_SPRINT } from '../../core/constants';
import type WritingGoals from '../../main';
import type { GoalHistory, GoalHistoryHelper } from '../../core/goal-history/history';


export default class SprintGoalView extends ItemView {
   
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
        return VIEW_TYPE_GOAL_SPRINT;
    }

    getDisplayText(): string {
        return 'Writing sprint goal';
    }

    getIcon() {
        return GOAL_ICON;
    }
    
    async onload(): Promise<void> {
        if(this.goal != undefined){
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

    async updatePath(path:string) {
        this.plugin.settings.goalLeaves.push(path);
        this.plugin.saveData(this.plugin.settings);
        this.path = path;
        await this.setGoal();
    }

    async setGoal() {
        const {customColors} = this.plugin.settings;
        const isMobile = Platform.isMobile;

        //Goal svelte componet creation must happen immediately after existing component is destroyed.
        if(this.goal != null) {
            this.goal.$destroy();
        }
        this.goal = new SprintGoal({
            target: (this as any).contentEl,
            props: {
                path: this.path,
                isMobile: isMobile,
                colors: customColors,
            }
        });    
    }
}


