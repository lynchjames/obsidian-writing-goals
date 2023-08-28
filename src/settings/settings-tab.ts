import {
    App,
    PluginSettingTab,
    Setting
} from 'obsidian';
import type WritingGoals from '../main';
import { FileLabels } from '../goal/file-labels';
import { showGoalMessage } from '../stores/goal-store';
import { GOAL_FRONTMATTER_KEY, VIEW_TYPE_GOAL } from '../constants';
  
  export class WritingGoalsSettingsTab extends PluginSettingTab {
    plugin: WritingGoals;
    fileLabels: FileLabels;
    
    constructor(app: App, plugin: WritingGoals) {
      super(app, plugin);
      this.plugin = plugin;
      this.fileLabels = new FileLabels(this.app, this.plugin.settings);
    }

    display(): void {
      const { containerEl } = this;
  
      containerEl.empty();
      new Setting(containerEl)
        .setName('Display goals in file explorer')
        .setDesc('The plugin will display note and folder goals in the file explorer')
        .addToggle(toggle => 
          toggle
            .setValue(this.plugin.settings.showInFileExplorer)
            .onChange(async (value:boolean) => {
              this.plugin.settings.showInFileExplorer = value;
              await this.plugin.saveData(this.plugin.settings);
              this.fileLabels.initFileLabels();
            }));

      new Setting(containerEl)
        .setName('Display goal message')
        .setDesc('The plugin will display a message below the progress including the current goal')
        .addToggle(toggle => 
          toggle
            .setValue(this.plugin.settings.showGoalMessage)
            .onChange(async (value:boolean) => {
              this.plugin.settings.showGoalMessage = value;
              await this.plugin.saveData(this.plugin.settings);
              showGoalMessage.set(value);
            }));

      new Setting(containerEl)
        .setName('Display single goal view')
        .setDesc('The plugin will always display a single view for the goal progress. This setting should be enabled on mobile devices with small screens.')
        .addToggle(toggle => 
          toggle
            .setValue(this.plugin.settings.showSingleGoalView)
            .onChange(async (value:boolean) => {
              this.plugin.settings.showSingleGoalView = value;
              await this.plugin.saveData(this.plugin.settings);
              const moreThanOneGoalLeaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_GOAL).length > 1;
              const firstOpenGoalLeafPath = this.plugin.settings.goalLeaves[0];
              if(moreThanOneGoalLeaf && firstOpenGoalLeafPath){
                this.plugin.initLeaf(firstOpenGoalLeafPath);
              }
            }));

      new Setting(containerEl)
      .setName('Frontmatter property name')
      .setDesc('The name for the frontmatter property to use for note goals (changing this setting will not update existing frontmatter)')
      .addText(text => 
        text
          .setValue(this.plugin.settings.customGoalFrontmatterKey)
          .onChange(async (value:string) => {
            value = value != '' ? value : GOAL_FRONTMATTER_KEY;
            this.plugin.settings.customGoalFrontmatterKey = value;
            await this.plugin.saveData(this.plugin.settings);
          }));

      new Setting(containerEl)
      .setName('Display goal on create')
      .setDesc('The plugin will display the goal progress when you create or update it')
      .addToggle(toggle => 
        toggle
          .setValue(this.plugin.settings.showGoalOnCreateAndUpdate)
          .onChange(async (value:boolean) => {
            this.plugin.settings.showGoalOnCreateAndUpdate = value;
            await this.plugin.saveData(this.plugin.settings);
          }));
    }
  }