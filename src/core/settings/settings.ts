import type { TAbstractFile } from "obsidian";
import { DAILY_GOAL_FRONTMATTER_KEY, GOAL_FRONTMATTER_KEY } from "../constants";
import { WritingGoalColors } from "./colors";

export class WritingGoalsSettings {

  showGoalMessage: boolean = true;
  showInFileExplorer: boolean = true;
  showGoalOnCreateAndUpdate: boolean = true;
  noteGoals: string[] = [];
  folderGoals: { path: string, goalCount: number, dailyGoalCount: number }[] = [];
  goalLeaves: string[] = [];
  customGoalFrontmatterKey: string = GOAL_FRONTMATTER_KEY;
  customDailyGoalFrontmatterKey: string = DAILY_GOAL_FRONTMATTER_KEY;
  goalUpdateTime: number = 1;
  enableCsvExport: boolean = false;
  csvExportFileName: string = "writing-goals-history.csv";
  showSingleGoalView: boolean = false;
  showProgressChart: boolean = false;
  excludeComments: boolean = true;
  allowNegativeGoalProgress: boolean = false;
  enableCustomColors: boolean = false;
  customColors: WritingGoalColors = new WritingGoalColors();
  //Deprecated
  customGoalBarColor: string;
  //Deprecated
  customDailyGoalBarColor: string;
  additionalFileTypes: string[];
  defaultSprintGoalCount: number = 500;
  defaultSprintMinutes: number = 25;

  noGoal(path: string): boolean {
    return !this.noteGoals.contains(path) && this.folderGoals.filter(fg => fg.path == path).length == 0;
  }

  getFolderGoal(path: string) {
    return this.folderGoals.filter(fg => fg.path == path)[0];
  }

  removeGoal(file: TAbstractFile) {
    if (this.noteGoals.contains(file.path)) {
      this.noteGoals.remove(file.path);
    }
    const folderGoal = this.folderGoals.filter(fg => fg.path == file.path)[0];
    if (folderGoal != null) {
      this.folderGoals.remove(folderGoal);
    }
    if (this.goalLeaves.contains(file.path)) {
      this.goalLeaves.remove(file.path);
    }
  }

  rename(file: TAbstractFile, oldPath: string) {
    if (this.noteGoals.contains(oldPath)) {
      this.noteGoals.remove(oldPath);
      this.noteGoals.push(file.path);
    }
    const folderGoal = this.folderGoals.filter(fg => fg.path == oldPath)[0];
    if (folderGoal != null) {
      this.folderGoals.remove(folderGoal);
      folderGoal.path = file.path;
      this.folderGoals.push(folderGoal);
      //TODO: Need to also rename note goals that have this folder as a parent
      const noteGoalChildren = this.noteGoals.filter(ng => ng.contains(oldPath));
      noteGoalChildren.forEach(ngc => {
        this.noteGoals.remove(ngc);
        const updated = ngc.replace(oldPath, file.path);
        this.noteGoals.push(updated);
      });
    }
    if (this.goalLeaves.contains(oldPath)) {
      this.goalLeaves.remove(oldPath);
      this.goalLeaves.push(file.path);
    }
  }
}