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
import { FileHelper } from './IO/file';
import { noteGoals } from './stores/goal-store';
import GoalTargetModal from './modals/goal-target-modal';
import GoalModal from './modals/goal-modal';
import { FileLabels } from './goal/file-labels';

export default class WritingGoals extends Plugin {
  settings: WritingGoalsSettings = new WritingGoalsSettings;
  goalView: GoalView | undefined;
  fileLabels: FileLabels;
  fileHelper: FileHelper = new FileHelper();
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
        name: 'View the writing goal for the current note',
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
          await this.settingsHelper.updateNoteGoalsInSettings(this, file as TFile)
          await this.loadNoteGoalData();
        }));

        this.registerEvent(
          this.app.workspace.on("file-menu", (menu, file) => {
            if(this.settings.noGoal(file.path)) { 
              return;
            }  
              menu.addItem((item) => {
                item
                  .setTitle("View writing goal")
                  .setIcon(GOAL_ICON)
                  .onClick(async () => {
                    this.initLeaf(file.path);
                  });
              });
          })
        );

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
          this.app.vault.on("rename", (file, oldPath) => {
            if(this.settings.noteGoals.contains(oldPath)){
              this.settings.noteGoals.remove(oldPath);
              this.settings.noteGoals.push(file.path);
            }
            const folderGoal = this.settings.folderGoals.filter(fg => fg.path == oldPath)[0];
            if(folderGoal != null){
              this.settings.folderGoals.remove(folderGoal);
              folderGoal.path = file.path;
              this.settings.folderGoals.push(folderGoal);
              //TODO: Need to also rename note goals that have this folder as a parent
              const noteGoalChildren = this.settings.noteGoals.filter(ng => ng.contains(oldPath));
              noteGoalChildren.forEach(ngc => { 
                this.settings.noteGoals.remove(ngc);
                const updated = ngc.replace(oldPath, file.path);
                this.settings.noteGoals.push(updated);
              });
            }
            if(this.settings.goalLeaves.contains(oldPath)){
              this.settings.goalLeaves.remove(oldPath);
              this.settings.goalLeaves.push(file.path);
            }
            this.saveData(this.settings);
          })
        );

        this.registerEvent(
          this.app.vault.on("delete", (file) => {
            if(this.settings.noteGoals.contains(file.path)){
              this.settings.noteGoals.remove(file.path);
            }
            const folderGoal = this.settings.folderGoals.filter(fg => fg.path == file.path)[0];
            if(folderGoal != null){
              this.settings.folderGoals.remove(folderGoal);
            }
            if(this.settings.goalLeaves.contains(file.path)){
              this.settings.goalLeaves.remove(file.path);
            }
            this.saveData(this.settings);
            this.loadNoteGoalData();
          })
        );

        this.registerInterval(
          window.setInterval(() => {
            const goalLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_GOAL);
            this.settings.goalLeaves = goalLeaves.map(gl => (gl.view as GoalView).path);
            this.saveData(this.settings);
          }, 10000)
        );
      
        this.app.workspace.onLayoutReady(async () => {
          await this.loadNoteGoalData();
        });  
    }

    async initLeaf(path:string) {
      const goalLeaf = await this.app.workspace.getRightLeaf(true);
      await goalLeaf.setViewState({
        type: VIEW_TYPE_GOAL,
        active: true
      });
      const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_GOAL);
      const view = leaves.filter(l => (l.view as GoalView).goal == undefined)[0].view as GoalView;
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
      await this.fileLabels.initFileLabels();
    }
    
    onunload() {
      this.app.workspace.detachLeavesOfType(VIEW_TYPE_GOAL);
    }
    
  }