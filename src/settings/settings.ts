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
}