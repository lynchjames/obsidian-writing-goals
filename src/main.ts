import {
  Notice,
  Plugin,
  TAbstractFile,
  TFile,
  TFolder,
  addIcon
} from "obsidian";

<<<<<<< HEAD
import { WritingGoalsSettings } from "./core/settings/settings";
import { GOAL_ICON, GOAL_ICON_SVG, REMOVE_GOAL_ICON, VIEW_TYPE_GOAL, VIEW_TYPE_STATS_DETAIL } from "./core/constants";
import GoalView from "./UI/goal/goal-view";
import { WritingGoalsSettingsTab } from "./core/settings/settings-tab";
import { GoalHelper } from "./core/goal-helper";
import { ObsidianFileHelper } from "./IO/obsidian-file";
import GoalTargetModal from "./UI/modals/goal-target-modal";
import GoalModal from "./UI/modals/goal-modal";
import { FileLabels } from "./UI/goal/file-labels";
import { GoalHistoryHelper } from "./core/goal-history/history";
import { FrontmatterHelper } from "./IO/frontmapper-helper";
import StatsDetaillView from "./UI/stats/stats-detail-view";
=======
import { WritingGoalsSettings } from './core/settings/settings';
import { GOAL_ICON, REMOVE_GOAL_ICON, VIEW_TYPE_GOAL, VIEW_TYPE_GOAL_SPRINT } from './core/constants';
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
import SprintGoalView from './UI/goal/sprint-goal-view';
>>>>>>> 722af5d (Sprint goal PoC)

export default class WritingGoals extends Plugin {
  settings: WritingGoalsSettings = new WritingGoalsSettings;
  goalView: GoalView | undefined;
  fileLabels: FileLabels;
  fileHelper: ObsidianFileHelper;
  frontmatterHelper: FrontmatterHelper;
  goalHistoryHelper: GoalHistoryHelper;
  noteGoalHelper: GoalHelper;
  goalLeaves: string[];

  async onload() {
    this.settings = Object.assign(new WritingGoalsSettings(), await this.loadData());
    this.fileHelper = new ObsidianFileHelper(this.settings);
    this.frontmatterHelper = new FrontmatterHelper(this.app, this.settings);
    this.goalHistoryHelper = new GoalHistoryHelper(this.app, this.settings, this.manifest);
    this.noteGoalHelper = new GoalHelper(this.app, this.settings, this.goalHistoryHelper);
    this.goalLeaves = this.settings.goalLeaves.map(x => x).reverse();
    this.fileLabels = new FileLabels(this.app, this.settings);
    this.settings.migrateSettings();
    this.saveData(this.settings);
    this.setupCommands();
    addIcon(GOAL_ICON, GOAL_ICON_SVG);
    this.registerViews();
    this.addSettingTab(new WritingGoalsSettingsTab(this.app, this));
    this.setupEvents();
  }

  async onunload() {
    this.fileLabels.resetAllFileLabels();
  }

  private registerViews() {
    this.registerView(
      VIEW_TYPE_GOAL,
      (leaf) => this.goalView = new GoalView(leaf, this, this.goalHistoryHelper)
    );

    this.registerView(
      VIEW_TYPE_STATS_DETAIL,
      (leaf) => new StatsDetaillView(leaf, this, this.goalHistoryHelper)
    );

    this.registerView(
      VIEW_TYPE_GOAL_SPRINT,
      (leaf) => new SprintGoalView(leaf, this, this.goalHistoryHelper)
    );
  }

  setupCommands() {
    this.addCommand({
      id: "view-writing-goal-for-note",
      name: "View writing goal for the current note",
      callback: async () => {
        await this.frontmatterHelper.updateNoteGoalsFromFrontmatter(this, this.app.workspace.getActiveFile());
        if (this.settings.showGoalOnCreateAndUpdate) {
          this.initLeaf(this.app.workspace.getActiveFile().path);
        }
      },
      hotkeys: []
    });

    this.addCommand({
      id: "view-writing-goal",
      name: "View writing goal for any note or folder",
      callback: async () => {
        new GoalTargetModal(this, null).open();
      },
      hotkeys: []
    });

    this.addCommand({
      id: 'view-writing-sprint-goal-for-note',
      name: 'View writing sprint goal for the current note',
      callback: async () => {
        const file = this.app.workspace.getActiveFile();
        const goalLeaf = this.app.workspace.getRightLeaf(false);
        await goalLeaf.setViewState({
          type: VIEW_TYPE_GOAL_SPRINT,
          active: true
        });
        // try {
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_GOAL_SPRINT);
        const view = leaves.last().view as SprintGoalView;
        await view.updatePath(file.path);
        // } catch (error) {
        //   new Notice("Failed to show goal for " + file.path);
        // }
      },
      hotkeys: []
    });

    this.addCommand({
      id: "add-writing-goal",
      name: "Add or update a writing goal for a note or folder",
      callback: async () => {
        new GoalTargetModal(this, new GoalModal(this, this.goalHistoryHelper)).open();
      },
      hotkeys: []
    });

    this.addCommand({
      id: "view-writing-goal-stats",
      name: "View all your writing goal stats",
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
      if (file instanceof TFolder) {
        return;
      }
      await this.frontmatterHelper.updateNoteGoalsFromFrontmatter(this, file as TFile)
      await this.loadNoteGoalData(false);
    }));

    this.registerEvent(this.app.metadataCache.on("changed", async file => {
      if (file instanceof TFolder) {
        return;
      }
      await this.frontmatterHelper.updateNoteGoalsFromFrontmatter(this, file as TFile);
      await this.loadNoteGoalData(true);
    }));

    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        if (this.settings.noGoal(file.path)) {
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
        if (this.settings.noGoal(fileOrFolder.path)) {
          return;
        }
        menu.addItem((item) => {
          item
            .setTitle("Remove writing goal")
            .setIcon(REMOVE_GOAL_ICON)
            .onClick(async () => {
              this.settings.removeGoal(fileOrFolder);
              await this.saveData(this.settings);
              await this.frontmatterHelper.removeFrontmatter(fileOrFolder);
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

    this.app.workspace.onLayoutReady((async () => {
      this.goalLeaves = this.settings.goalLeaves.map(x => x);
      this.initialFrontmatterGoalIndex();
    }));

    this.registerInterval(
      window.setInterval(() => {
        const goalLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_GOAL);
        const updatedLeaves = goalLeaves.map(gl => (gl.view as GoalView).path);
        const match = this.settings.goalLeaves.length == updatedLeaves.length && this.settings.goalLeaves.every((v, i) => v == updatedLeaves[i]);
        if (!match) {
          this.settings.goalLeaves = updatedLeaves;
          this.saveData(this.settings);
        }
      }, 5000)
    );
  }

  async initialFrontmatterGoalIndex() {
    const files = this.app.vault.getMarkdownFiles();
    files.forEach(async (file) => {
      await this.frontmatterHelper.updateNoteGoalsFromFrontmatter(this, file);
    });
    this.loadNoteGoalData(true);
  }

  async openGoalModal(fileOrFolder: TAbstractFile, openGoalOnSubmit?: boolean) {
    const modal = new GoalModal(this, this.goalHistoryHelper);
    modal.init(this, fileOrFolder, openGoalOnSubmit);
    modal.open();
  }

  async initLeaf(path: string) {
    if (this.settings.showSingleGoalView) {
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
    leaves.forEach(l => {
      if ((l.view as GoalView).path == path) {
        l.detach();
      }
    });
  }

  async loadNoteGoalData(requiresGoalLabelUpdate?: boolean, pathForLabel?: string) {
    await this.noteGoalHelper.updateGoalsFromSettings();
    if (requiresGoalLabelUpdate) {
      this.fileLabels.initFileLabels(pathForLabel);
    }
  }
}