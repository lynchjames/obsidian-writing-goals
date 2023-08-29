import { App, Modal, Setting, TAbstractFile, TFile, TFolder } from "obsidian";
import  { NoteGoalHelper } from "../note-goal";
import type WritingGoals from "../main";
import { SettingsHelper } from "../settings/settings-helper";
import { GoalHistoryHelper } from "../goal-history/history";

export default class GoalModal extends Modal {
    userSubmittedGoalCount: string = "0"
    userSubmittedDailyGoalCount: string = "0";
    settingsHelper: SettingsHelper;
    goalHistoryHelper: GoalHistoryHelper;
    noteGoalHelper: NoteGoalHelper;
    
    constructor(app: App, goalHistoryHelper:GoalHistoryHelper) {
        super(app);
        this.settingsHelper = new SettingsHelper();
        this.goalHistoryHelper = goalHistoryHelper;
        this.noteGoalHelper = new NoteGoalHelper(this.app, this.goalHistoryHelper);
        this.goalHistoryHelper = new GoalHistoryHelper(this.app);
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
        let dailyGoalCount:any = 0;
        if(this.target instanceof TFile){
          goalCount = this.noteGoalHelper.getGoalCount(this.plugin.settings.customGoalFrontmatterKey, this.target);
          dailyGoalCount = this.noteGoalHelper.getGoalCount(this.plugin.settings.customDailyGoalFrontmatterKey, this.target);
        } else {
          const folderGoal = this.plugin.settings.getFolderGoal(this.target.path);
          if(folderGoal != null){
            goalCount = folderGoal.goalCount;
            dailyGoalCount = folderGoal.dailyGoalCount;
          }
        }
        this.userSubmittedDailyGoalCount = dailyGoalCount;
        this.userSubmittedGoalCount = goalCount;
        const goalSetting = new Setting(contentEl)
          .setName("Writing goal (number)")
          .addText((text) =>
            text.onChange((value) => {
              this.userSubmittedGoalCount = value
            })
            .setValue(goalCount.toString()));

        const dailyGoalSetting = new Setting(contentEl)
          .setName("Daily writing goal (number)")
          .addText((text) =>
            text.onChange((value) => {
              this.userSubmittedDailyGoalCount = value;
            })
            .setValue(dailyGoalCount.toString()));

        const button = new Setting(contentEl)
          .addButton((btn) =>
            btn.setButtonText("Save goal")
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
        const dailyGoalCount:number = +this.userSubmittedDailyGoalCount; 
        
        if(target instanceof TFolder){
            settings.folderGoals.filter(fg => fg.path != target.path);
            settings.folderGoals.push({path:target.path, goalCount:goalCount, dailyGoalCount:dailyGoalCount});
            settings.folderGoals = [...new Set(plugin.settings.folderGoals)];
            await plugin.saveData(settings);
        }
        if(target instanceof TFile){
            this.settingsHelper.updateNoteGoalsInSettings(this.plugin, target)
            await plugin.app.fileManager.processFrontMatter(target as TFile, (frontMatter) => {
                if(goalCount > 0){
                  frontMatter[settings.customGoalFrontmatterKey] = goalCount;
                }
                if(dailyGoalCount > 0) {
                  frontMatter[settings.customDailyGoalFrontmatterKey] = dailyGoalCount;
                }
            });
        }
        const wordCount = await this.noteGoalHelper.getWordCount(target);
        this.goalHistoryHelper.saveGoalForToday(target.path, {dailyGoal:dailyGoalCount, goal:goalCount, startCount:wordCount, endCount:wordCount})
    }

}