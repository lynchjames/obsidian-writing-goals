import { App, Modal, Setting, TAbstractFile, TFile, TFolder } from "obsidian";
import  { NoteGoalHelper } from "../note-goal";
import type WritingGoals from "../main";
import { SettingsHelper } from "../settings/settings-helper";
import { GoalHistoryHelper } from "../goal-history/history";
import type { WritingGoalsSettings } from "../settings/settings";

export default class GoalModal extends Modal {
    settings: WritingGoalsSettings;
    userSubmittedGoalCount: string = "0"
    userSubmittedDailyGoalCount: string = "0";
    settingsHelper: SettingsHelper;
    goalHistoryHelper: GoalHistoryHelper;
    noteGoalHelper: NoteGoalHelper;
    openGoalOnSubmit: boolean = false;
    
    constructor(app: App, settings:WritingGoalsSettings, goalHistoryHelper:GoalHistoryHelper) {
        super(app);
        this.settings = settings;
        this.settingsHelper = new SettingsHelper();
        this.goalHistoryHelper = goalHistoryHelper;
        this.noteGoalHelper = new NoteGoalHelper(this.app, this.settings, this.goalHistoryHelper);
        this.goalHistoryHelper = new GoalHistoryHelper(this.app, this.settings);
    }

    plugin: WritingGoals;
    target: TAbstractFile;

    init(plugin:WritingGoals, target: TAbstractFile, openGoalOnSubmit?:boolean){
        this.plugin = plugin;
        this.target = target;
        this.openGoalOnSubmit = openGoalOnSubmit;
    }

    async onOpen() {
        const { contentEl } = this;
    
        contentEl.createEl("h2", { text: "Set your writing goal" });
    
        let goalCount:any = 0;
        let dailyGoalCount:any = 0;
        if(this.target instanceof TFile){
          goalCount = this.noteGoalHelper.getGoalCount(this.settings.customGoalFrontmatterKey, this.target);
          dailyGoalCount = this.noteGoalHelper.getGoalCount(this.settings.customDailyGoalFrontmatterKey, this.target);
        } else {
          const folderGoal = this.settings.getFolderGoal(this.target.path);
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
            
        if(dailyGoalCount > 0){
          const dailyGoalProgress = new Setting(contentEl)
              .setName(await this.dailyGoalProgressText())
              .addButton((btn) =>
                  btn.setButtonText("Reset Daily Progress")
                    .setClass("mod-warning")
                    .onClick(async () => {
                      await this.onResetDailyProgress(dailyGoalProgress);
                      this.plugin.loadNoteGoalData();
                    }))
          }
          const saveButton = new Setting(contentEl)
            .addButton((btn) =>
              btn.setButtonText("Save goal")
                .setCta()
                .onClick(() => {
                  this.close();
                  this.onSubmit();
                }));
      }

      async dailyGoalProgressText() {
        return `Current daily goal progress: ${(await this.calcProgress()).toLocaleString()} words`;
      }

      async calcProgress() {
        const todaysDailyGoalProgress = await this.goalHistoryHelper.todaysGoalItem(this.target.path);
        return todaysDailyGoalProgress.endCount - todaysDailyGoalProgress.startCount;
      }

      async onResetDailyProgress(dailyGoalProgress: Setting) {
        await this.goalHistoryHelper.resetDailyProgress(this.target.path);
        dailyGoalProgress.setName(await this.dailyGoalProgressText());
        await this.plugin.loadNoteGoalData(true);
      }

      async onSubmit() {
        await this.createGoalForTarget();
        if(this.settings.showGoalOnCreateAndUpdate && this.openGoalOnSubmit){
          await this.plugin.initLeaf(this.target.path);
        }
        await this.plugin.loadNoteGoalData(true, this.target.path);
      }

      async createGoalForTarget() {
        const plugin = this.plugin;
        const settings = plugin.settings;
        const target = this.target;
        const goalCount:number = +this.userSubmittedGoalCount; 
        const dailyGoalCount:number = +this.userSubmittedDailyGoalCount; 
        const wordCount = await this.noteGoalHelper.getWordCount(target);
        await this.goalHistoryHelper.updateGoalForToday(target.path, goalCount, dailyGoalCount, wordCount)
        if(target instanceof TFolder){
            settings.folderGoals.filter(fg => fg.path != target.path);
            settings.folderGoals.push({path:target.path, goalCount:goalCount, dailyGoalCount:dailyGoalCount});
            settings.folderGoals = [...new Set(settings.folderGoals)];
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
    }

}