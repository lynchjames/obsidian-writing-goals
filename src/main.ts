import {
  Notice,
  Plugin,
  TFile,
  TFolder
} from 'obsidian';

import { WritingGoalsSettings } from './settings/settings';
import { GOAL_ICON, REMOVE_GOAL_ICON, VIEW_TYPE_GOAL } from './constants';
import GoalView from './goal/goal-view';
import { WritingGoalsSettingsTab } from './settings/settings-tab';
import { SettingsHelper } from './settings/settings-helper';
import { createGoal, Notes } from './note-goal';
import { ObsidianFileHelper } from './IO/obsidian-file';
import { noteGoals } from './stores/goal-store';
import GoalTargetModal from './modals/goal-target-modal';
import GoalModal from './modals/goal-modal';
import { FileLabels } from './goal/file-labels';
import { WritingGoalsFile } from './IO/file';
import { GoalHistory, GoalHistoryHelper } from './goal-history/history';

export default class WritingGoals extends Plugin {
  settings: WritingGoalsSettings = new WritingGoalsSettings;
  goalView: GoalView | undefined;
  fileLabels: FileLabels;
  fileHelper: ObsidianFileHelper = new ObsidianFileHelper();
  settingsHelper: SettingsHelper = new SettingsHelper();
  goalLeaves: string[];
  
  async onload() {
    this.settings = Object.assign(new WritingGoalsSettings(), await this.loadData());
    this.goalLeaves = this.settings.goalLeaves.map(x => x).reverse();
    this.fileLabels = new FileLabels(this.app, this.settings)
    this.setupCommands();
    this.registerView(
      VIEW_TYPE_GOAL,
      (leaf) => this.goalView = new GoalView(leaf, this)
    );
    this.addSettingTab(new WritingGoalsSettingsTab(this.app, this));
    this.setupEvents();
    }
  
    setupCommands() {
      this.addCommand({
        id: 'app:view-writing-goal-for-note',
        name: 'View writing goal for the current note',
        callback: async () => {
          await this.settingsHelper.updateNoteGoalsInSettings(this, this.app.workspace.getActiveFile());
          if(this.settings.showGoalOnCreateAndUpdate){
            this.initLeaf(this.app.workspace.getActiveFile().path);
          }
        },
        hotkeys: []
      }); 
      
      this.addCommand({
        id: 'app:view-writing-goal',
        name: 'View writing goal for any note or folder',
        callback: async () => {
          new GoalTargetModal(this.app, null, this).open();
        },
        hotkeys: []
      });  

      this.addCommand({
        id: 'app:add-writing-goal',
        name: 'Add or update a writing goal for a note or folder',
        callback: async () => {
          new GoalTargetModal(this.app, new GoalModal(this.app), this).open();
        },
        hotkeys: []
      });  
    }

    setupEvents() {
        this.registerEvent(this.app.vault.on("modify", async file => {
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
          const requiresGoalUpdate = await this.settingsHelper.updateNoteGoalsInSettings(this, file as TFile)
          await this.loadNoteGoalData(requiresGoalUpdate, file.path);
        }));

        this.registerEvent(
          this.app.workspace.on("file-menu", (menu, file) => {
            if(this.settings.noGoal(file.path)) { 
              return;
            }  
              menu.addItem((item) => {
                item
                  .setTitle("Writing goal")
                  .setIcon(GOAL_ICON)
                  .onClick(async () => {
                    this.initLeaf(file.path);
                  });
              });
          })
        );

        this.registerEvent(
          this.app.workspace.on("file-menu", (menu, fileOrFolder) => {
            const prefix = this.settings.noGoal(fileOrFolder.path) ? "Add" : "Update"
            menu.addItem((item) => {
              item
                .setTitle(prefix + " writing goal")
                .setIcon(GOAL_ICON)
                .onClick(async () => {
                  const modal = new GoalModal(this.app);
                  modal.init(this, fileOrFolder);
                  modal.open();
                });
            });
          })
        );

        this.registerEvent(
          this.app.workspace.on("file-menu", (menu, fileOrFolder) => {
            if(this.settings.noGoal(fileOrFolder.path)) { 
              return;
            }  
            menu.addItem((item) => {
              item
                .setTitle("Remove writing goal")
                .setIcon(REMOVE_GOAL_ICON)
                .onClick(async () => {
                  this.settings.removeGoal(fileOrFolder);
                  if(fileOrFolder instanceof TFile){
                    const file = fileOrFolder as TFile;
                    await this.app.fileManager.processFrontMatter(file as TFile, (frontMatter) => {
                      try {
                        delete frontMatter[this.settings.customGoalFrontmatterKey]; 
                      } catch (error) {
                        new Notice("Error removing goal frontmatter for " + file.name);
                      }
                    });
                  }
                  await this.saveData(this.settings);
                  this.loadNoteGoalData();
                });
            });
          })
        );

        this.registerEvent(
          this.app.vault.on("rename", (file, oldPath) => {
            this.settings.rename(file, oldPath);
            this.saveData(this.settings);
          })
        );

        this.registerEvent(
          this.app.vault.on("delete", (file) => {
            this.settings.removeGoal(file);
            this.saveData(this.settings);
            this.loadNoteGoalData();
          })
        );

        this.registerEvent(
          this.app.workspace.on("layout-change", (async () => {
            this.goalLeaves = this.settings.goalLeaves.map(x => x);
            await this.loadNoteGoalData(true);
          }))
        );

        this.app.workspace.onLayoutReady((async () => {
          this.goalLeaves = this.settings.goalLeaves.map(x => x);
          await this.loadNoteGoalData();
        }));
        
        this.registerInterval(
          window.setInterval(() => {
            const goalLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_GOAL);
            this.settings.goalLeaves = goalLeaves.map(gl => (gl.view as GoalView).path);
            this.saveData(this.settings);
          }, 5000)
        );
    }

    async initLeaf(path:string) {
      if(this.settings.showSingleGoalView) {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_GOAL);
      }
      const goalLeaf = await this.app.workspace.getRightLeaf(false);
      await goalLeaf.setViewState({
        type: VIEW_TYPE_GOAL,
        active: true
      });
      try {
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_GOAL);
        const view = leaves.last().view as GoalView;
        await view.updatePath(path); 
      } catch (error) {
        new Notice("Failed to show goal for " + path); 
      }
    }

    async loadNoteGoalData(requiresGoalLabelUpdate?:boolean, pathForLabel?:string) {
      let notes = new Notes();
      for (let index = 0; index < this.settings.noteGoals.length; index++) {
        const noteGoal = this.settings.noteGoals[index];
        const file = this.app.vault.getAbstractFileByPath(noteGoal);
        const goal = await createGoal(this.app, this.settings, this.fileHelper, file);
        notes[noteGoal] = goal;
      }
      for (let index = 0; index < this.settings.folderGoals.length; index++) {
        const folderGoal = this.settings.folderGoals[index];
        const folder = this.app.vault.getAbstractFileByPath(folderGoal.path);
        const goal = await createGoal(this.app, this.settings, this.fileHelper, folder, folderGoal.goalCount);
        notes[folderGoal.path] = goal;
      }
      noteGoals.set(notes);
      if(requiresGoalLabelUpdate){
        await this.fileLabels.initFileLabels(pathForLabel);
      }
    }
    
  }