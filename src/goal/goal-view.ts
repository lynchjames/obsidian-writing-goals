import { ItemView, TFile, WorkspaceLeaf } from 'obsidian';
import Goal from './goal.svelte';
import type { WritingGoalsSettings } from '../settings/settings';
import { GOAL_ICON, VIEW_TYPE_FILE_EXPLORER, VIEW_TYPE_GOAL } from '../constants';
import { FileHelper } from '../IO/file';
import { noteGoals } from '../stores/goal-store';
import { onDestroy } from 'svelte';

export default class GoalView extends ItemView {
   
    fileHelper: FileHelper;

    constructor(leaf: WorkspaceLeaf, settings: WritingGoalsSettings){
        super(leaf);
        this.fileHelper = new FileHelper;
    }

    getViewType(): string {
        return VIEW_TYPE_GOAL;
    }

    getDisplayText(): string {
        return 'Writing Goal';
    }

    getIcon() {
        return GOAL_ICON;
    }
 
    async updatePath(path:string) {
        this.setGoalSvelte(path);
    }

    setGoalSvelte(path:string) {
        new Goal({
            target: (this as any).contentEl,
            props: {
                path: path,
                mode: 'full',
                rootEl: this.containerEl
            },
        });    
    }
}


