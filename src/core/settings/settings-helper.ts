import type { App, TFile } from "obsidian";
import type WritingGoals from "../../main";

export class SettingsHelper {

  async updateNoteGoalsInSettings(plugin:WritingGoals, file:TFile): Promise<boolean> {
      const metadata = plugin.app.metadataCache.getCache(file.path);
      const wordGoal = metadata && metadata.frontmatter 
                    && metadata.frontmatter[plugin.settings.customGoalFrontmatterKey];
      const dailWwordGoal = metadata && metadata.frontmatter 
                    && metadata.frontmatter[plugin.settings.customDailyGoalFrontmatterKey];
      const exists = plugin.settings.noteGoals.contains(file.path);
      plugin.settings.noteGoals = [...new Set(plugin.settings.noteGoals)];
      if(exists) {
        if(!wordGoal && !dailWwordGoal) {
          plugin.settings.noteGoals = plugin.settings.noteGoals.filter(ng => ng != file.path);
          await plugin.saveData(plugin.settings);
        }
      } else if(wordGoal || dailWwordGoal) {
        plugin.settings.noteGoals.push(file.path);
        await plugin.saveData(plugin.settings);
      }
      // Returns true when frontmatter causes a change to a goal
      return ((wordGoal || dailWwordGoal) && !exists) || (!wordGoal && !dailWwordGoal && exists);
    }
  
}