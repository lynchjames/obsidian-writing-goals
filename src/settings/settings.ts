import type { Notes } from "../stores/note-goal";

export class WritingGoalsSettings {
  showInFileExplorer: boolean = false; 
  noteGoals:string[] = [];
  folderGoals: {path:string, goalCount:number}[] = [];

  hasGoal(path:string){
    return this.noteGoals.concat(path);
  }
}