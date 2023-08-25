import {
  Plugin,
  TFile,
  TFolder,
  Vault,
} from 'obsidian';

import { WritingGoalsSettings } from './settings/settings';
import { GOAL_FRONTMATTER_KEY, GOAL_ICON, VIEW_TYPE_FILE_EXPLORER, VIEW_TYPE_GOAL } from './constants';
import GoalView from './goal/goal-view';
import { WritingGoalsSettingsTab } from './settings/settings-tab';
import { createNoteGoal, Notes, type NoteGoal } from './stores/note-goal';
import Goal from './goal/goal.svelte';
import { FileHelper } from './IO/file';
import { noteGoals } from './stores/goal-store';

interface FileItem {
	titleEl?: HTMLElement;
	selfEl: HTMLElement;
}

export default class WritingGoals extends Plugin {
  settings: WritingGoalsSettings = new WritingGoalsSettings;
  vault: Vault | undefined;
  goalView: GoalView | undefined;
  fileHelper: FileHelper = new FileHelper();
  
  async onload() {
    this.vault = this.app.vault;
    this.settings = Object.assign(new WritingGoalsSettings(), await this.loadData());
    this.setupCommands();
    this.registerView(
      VIEW_TYPE_GOAL,
      (leaf) => this.goalView = new GoalView(leaf, this.settings)
    );
    this.addSettingTab(new WritingGoalsSettingsTab(this.app, this));

    this.setupEvents();
    }
  
    setupCommands() {
      this.addCommand({
        id: 'app:show-writing-goal-for-note',
        name: 'Show the writing goal for the current note',
        callback: async () => {
          await this.updateNoteGoalsInSettings(this.app.workspace.getActiveFile());
          this.initLeaf();
        },
        hotkeys: []
      });  
    }

    setupEvents() {
        this.registerEvent(this.vault.on("modify", async file => {
          if(file instanceof TFolder){
            return;
          }
          if(await this.updateNoteGoalsInSettings(file as TFile)){
            await this.loadNoteGoalData();
          }
        }));
      
        this.app.workspace.onLayoutReady(async () => {
          await this.loadNoteGoalData();
          this.initFileLabels();
        });  
    }
  


    async updateNoteGoalsInSettings(file:TFile) {
      const metadata = this.app.metadataCache.getCache(file.path);
      const wordGoal = metadata && metadata.frontmatter && metadata.frontmatter[GOAL_FRONTMATTER_KEY];
      const exists = this.settings.noteGoals.contains(file.path);
      if(!wordGoal && exists) {
        this.settings.noteGoals.remove(file.path);
        await this.saveData(this.settings);
      } 
      if(wordGoal && !exists) {
        this.settings.noteGoals.push(file.path);
        await this.saveData(this.settings);
      }
      return wordGoal;
    }

    async initLeaf() {
      await this.app.workspace.getRightLeaf(false).setViewState({
        type: VIEW_TYPE_GOAL,
        active: true
      });
    }

    async loadNoteGoalData() {
      let notes = new Notes();
      for (let index = 0; index < this.settings.noteGoals.length; index++) {
        const noteGoalPath = this.settings.noteGoals[index];
        const fileOrFolder = this.app.vault.getAbstractFileByPath(noteGoalPath);
        const goal = await createNoteGoal(this.app, this.fileHelper, fileOrFolder);
        notes[noteGoalPath] = goal;
      }
      noteGoals.set(notes);
    }

    initFileLabels() {
        const fileExplorer = this.app.workspace.getLeavesOfType(VIEW_TYPE_FILE_EXPLORER)[0];
        const fileItems: { [path: string]: FileItem } = (
			fileExplorer.view as any
		).fileItems;
        this.settings.noteGoals.forEach(path => {
            const item = fileItems[path];
            if(item) {
                const itemEl = (item.titleEl ?? item.selfEl);
                    new Goal({
                        target: itemEl,
                        props: {
                        path: path,
                        mode: 'simple',
                        },
                    });
                }
            });
        }
    
    onunload() {
      this.app.workspace.detachLeavesOfType(VIEW_TYPE_GOAL);
    }
    
  }