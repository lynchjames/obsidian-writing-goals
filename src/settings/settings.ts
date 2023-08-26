import type { Notes } from "../stores/note-goal";

export class WritingGoalsSettings {
  showInFileExplorer: boolean = false; 
  noteGoals:string[] = [];
  folderGoals: {path:string, goalCount:number}[] = [];

  noGoal(path:string): boolean{
    console.log(path);
    return !this.noteGoals.contains(path) && this.folderGoals.filter(fg => fg.path == path).length == 0;
  }
}