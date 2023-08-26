import {
    App,
    PluginSettingTab,
    Setting
} from 'obsidian';
import type WritingGoals from '../main';
  
  export class WritingGoalsSettingsTab extends PluginSettingTab {
    plugin: WritingGoals;
    constructor(app: App, plugin: WritingGoals) {
      super(app, plugin);
      this.plugin = plugin;
  }
  
    display(): void {
      const { containerEl } = this;
  
      containerEl.empty();

      new Setting(containerEl)
        .setName('Show goal indicators in file explorer')
        .setDesc('The plugin will display folder and note writing goals in the file explorer')
        .addToggle(toggle => 
          toggle
            .setValue(this.plugin.settings.showInFileExplorer)
            .onChange(async (value:boolean) => {
              this.plugin.settings.showInFileExplorer = value;
              await this.plugin.saveData(this.plugin.settings);
              this.plugin.initFileLabels();
            }));
    }

  }