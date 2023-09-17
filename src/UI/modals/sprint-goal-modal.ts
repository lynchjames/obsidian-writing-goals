import { Modal, Setting, TAbstractFile } from "obsidian";
import type WritingGoals from "../../main";
import type { WritingGoalsSettings } from "../../core/settings/settings";
import { SprintGoalHelper } from "../../core/sprint-goal-helper";

export default class SprintGoalModal extends Modal {
  plugin: WritingGoals;
  settings: WritingGoalsSettings;
  sprintGoalCount: number;
  sprintMinutes: number;
  userSubmittedSprintGoalCount: string = "0"
  userSubmittedSprintMinutes: string = "0";
  sprintGoalHelper: SprintGoalHelper;


  constructor(plugin: WritingGoals, sprintGoalHelper: SprintGoalHelper) {
    super(plugin.app);
    this.plugin = plugin;
    this.sprintGoalHelper = sprintGoalHelper;
  }

  target: TAbstractFile;

  init(target: TAbstractFile) {
    this.target = target;
  }

  async onOpen() {
    const { contentEl } = this;
    const sprintGoal = await this.setup();
    await this.addSettings(contentEl, sprintGoal.sprintGoalCount, sprintGoal.sprintMinutes);
  }

  private async setup() {
    const sprintGoal = await this.sprintGoalHelper.getSprintGoal(this.target);
    this.userSubmittedSprintGoalCount = sprintGoal.sprintGoalCount.toString();
    this.userSubmittedSprintMinutes = sprintGoal.sprintMinutes.toString();
    return sprintGoal;
  }

  private async addSettings(contentEl: HTMLElement, sprintGoalCount: any, sprintMinutes: any) {
    contentEl.createEl("h2", { text: "Set your sprint goal" });

    const sprintGoalSetting = new Setting(contentEl)
      .setName("Sprint word goal (number)")
      .addText((text) => text.onChange((value) => {
        this.userSubmittedSprintGoalCount = value;
      })
        .setValue(sprintGoalCount.toString()));

    const springMinutesSetting = new Setting(contentEl)
      .setName("Sprint length (minutes)")
      .addText((text) => text.onChange((value) => {
        this.userSubmittedSprintMinutes = value;
      })
        .setValue(sprintMinutes.toString()));

    const saveButton = new Setting(contentEl)
      .addButton((btn) => btn.setButtonText("Save")
        .setCta()
        .onClick(() => {
          this.close();
          this.onSubmit();
        }));
  }

  async onSubmit() {
    await this.sprintGoalHelper.createSprintGoal(this.target.path,
      this.userSubmittedSprintGoalCount as any as number,
      this.userSubmittedSprintMinutes as any as number);
  }
}