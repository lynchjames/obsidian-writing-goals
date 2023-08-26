import type { Notes } from "../stores/note-goal";

export class WritingGoalsSettings {
  showInFileExplorer: boolean = false; 
  noteGoals:string[] = [];
  folderGoals: {path:string, goalCount:number}[] = [];
  goalLeaves: string[] = [];

  noGoal(path:string): boolean{
    return !this.noteGoals.contains(path) && this.folderGoals.filter(fg => fg.path == path).length == 0;
  }

  getFolderGoal(path:string){
    return this.folderGoals.filter(fg => fg.path == path)[0];
  }
}