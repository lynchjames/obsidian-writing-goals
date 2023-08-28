import type { TFile } from "obsidian";
import type WritingGoals from "../main";

export class SettingsHelper {

async updateNoteGoalsInSettings(plugin:WritingGoals, file:TFile) {
    const metadata = plugin.app.metadataCache.getCache(file.path);
    const wordGoal = metadata && metadata.frontmatter 
                  && metadata.frontmatter[plugin.settings.customGoalFrontmatterKey];
    const exists = plugin.settings.noteGoals.contains(file.path);
    plugin.settings.noteGoals = [...new Set(plugin.settings.noteGoals)];
    if(exists) {
      if(!wordGoal) {
        plugin.settings.noteGoals = plugin.settings.noteGoals.filter(ng => ng != file.path);
        await plugin.saveData(plugin.settings);
      }
    } else if(wordGoal) {
      plugin.settings.noteGoals.push(file.path);
      await plugin.saveData(plugin.settings);
    }
    return wordGoal;
  }
  
}