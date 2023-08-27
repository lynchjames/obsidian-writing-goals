import { App, Modal, Setting, TAbstractFile, TFile, TFolder } from "obsidian";
import  { getGoalCount } from "../stores/note-goal";
import type WritingGoals from "../main";

export default class GoalModal extends Modal {
    userSubmittedGoalCount: string;
    constructor(app: App) {
        super(app);
    }

    plugin: WritingGoals;
    target: TAbstractFile;


    init(plugin:WritingGoals, target: TAbstractFile){
        this.plugin = plugin;
        this.target = target;
    }

    

    onOpen() {
        const { contentEl } = this;
    
        contentEl.createEl("h1", { text: "What's your goal?" });
    
        const goalCount = getGoalCount(this.app, this.plugin.settings.customGoalFrontmatterKey, this.target);
        new Setting(contentEl)
          .setName("Goal (number)")
          .addText((text) =>
            text.onChange((value) => {
              this.userSubmittedGoalCount = value
            })
            .inputEl.value = this.target instanceof TFolder ? 
              this.plugin.settings.getFolderGoal(this.target.path).goalCount : goalCount);
    
        new Setting(contentEl)
          .addButton((btn) =>
            btn
              .setButtonText("Set goal")
              .setCta()
              .onClick(() => {
                this.close();
                this.onSubmit();
              }));
      }

      onSubmit() {
        this.createGoalForTarget();
        this.plugin.initLeaf(this.target.path);
      }

      async createGoalForTarget() {
        const plugin = this.plugin;
        const settings = plugin.settings;
        const target = this.target;
        const goalCount:number = +this.userSubmittedGoalCount; 
        
        if(target instanceof TFolder){
            settings.folderGoals = settings.folderGoals.filter(fg => fg.path != target.path);
            settings.folderGoals.push({path:target.path, goalCount:goalCount as any as number});
            await plugin.saveData(settings);
        }
        if(target instanceof TFile){
            settings.noteGoals.push(target.path);
            await plugin.app.fileManager.processFrontMatter(target as TFile, (frontMatter) => {
                frontMatter[settings.customGoalFrontmatterKey] = goalCount as any as number;
            });
            await plugin.saveData(settings);
        }
    }

}