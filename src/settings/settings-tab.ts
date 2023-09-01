import {
    App,
    PluginSettingTab,
    Setting
} from 'obsidian';
import type WritingGoals from '../main';
import { FileLabels } from '../goal/file-labels';
import { showGoalMessage } from '../stores/goal-store';
import { DAILY_GOAL_FRONTMATTER_KEY, GOAL_FRONTMATTER_KEY, VIEW_TYPE_GOAL } from '../constants';
  
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
        .setDesc('Display note and folder goals in the file explorer')
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
        .setDesc('Display a message below the progress including the current goal')
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
        .setDesc('Disaply a single view for the goal progress. This setting should be enabled on mobile devices with small screens.')
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
      .setName('Display goal on create')
      .setDesc('Display the goal progress view when you create or update the goal')
      .addToggle(toggle => 
        toggle
          .setValue(this.plugin.settings.showGoalOnCreateAndUpdate)
          .onChange(async (value:boolean) => {
            this.plugin.settings.showGoalOnCreateAndUpdate = value;
            await this.plugin.saveData(this.plugin.settings);
          }));

      new Setting(containerEl)
        .setName('Allow negative daily goal progress')
        .setDesc('Negative daily progress counts will be displayed if less words are in a note or under a folder than at the start of the day')
        .addToggle(toggle => 
          toggle
            .setValue(this.plugin.settings.allowNegativeGoalProgress)
            .onChange(async (value:boolean) => {
              this.plugin.settings.allowNegativeGoalProgress = value;
              await this.plugin.saveData(this.plugin.settings);
              this.plugin.loadNoteGoalData();
            }));

      new Setting(containerEl)
      .setName('Exclude comments')
      .setDesc('Exclude markdown (%% %%) and HTML (<!-- --!>) comments when counting words')
      .addToggle(toggle => 
        toggle
          .setValue(this.plugin.settings.excludeComments)
          .onChange(async (value:boolean) => {
            this.plugin.settings.excludeComments = value;
            await this.plugin.saveData(this.plugin.settings);
          }));

      new Setting(containerEl)
      .setName('Goal frontmatter property name')
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
      .setName('Daily goal frontmatter property name')
      .setDesc('The name for the frontmatter property to use for daily note goals (changing this setting will not update existing frontmatter)')
      .addText(text => 
        text
          .setValue(this.plugin.settings.customDailyGoalFrontmatterKey)
          .onChange(async (value:string) => {
            value = value != '' ? value : DAILY_GOAL_FRONTMATTER_KEY;
            this.plugin.settings.customDailyGoalFrontmatterKey = value;
            await this.plugin.saveData(this.plugin.settings);
          }));

 
    }
  }