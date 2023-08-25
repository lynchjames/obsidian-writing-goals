import { App, Modal, Setting, TAbstractFile, TFile, TFolder } from "obsidian";
import  { getGoalCount } from "../stores/note-goal";
import type WritingGoals from "../main";
import { GOAL_FRONTMATTER_KEY } from "../constants";

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
    
        new Setting(contentEl)
          .setName("Goal (number)")
          .addText((text) =>
            text.onChange((value) => {
              this.userSubmittedGoalCount = value
            })
            .inputEl.value = getGoalCount(this.app, this.target));
    
        new Setting(contentEl)
          .addButton((btn) =>
            btn
              .setButtonText("Submit")
              .setCta()
              .onClick(() => {
                this.close();
                this.onSubmit();
              }));
      }

      onSubmit() {
        this.createGoalForTarget();
      }

      async createGoalForTarget() {
        const plugin = this.plugin;
        const settings = plugin.settings;
        const target = this.target;
        const goalCount:number = +this.userSubmittedGoalCount; 
        
        if(target instanceof TFolder){
            settings.folderGoals = settings.folderGoals.filter(fg => fg.path != target.path);
            settings.folderGoals.push({path:target.path, goalCount:goalCount as any as number});
            plugin.saveData(settings);
        }
        if(target instanceof TFile){
            settings.noteGoals.push(target.path);
            await plugin.app.fileManager.processFrontMatter(target as TFile, (frontMatter) => {
                frontMatter[GOAL_FRONTMATTER_KEY] = goalCount as any as number;
            });
            plugin.saveData(settings);
        }
        plugin.loadNoteGoalData();
    }

}