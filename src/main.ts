import {
  Plugin,
  Vault,
} from 'obsidian';

import { WritingGoalsSettings } from './settings/settings';
import { VIEW_TYPE_GOAL } from './constants';
import GoalView from './goal/goal-view';
import { WritingGoalsSettingsTab } from './settings/settings-tab';

export default class WritingGoals extends Plugin {
  settings: WritingGoalsSettings = new WritingGoalsSettings;
  vault: Vault | undefined;
  goalView: GoalView | undefined;
  
  async onload() {
    this.vault = this.app.vault;
    this.settings = Object.assign(new WritingGoalsSettings(), await this.loadData());
    
    this.addCommand({
      id: 'app:add-writing-goal-to-note',
      name: 'Add a writing goal for the current note',
      callback: async () => await this.setWritingGoal(true),
      hotkeys: []
    });
    this.registerView(
      VIEW_TYPE_GOAL,
      (leaf) => new GoalView(leaf, this.settings)
    );
    this.addSettingTab(new WritingGoalsSettingsTab(this.app, this));
    this.registerInterval(
      window.setInterval(async () => {
        try {
          // if(this.file.hasTodayNote()){
          //   // console.log('Active note found, starting file processing')
          //   const planSummary = await this.plannerMD.parseDayPlanner();
          //   planSummary.calculate();
          //   await this.statusBar.refreshStatusBar(planSummary)
          //   await this.plannerMD.updateDayPlannerMarkdown(planSummary)
          //   this.timelineView && this.timelineView.update(planSummary);
          // } else{
          //   // console.log('No active note, skipping file processing')
          // }
        } catch (error) {
            console.log(error)
        }
      }, 2000));
    }



  setWritingGoal(arg0: boolean): any {
    this.initLeaf();
  }

    async initLeaf() {
      this.app.workspace.detachLeavesOfType(VIEW_TYPE_GOAL);

      await this.app.workspace.getRightLeaf(false).setViewState({
        type: VIEW_TYPE_GOAL,
        active: true
      });

      this.app.workspace.revealLeaf(
        this.app.workspace.getLeavesOfType(VIEW_TYPE_GOAL)[0]
      );
    }

    
    onunload() {
      this.app.workspace
      .getLeavesOfType(VIEW_TYPE_GOAL)
      .forEach((leaf) => leaf.detach());
    }
    
  }