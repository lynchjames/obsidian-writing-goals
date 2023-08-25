import type { TFile } from "obsidian";
import type WritingGoals from "../main";
import { GOAL_FRONTMATTER_KEY } from "../constants";

export class SettingsHelper {

async updateNoteGoalsInSettings(plugin:WritingGoals, file:TFile) {
    const metadata = plugin.app.metadataCache.getCache(file.path);
    const wordGoal = metadata && metadata.frontmatter && metadata.frontmatter[GOAL_FRONTMATTER_KEY];
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