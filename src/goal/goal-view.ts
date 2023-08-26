import { ItemView, TAbstractFile, TFile, WorkspaceLeaf } from 'obsidian';
import Goal from './goal.svelte';
import type { WritingGoalsSettings } from '../settings/settings';
import { GOAL_ICON, VIEW_TYPE_GOAL } from '../constants';
import { FileHelper } from '../IO/file';
import type WritingGoals from '../main';
import GoalModal from '../modals/goal-modal';


export default class GoalView extends ItemView {
   
    fileHelper: FileHelper;
    settings: WritingGoalsSettings;
    path:string;
    plugin: WritingGoals;
    goal: any;

    constructor(leaf: WorkspaceLeaf, plugin: WritingGoals){
        super(leaf);
        this.fileHelper = new FileHelper;
        this.plugin = plugin;
    }

    getViewType(): string {
        return VIEW_TYPE_GOAL;
    }

    getDisplayText(): string {
        return 'Goal';
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
            const modal = new GoalModal(this.app);
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
                rootEl: this.containerEl
            },
        });    
    }
}


