import type { App } from "obsidian";
import SimpleGoal from './components/simple-goal.svelte';
import type { WritingGoalsSettings } from "../../core/settings/settings";
import { LABEL_PATH_DATA_ATTR, VIEW_TYPE_FILE_EXPLORER } from "../../core/constants";

interface FileItem {
	titleEl?: HTMLElement;
	selfEl: HTMLElement;
}

export class FileLabels {
    app: App;
    settings: WritingGoalsSettings;

    constructor(app:App, settings:WritingGoalsSettings) {
        this.app = app;
        this.settings = settings;        
    }

    initFileLabels(pathForLabel?:string) {
        const fileExplorer = this.app.workspace.getLeavesOfType(VIEW_TYPE_FILE_EXPLORER)[0];
        const fileItems: { [path: string]: FileItem } = (
          fileExplorer.view as any
        ).fileItems;
        this.resetFileLabels(fileItems, pathForLabel);
        if(this.settings.showInFileExplorer) {
          const combinedGoals = this.settings.noteGoals.concat(this.settings.folderGoals.map(fg => fg.path));
          const deduped = [...new Set(combinedGoals)];
          deduped.forEach(path => {
              if(!fileItems){
                return;
              }
              const item = fileItems[path];
              const itemEl = item ? (item.titleEl ?? item.selfEl) : undefined;
              if(item && itemEl && !this.hasLabelInChildren(itemEl)) {
                      this.createSimpleGoal(itemEl, path);
                  }
              });
        }
      }

    private createSimpleGoal(itemEl: HTMLElement, path: string) {
      new SimpleGoal({
        target: itemEl,
        props: {
          path: path,
          color: this.settings.customGoalBarColor,
          dailyColor: this.settings.customDailyGoalBarColor,
        },
      });
    }

    resetAllFileLabels() {
      const fileExplorer = this.app.workspace.getLeavesOfType(VIEW_TYPE_FILE_EXPLORER)[0];
        const fileItems: { [path: string]: FileItem } = (
          fileExplorer.view as any
        ).fileItems;
      this.resetFileLabels(fileItems);
    }

    resetFileLabels(fileItems:any, pathForLabel?:string) {
      for (let key in fileItems) {
        const item = fileItems[key];
        const itemEl = (item.titleEl ?? item.selfEl);
        for (let i = 0; i < itemEl.children.length; i++) {
          const child = itemEl.children[i];
          if(child && this.containsLabel(child, pathForLabel)){
            itemEl.removeChild(child);
          }
        }
      }
    }

    hasLabelInChildren(el: any) {
      for (let i = 0; i < el.children.length; i++) {
        const child = el.children[i];
        if(child && this.containsLabel(child)){
          return true;
        }
      }
      return false;
    }

    containsLabel(el: any, pathForLabel?:string) {
      return el?.className?.contains('writing-goals-simple-container') && (!pathForLabel || el?.getAttr(LABEL_PATH_DATA_ATTR) == pathForLabel)
    }
}