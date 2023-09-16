import {
  App,
  HSL,
  Notice,
  PluginSettingTab,
  Setting
} from "obsidian";
import type WritingGoals from "../../main";
import { FileLabels } from "../../UI/goal/file-labels";
import { wgcolors, showGoalMessage, showProgressChart } from "../../UI/stores/goal-store";
import { DAILY_GOAL_BAR_COLOR, DAILY_GOAL_FRONTMATTER_KEY, GOAL_BACKGROUND_COLOR, GOAL_BAR_COLOR, GOAL_BAR_COLOR_HSL, GOAL_FRONTMATTER_KEY, GOAL_SUCCESS_COLOR, GOAL_TEXT_COLOR, VIEW_TYPE_GOAL } from "../constants";
import { WritingGoalColors } from "./colors";

export class WritingGoalsSettingsTab extends PluginSettingTab {
  plugin: WritingGoals;
  fileLabels: FileLabels;
  colorSetting: Setting;
  dailyColorSetting: Setting;
  textColorSetting: Setting;
  backgroundColorSetting: Setting;
  successColorSetting: Setting;

  constructor(app: App, plugin: WritingGoals) {
    super(app, plugin);
    this.plugin = plugin;
    this.fileLabels = new FileLabels(this.app, this.plugin.settings);
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Display settings")
      .setHeading();

    new Setting(containerEl)
      .setName("Display goals in file explorer")
      .setDesc("Display note and folder goals in the file explorer")
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.showInFileExplorer)
          .onChange(async (value: boolean) => {
            this.plugin.settings.showInFileExplorer = value;
            await this.plugin.saveData(this.plugin.settings);
            this.fileLabels.initFileLabels();
          }));

    new Setting(containerEl)
      .setName("Display goal message")
      .setDesc("Display a summary message below the progress for the current goal")
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.showGoalMessage)
          .onChange(async (value: boolean) => {
            this.plugin.settings.showGoalMessage = value;
            await this.plugin.saveData(this.plugin.settings);
            showGoalMessage.set(value);
          }));

    new Setting(containerEl)
      .setName("Display goal stats")
      .setDesc("Display a bar chart for goal history below the progress for the current goal")
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.showProgressChart)
          .onChange(async (value: boolean) => {
            this.plugin.settings.showProgressChart = value;
            await this.plugin.saveData(this.plugin.settings);
            showProgressChart.set(value);
          }));

    new Setting(containerEl)
      .setName("Display single goal view")
      .setDesc("Disaply a single view for the goal progress. This setting should be enabled on mobile devices with small screens.")
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.showSingleGoalView)
          .onChange(async (value: boolean) => {
            this.plugin.settings.showSingleGoalView = value;
            await this.plugin.saveData(this.plugin.settings);
            const moreThanOneGoalLeaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_GOAL).length > 1;
            const firstOpenGoalLeafPath = this.plugin.settings.goalLeaves[0];
            if (moreThanOneGoalLeaf && firstOpenGoalLeafPath) {
              this.plugin.initLeaf(firstOpenGoalLeafPath);
            }
          }));

    new Setting(containerEl)
      .setName("Display goal on create")
      .setDesc("Display the goal progress view when you create or update the goal")
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.showGoalOnCreateAndUpdate)
          .onChange(async (value: boolean) => {
            this.plugin.settings.showGoalOnCreateAndUpdate = value;
            await this.plugin.saveData(this.plugin.settings);
          }));

    new Setting(containerEl)
      .setName("Allow negative daily goal progress")
      .setDesc("Negative daily progress counts will be displayed if less words are in a note or under a folder than at the start of the day")
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.allowNegativeGoalProgress)
          .onChange(async (value: boolean) => {
            this.plugin.settings.allowNegativeGoalProgress = value;
            await this.plugin.saveData(this.plugin.settings);
            this.plugin.loadNoteGoalData();
          }));

    new Setting(containerEl)
      .setName("File settings")
      .setHeading();

    new Setting(containerEl)
      .setName("Additional file types")
      .setDesc("Markdown files are included in word counts by default. Add other file types to include in word counts. Comma delimited with only file extension")
      .addButton(button =>
        button
          .setButtonText("Reindex")
          .setCta()
          .onClick(async evt => {
            new Notice("Starting writing goals reindexing", 5000);
            await this.plugin.loadNoteGoalData(true);
            new Notice("Writing goals reindexed", 5000);
          }))
      .addTextArea(text =>
        text
          .setValue(this.plugin.settings.additionalFileTypes?.join(","))
          .setPlaceholder("md,")
          .onChange(async (value: string) => {
            this.plugin.settings.additionalFileTypes =
              value.split(",").map(v => v.trim()).filter(v => v && v.length > 0);
            await this.plugin.saveData(this.plugin.settings);
          }));

    new Setting(containerEl)
      .setName("Exclude comments")
      .setDesc("Exclude markdown (%% %%) and HTML (<!-- -->) comments when counting words")
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.excludeComments)
          .onChange(async (value: boolean) => {
            this.plugin.settings.excludeComments = value;
            await this.plugin.saveData(this.plugin.settings);
          }));

    new Setting(containerEl)
      .setName("Goal frontmatter property name")
      .setDesc("The name for the frontmatter property to use for note goals (changing this setting will not update existing frontmatter)")
      .addText(text =>
        text
          .setValue(this.plugin.settings.customGoalFrontmatterKey)
          .onChange(async (value: string) => {
            value = value != "" ? value : GOAL_FRONTMATTER_KEY;
            this.plugin.settings.customGoalFrontmatterKey = value;
            await this.plugin.saveData(this.plugin.settings);
          }));

    new Setting(containerEl)
      .setName("Daily goal frontmatter property name")
      .setDesc("The name for the frontmatter property to use for daily note goals (changing this setting will not update existing frontmatter)")
      .addText(text =>
        text
          .setValue(this.plugin.settings.customDailyGoalFrontmatterKey)
          .onChange(async (value: string) => {
            value = value != "" ? value : DAILY_GOAL_FRONTMATTER_KEY;
            this.plugin.settings.customDailyGoalFrontmatterKey = value;
            await this.plugin.saveData(this.plugin.settings);
          }));

    new Setting(containerEl)
      .setName("Colors")
      .setHeading();

    const customColorsSettings = new Setting(containerEl)
      .setName("Enable custom colors")
      .setDesc("Enable custom colors to be used for goal progress")
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.enableCustomColors)
          .onChange(async (value: boolean) => {
            this.plugin.settings.enableCustomColors = value;
            if (!this.plugin.settings.enableCustomColors) {
              this.plugin.settings.customColors = new WritingGoalColors();
            }
            this.displayCustomColorPickers(containerEl);
            await this.plugin.saveData(this.plugin.settings);
          }));

    this.displayCustomColorPickers(containerEl);
  }

  displayCustomColorPickers(containerEl) {
    if (this.plugin.settings.enableCustomColors) {
      this.colorSetting = new Setting(containerEl)
        .setName("Goal progress bar color")
        .setDesc("Set a custom color for the goal progress bar")
        .addColorPicker(color => 
          color
            .setValue(this.plugin.settings.customColors.goalColor)
            .setValueHsl(this.plugin.settings.customColors.goalColor.startsWith("var") ? GOAL_BAR_COLOR_HSL : color.getValueHsl())
            .onChange(async (value: string) => {
              const defaultColor = GOAL_BAR_COLOR;
              value = value != "" ? value : defaultColor;
              this.plugin.settings.customColors.goalColor = value;
              this.updateColors();
            }));

      this.dailyColorSetting = new Setting(containerEl)
        .setName("Daily goal progress bar color")
        .setDesc("Set a custom color for the daily goal progress bar")
        .addColorPicker(color =>
          color
            .setValue(this.getColor(this.plugin.settings.customColors.dailyGoalColor))
            .onChange(async (value: string) => {
              const defaultColor = DAILY_GOAL_BAR_COLOR;
              value = value != "" ? value : defaultColor;
              this.plugin.settings.customColors.dailyGoalColor = value;
              this.updateColors();
            }));

      this.textColorSetting = new Setting(containerEl)
        .setName("Goal progress text color")
        .setDesc("Set a custom color for the text on the goal progress graphic")
        .addColorPicker(color =>
          color
            .setValue(this.getColor(this.plugin.settings.customColors.textColor))
            .onChange(async (value: string) => {
              const defaultColor = GOAL_TEXT_COLOR;
              value = value != "" ? value : defaultColor;
              this.plugin.settings.customColors.textColor = value;
              this.updateColors();
            }));

      this.backgroundColorSetting = new Setting(containerEl)
        .setName("Goal progress background color")
        .setDesc("Set a custom color for the background of the goal progress graphic")
        .addColorPicker(color =>
          color
            .setValue(this.getColor(this.plugin.settings.customColors.backgroundColor))
            .onChange(async (value: string) => {
              const defaultColor = GOAL_BACKGROUND_COLOR;
              value = value != "" ? value : defaultColor;
              this.plugin.settings.customColors.backgroundColor = value;
              this.updateColors();
            }));

      this.successColorSetting = new Setting(containerEl)
        .setName("Completed goal progress color")
        .setDesc("Set a custom color for the background the goal progress graphic when the goal is completed")
        .addColorPicker(color =>
          color
            .setValue(this.getColor(this.plugin.settings.customColors.successColor))
            .onChange(async (value: string) => {
              const defaultColor = GOAL_SUCCESS_COLOR;
              value = value != "" ? value : defaultColor;
              this.plugin.settings.customColors.successColor = value;
              this.updateColors();
            }));
    } else {
      [
        this.colorSetting,
        this.dailyColorSetting,
        this.textColorSetting,
        this.backgroundColorSetting,
        this.successColorSetting
      ].forEach(s => s?.settingEl.remove());
      this.updateColors();
    }
  }

  getHSLColor(cssVar: string): HSL {
    return cssVar.startsWith("#") ? {h:0,s:0,l:0} : GOAL_BAR_COLOR_HSL;
  }

  getColor(cssVar: string) {
    const regex = new RegExp(/var\(?(.+)\)/, "gi");
    const val = cssVar.startsWith("var") ? regex.exec(cssVar)[1] : cssVar;
    return window.document.body.getCssPropertyValue(val);
  }

  updateColors() {
    const customColors = this.plugin.settings.customColors;
    this.plugin.saveData(this.plugin.settings);
    wgcolors.set(customColors);
  }
}