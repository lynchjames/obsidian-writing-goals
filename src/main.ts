import {
  Notice,
  Plugin,
  TAbstractFile,
  TFile,
  TFolder,
  addIcon
} from 'obsidian';

import { WritingGoalsSettings } from './core/settings/settings';
import { GOAL_ICON, GOAL_ICON_SVG, REMOVE_GOAL_ICON, VIEW_TYPE_GOAL, VIEW_TYPE_STATS_DETAIL } from './core/constants';
import GoalView from './UI/goal/goal-view';
import { WritingGoalsSettingsTab } from './core/settings/settings-tab';
import { NoteGoalHelper, Notes } from './core/note-goal';
import { ObsidianFileHelper } from './IO/obsidian-file';
import { goalHistory, noteGoals } from './UI/stores/goal-store';
import GoalTargetModal from './UI/modals/goal-target-modal';
import GoalModal from './UI/modals/goal-modal';
import { FileLabels } from './UI/goal/file-labels';
import { GoalHistoryHelper } from './core/goal-history/history';
import { FrontmatterHelper } from './IO/frontmapper-helper';
import StatsDetaillView from './UI/stats/stats-detail-view';

export default class WritingGoals extends Plugin {
  settings: WritingGoalsSettings = new WritingGoalsSettings;
  goalView: GoalView | undefined;
  fileLabels: FileLabels;
  fileHelper: ObsidianFileHelper;
  frontmatterHelper: FrontmatterHelper;
  goalHistoryHelper: GoalHistoryHelper;
  noteGoalHelper: NoteGoalHelper;
  goalLeaves: string[];
  
  async onload() {
    this.settings = Object.assign(new WritingGoalsSettings(), await this.loadData());
    this.fileHelper = new ObsidianFileHelper(this.settings);
    this.frontmatterHelper =  new FrontmatterHelper(this.app);
    this.goalHistoryHelper = new GoalHistoryHelper(this.app, this.settings, this.manifest);
    this.noteGoalHelper = new NoteGoalHelper(this.app, this.settings, this.goalHistoryHelper);
    this.goalLeaves = this.settings.goalLeaves.map(x => x).reverse();
    this.fileLabels = new FileLabels(this.app, this.settings);
    this.setupCommands();
    addIcon(GOAL_ICON, GOAL_ICON_SVG);
    this.registerView(
      VIEW_TYPE_GOAL,
      (leaf) => this.goalView = new GoalView(leaf, this, this.goalHistoryHelper)
      );
    this.registerView(
      VIEW_TYPE_STATS_DETAIL,
      (leaf) => new StatsDetaillView(leaf, this, this.goalHistoryHelper)
      );
    this.addSettingTab(new WritingGoalsSettingsTab(this.app, this));
    this.setupEvents();
    this.initialFrontmatterGoalIndex();
  }

    async initialFrontmatterGoalIndex() {
      const files = this.app.vault.getMarkdownFiles();
      await files.forEach(async (file) => {
        await this.frontmatterHelper.updateNoteGoalsFromFrontmatter(this, file);
      });
      this.loadNoteGoalData(true);
    }
  
    setupCommands() {
      this.addCommand({
        id: 'view-writing-goal-for-note',
        name: 'View writing goal for the current note',
        callback: async () => {
          await this.frontmatterHelper.updateNoteGoalsFromFrontmatter(this, this.app.workspace.getActiveFile());
          if(this.settings.showGoalOnCreateAndUpdate){
            this.initLeaf(this.app.workspace.getActiveFile().path);
          }
        },
        hotkeys: []
      }); 
      
      this.addCommand({
        id: 'view-writing-goal',
        name: 'View writing goal for any note or folder',
        callback: async () => {
          new GoalTargetModal(this, null).open();
        },
        hotkeys: []
      });  

      this.addCommand({
        id: 'add-writing-goal',
        name: 'Add or update a writing goal for a note or folder',
        callback: async () => {
          new GoalTargetModal(this, new GoalModal(this, this.goalHistoryHelper)).open();
        },
        hotkeys: []
      }); 
      
      this.addCommand({
        id: 'view-writing-goal-stats',
        name: 'View all your writing goal stats',
        callback: async () => {
          const statsLeaf = await this.app.workspace.getLeaf(true);
          await statsLeaf.setViewState({
            type: VIEW_TYPE_STATS_DETAIL,
            active: true
          });
        },
        hotkeys: []
      });  
    }

    setupEvents() {
        this.registerEvent(this.app.vault.on("modify", async file => {
          if(file instanceof TFolder){
            return;
          }
          await this.frontmatterHelper.updateNoteGoalsFromFrontmatter(this, file as TFile)
          await this.loadNoteGoalData(false);
        }));

        this.registerEvent(this.app.metadataCache.on("changed", async file => {
          if(file instanceof TFolder){
            return;
          }
          await this.frontmatterHelper.updateNoteGoalsFromFrontmatter(this, file as TFile);
          await this.loadNoteGoalData(true);
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
            const isNewGoal = this.settings.noGoal(fileOrFolder.path);
            const prefix = isNewGoal ? "Add" : "Update"
            menu.addItem((item) => {
              item
                .setTitle(prefix + " writing goal")
                .setIcon(GOAL_ICON)
                .onClick(async () => {
                  this.openGoalModal(fileOrFolder, isNewGoal);
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
                  await this.saveData(this.settings);
                  if(fileOrFolder instanceof TFile){
                    const file = fileOrFolder as TFile;
                    await this.app.fileManager.processFrontMatter(file as TFile, (frontMatter) => {
                      try {
                        delete frontMatter[this.settings.customGoalFrontmatterKey];
                        delete frontMatter[this.settings.customDailyGoalFrontmatterKey]; 
                      } catch (error) {
                        new Notice("Error removing goal frontmatter for " + file.name);
                      }
                    });
                  }
                  this.detachGoalViewLeaf(fileOrFolder.path);
                  await this.loadNoteGoalData(true, fileOrFolder.path);
                });
            });
          })
        );

        this.registerEvent(
          this.app.vault.on("rename", (file, oldPath) => {
            this.settings.rename(file, oldPath);
            this.saveData(this.settings);
            this.goalHistoryHelper.renameHistoryEntry(file.path, oldPath);
            this.loadNoteGoalData(true);
          })
        );
 
        this.registerEvent(
          this.app.vault.on("delete", async (file) => {
            this.settings.removeGoal(file);
            await this.saveData(this.settings);
            this.detachGoalViewLeaf(file.path);
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

    async openGoalModal(fileOrFolder: TAbstractFile, openGoalOnSubmit?: boolean){
      const modal = new GoalModal(this, this.goalHistoryHelper);
      modal.init(this, fileOrFolder, openGoalOnSubmit);
      modal.open();
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

    detachGoalViewLeaf(path: string) {
      const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_GOAL);
      leaves.forEach(l =>  {
        if((l.view as GoalView).path == path) {
          l.detach();
        }
      });
    }

    async loadNoteGoalData(requiresGoalLabelUpdate?:boolean, pathForLabel?:string) {
      let notes = new Notes();
      for (let index = 0; index < this.settings.noteGoals.length; index++) {
        const noteGoal = this.settings.noteGoals[index];
        const file = this.app.vault.getAbstractFileByPath(noteGoal);
        const goal = await this.noteGoalHelper.createGoal(this.settings, file);
        notes[noteGoal] = goal;
      }
      for (let index = 0; index < this.settings.folderGoals.length; index++) {
        const folderGoal = this.settings.folderGoals[index];
        const folder = this.app.vault.getAbstractFileByPath(folderGoal.path);
        const goal = await this.noteGoalHelper.createGoal(this.settings, folder, folderGoal.goalCount, folderGoal.dailyGoalCount);
        notes[folderGoal.path] = goal;
      }
      noteGoals.set(notes);
      goalHistory.set(await this.goalHistoryHelper.loadHistory());
      if(requiresGoalLabelUpdate){
        await this.fileLabels.initFileLabels(pathForLabel);
      }
    }
    
  }