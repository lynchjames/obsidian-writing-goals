import type { TFile } from "obsidian";
import type WritingGoals from "../main";

export class SettingsHelper {

async updateNoteGoalsInSettings(plugin:WritingGoals, file:TFile) {
    const metadata = plugin.app.metadataCache.getCache(file.path);
    const wordGoal = metadata && metadata.frontmatter 
                  && metadata.frontmatter[plugin.settings.customGoalFrontmatterKey];
    const exists = plugin.settings.noteGoals.contains(file.path);
    if(!wordGoal && exists) {
      plugin.settings.noteGoals.remove(file.path);
      await plugin.saveData(plugin.settings);
    } 
    if(wordGoal && !exists) {
      plugin.settings.noteGoals.push(file.path);
      await plugin.saveData(plugin.settings);
    }
    return wordGoal;
  }
  
}