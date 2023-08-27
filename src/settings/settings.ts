import type { TAbstractFile } from "obsidian";
import { GOAL_FRONTMATTER_KEY } from "../constants";
import type { Notes } from "../stores/note-goal";

export class WritingGoalsSettings {
  
  showGoalMessage: boolean = true;
  showInFileExplorer: boolean = true; 
  noteGoals:string[] = [];
  folderGoals: {path:string, goalCount:number}[] = [];
  goalLeaves: string[] = [];
  customGoalFrontmatterKey: string = GOAL_FRONTMATTER_KEY;

  noGoal(path:string): boolean{
    return !this.noteGoals.contains(path) && this.folderGoals.filter(fg => fg.path == path).length == 0;
  }

  getFolderGoal(path:string){
    return this.folderGoals.filter(fg => fg.path == path)[0];
  }

  removeGoal(file: TAbstractFile) {
    if(this.noteGoals.contains(file.path)){
      this.noteGoals.remove(file.path);
    }
    const folderGoal = this.folderGoals.filter(fg => fg.path == file.path)[0];
    if(folderGoal != null){
      this.folderGoals.remove(folderGoal);
    }
    if(this.goalLeaves.contains(file.path)){
      this.goalLeaves.remove(file.path);
    }
  }
}