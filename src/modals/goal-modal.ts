import { App, Modal, Setting, TAbstractFile, TFile, TFolder } from "obsidian";
import  { getGoalCount } from "../note-goal";
import type WritingGoals from "../main";
import { SettingsHelper } from "../settings/settings-helper";

export default class GoalModal extends Modal {
    userSubmittedGoalCount: string;
    settingsHelper: SettingsHelper;
    constructor(app: App) {
        super(app);
        this.settingsHelper = new SettingsHelper();
    }

    plugin: WritingGoals;
    target: TAbstractFile;

    init(plugin:WritingGoals, target: TAbstractFile){
        this.plugin = plugin;
        this.target = target;
    }

    onOpen() {
        const { contentEl } = this;
    
        contentEl.createEl("h2", { text: "Set your writing goal" });
    
        let goalCount:any = 0;
        if(this.target instanceof TFile){
          goalCount = getGoalCount(this.app, this.plugin.settings.customGoalFrontmatterKey, this.target);
        } else {
          const folderGoal = this.plugin.settings.getFolderGoal(this.target.path);
          if(folderGoal != null){
            goalCount = folderGoal.goalCount
          }
        }
        const goalSetting = new Setting(contentEl)
          .setName("Writing goal (number)")
          .addText((text) =>
            text.onChange((value) => {
              this.userSubmittedGoalCount = value
            })
            .setValue(goalCount)
            .inputEl.value = goalCount);
    
        new Setting(contentEl)
          .addButton((btn) =>
            btn
              .setButtonText("Save goal")
              .setCta()
              .onClick(() => {
                this.close();
                this.onSubmit();
              }));
      }

      onSubmit() {
        this.createGoalForTarget();
        if(this.plugin.settings.showGoalOnCreateAndUpdate){
          this.plugin.initLeaf(this.target.path);
        }
        this.plugin.loadNoteGoalData();
      }

      async createGoalForTarget() {
        const plugin = this.plugin;
        const settings = plugin.settings;
        const target = this.target;
        const goalCount:number = +this.userSubmittedGoalCount; 
        
        if(target instanceof TFolder){
            settings.folderGoals.filter(fg => fg.path != target.path);
            settings.folderGoals.push({path:target.path, goalCount:goalCount as any as number});
            settings.folderGoals = [...new Set(plugin.settings.folderGoals)];
            await plugin.saveData(settings);
        }
        if(target instanceof TFile){
            this.settingsHelper.updateNoteGoalsInSettings(this.plugin, target)
            await plugin.app.fileManager.processFrontMatter(target as TFile, (frontMatter) => {
                frontMatter[settings.customGoalFrontmatterKey] = goalCount as any as number;
            });
        }
    }

}