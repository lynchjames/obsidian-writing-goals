import { TFolder, type App, TFile, TAbstractFile, Notice } from "obsidian";
import type WritingGoals from "../main";
import { WritingGoalsSettings } from "../core/settings/settings";

export class FrontmatterHelper {
  app: App;
  settings: WritingGoalsSettings;

  constructor(app: App, settings: WritingGoalsSettings) {
    this.app = app;
    this.settings = settings;
  }

  get(key: string, path: string) {
    const file = this.app.vault.getAbstractFileByPath(path);
    if (file == null || file instanceof TFolder) {
      return undefined;
    }
    const metadata = this.app.metadataCache.getFileCache(file as TFile);
    if (metadata == null || metadata.frontmatter == null) {
      return undefined;
    }
    const value = metadata.frontmatter[key];
    return value;
  }

  async updateNoteGoalsFromFrontmatter(plugin: WritingGoals, file: TFile): Promise<boolean> {
    const metadata = plugin.app.metadataCache.getCache(file.path);
    const wordGoal = metadata && metadata.frontmatter && metadata.frontmatter[plugin.settings.customGoalFrontmatterKey];
    const dailWwordGoal = metadata && metadata.frontmatter && metadata.frontmatter[plugin.settings.customDailyGoalFrontmatterKey];
    const exists = plugin.settings.noteGoals.contains(file.path);
    plugin.settings.noteGoals = [...new Set(plugin.settings.noteGoals)];
    if (exists) {
      if (!wordGoal && !dailWwordGoal) {
        plugin.settings.noteGoals = plugin.settings.noteGoals.filter(ng => ng != file.path);
        await plugin.saveData(plugin.settings);
      }
    } else if (wordGoal || dailWwordGoal) {
      plugin.settings.noteGoals.push(file.path);
      await plugin.saveData(plugin.settings);
    }
    // Returns true when frontmatter causes a change to a goal
    return ((wordGoal || dailWwordGoal) && !exists) || (!wordGoal && !dailWwordGoal && exists);
  }

  async removeFrontmatter(fileOrFolder: TAbstractFile) {
    if (fileOrFolder instanceof TFile) {
      const file = fileOrFolder as TFile;
      await this.app.fileManager.processFrontMatter(file as TFile, (frontMatter) => {
        try {
          delete frontMatter[this.settings.customGoalFrontmatterKey];
          delete frontMatter[this.settings.customDailyGoalFrontmatterKey];
        } catch (error) {
          new Notice("Error removing goal frontmatter for " + file.name);
        }
      });
    }
  }
}