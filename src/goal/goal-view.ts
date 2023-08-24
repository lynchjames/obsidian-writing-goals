import { ItemView, TFile, WorkspaceLeaf } from 'obsidian';
import Goal from './goal.svelte';
import type { WritingGoalsSettings } from '../settings/settings';
import { GOAL_ICON, VIEW_TYPE_FILE_EXPLORER, VIEW_TYPE_GOAL } from '../constants';
import { File } from '../IO/file';
import { wordCount, goalCount, noteTitle } from '../stores/goal-store';

interface FileItem {
	titleEl?: HTMLElement;
	selfEl: HTMLElement;
}

export default class GoalView extends ItemView {
   
    goal:Goal;
    file: File;
    settings: WritingGoalsSettings;

    constructor(leaf: WorkspaceLeaf, settings: WritingGoalsSettings){
        super(leaf);
        this.settings = settings;
        this.file = new File;
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

    async update() {
        const file = this.app.workspace.getActiveFile();
        const metadata = this.app.metadataCache.getFileCache(file);
        try {
            noteTitle.set(file.basename);
            const wordCountProperty = metadata.frontmatter["word-goal"];
            if(wordCountProperty) {
                goalCount.set(wordCountProperty);
                const fileContents = await this.app.vault.cachedRead(file);
                wordCount.set(await this.file.countWords(fileContents, metadata));
                this.updateFileLabel(file);
            }
        } 
        //Swallowing error if frontmatter property not present
        catch (error) {
            goalCount.set(0);
            noteTitle.set('');
        }
    }
 
    async onOpen() {
        this.goal = new Goal({
          target: (this as any).contentEl,
          props: {
            wordCount: wordCount,
            goalCount: goalCount,
            mode: 'full',
            rootEl: this.containerEl
          },
        });
        this.registerActiveLeafUpdate();
    }

    registerActiveLeafUpdate() {
        this.registerInterval(
            window.setInterval(() => this.checkAndUpdate(), 1000)
        );
    }

    async checkAndUpdate() {
        try {
            if(await this.checkActiveLeaf()) {
                this.update();
            }
        } catch (error) {
            console.error(error)
        }
    }

    async checkActiveLeaf() {
        if((this.app.workspace.getMostRecentLeaf() as WorkspaceLeaf).view.getViewType() === VIEW_TYPE_GOAL){
            return false;
        }
        this.update();
    }

    updateFileLabel(file: TFile) {
        const fileExplorer = this.app.workspace.getLeavesOfType(VIEW_TYPE_FILE_EXPLORER)[0];
        const fileItems: { [path: string]: FileItem } = (
			fileExplorer.view as any
		).fileItems;
        const item = fileItems[file.path];
			(item.titleEl ?? item.selfEl).append();
    }
}


