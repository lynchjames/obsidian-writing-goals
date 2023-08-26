import {
  Plugin,
  TFile,
  TFolder,
  Vault,
} from 'obsidian';

import { WritingGoalsSettings } from './settings/settings';
import { GOAL_ICON, VIEW_TYPE_FILE_EXPLORER, VIEW_TYPE_GOAL } from './constants';
import GoalView from './goal/goal-view';
import { WritingGoalsSettingsTab } from './settings/settings-tab';
import { SettingsHelper } from './settings/settings-helper';
import { createGoal, Notes } from './stores/note-goal';
import Goal from './goal/goal.svelte';
import { FileHelper } from './IO/file';
import { noteGoals } from './stores/goal-store';
import GoalTargetModal from './modals/goal-target-modal';
import GoalModal from './modals/goal-modal';

interface FileItem {
	titleEl?: HTMLElement;
	selfEl: HTMLElement;
}

export default class WritingGoals extends Plugin {
  settings: WritingGoalsSettings = new WritingGoalsSettings;
  vault: Vault | undefined;
  goalView: GoalView | undefined;
  fileHelper: FileHelper = new FileHelper();
  settingsHelper: SettingsHelper = new SettingsHelper();
  
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
          await this.settingsHelper.updateNoteGoalsInSettings(this, this.app.workspace.getActiveFile());
          this.initLeaf(this.app.workspace.getActiveFile().path);
        },
        hotkeys: []
      });  

      this.addCommand({
        id: 'app:add-writing-goal',
        name: 'Add a writing goal for a note or folder',
        callback: async () => {
          new GoalTargetModal(this.app, new GoalModal(this.app), this).open();
        },
        hotkeys: []
      });  
    }

    setupEvents() {
        this.registerEvent(this.vault.on("modify", async file => {
          if(file instanceof TFolder){
            return;
          }
          await this.settingsHelper.updateNoteGoalsInSettings(this, file as TFile)
          await this.loadNoteGoalData();
        }));

        this.registerEvent(this.app.metadataCache.on("changed", async file => {
          if(file instanceof TFolder){
            return;
          }
          await this.settingsHelper.updateNoteGoalsInSettings(this, file as TFile)
          await this.loadNoteGoalData();
        }));

        this.registerEvent(
          this.app.workspace.on("file-menu", (menu, file) => {
            const prefix = this.settings.noGoal(file.path) ? "Add" : "Update"
            menu.addItem((item) => {
              item
                .setTitle(prefix + " writing goal")
                .setIcon(GOAL_ICON)
                .onClick(async () => {
                  const modal = new GoalModal(this.app);
                  modal.init(this, file);
                  modal.open();
                });
            });
          })
        );

        this.registerEvent(
          this.app.workspace.on("file-menu", (menu, file) => {
            if(this.settings.noGoal(file.path)) { 
              return;
            }  
              menu.addItem((item) => {
                item
                  .setTitle("Show writing goal")
                  .setIcon(GOAL_ICON)
                  .onClick(async () => {
                    this.initLeaf(file.path);
                  });
              });
          })
        );
      
        this.app.workspace.onLayoutReady(async () => {
          await this.loadNoteGoalData();
        });  
    }

    async initLeaf(path:string) {
      const goalLeaf = await this.app.workspace.getRightLeaf(false);
      await goalLeaf.setViewState({
        type: VIEW_TYPE_GOAL,
        active: true
      });
      const view = goalLeaf.view as GoalView;
      view.updatePath(path);
    }

    async loadNoteGoalData() {
      let notes = new Notes();
      for (let index = 0; index < this.settings.noteGoals.length; index++) {
        const noteGoal = this.settings.noteGoals[index];
        const file = this.app.vault.getAbstractFileByPath(noteGoal);
        const goal = await createGoal(this.app, this.fileHelper, file);
        notes[noteGoal] = goal;
      }
      for (let index = 0; index < this.settings.folderGoals.length; index++) {
        const folderGoal = this.settings.folderGoals[index];
        const folder = this.app.vault.getAbstractFileByPath(folderGoal.path);
        const goal = await createGoal(this.app, this.fileHelper, folder, folderGoal.goalCount);
        notes[folderGoal.path] = goal;
      }
      noteGoals.set(notes);
      this.initFileLabels();
    }

    initFileLabels() {
        const fileExplorer = this.app.workspace.getLeavesOfType(VIEW_TYPE_FILE_EXPLORER)[0];
        const fileItems: { [path: string]: FileItem } = (
          fileExplorer.view as any
        ).fileItems;
        this.resetFileLabels(fileItems);
        if(!this.settings.showInFileExplorer) {
          return;
        }
        const combinedGoals = this.settings.noteGoals.concat(this.settings.folderGoals.map(fg => fg.path));
        combinedGoals.forEach(path => {
            const item = fileItems[path];
            const itemEl = item ? (item.titleEl ?? item.selfEl) : undefined;
            if(item && itemEl && !this.containsLabel(itemEl)) {
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

    resetFileLabels(fileItems:any) {
      for (let key in fileItems) {
        const item = fileItems[key];
        const itemEl = (item.titleEl ?? item.selfEl);
        for (let i = 0; i < itemEl.children.length; i++) {
          const child = itemEl.children[i];
          if(child && this.containsLabel(child)){
            itemEl.removeChild(child);
          }
        }
      }
    }

    containsLabel(el: any) {
      return el?.className?.contains('writing-goals-simple-container')
    }
    
    onunload() {
      this.app.workspace.detachLeavesOfType(VIEW_TYPE_GOAL);
    }
    
  }