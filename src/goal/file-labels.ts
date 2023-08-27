import type { App } from "obsidian";
import Goal from './goal.svelte';
import type { WritingGoalsSettings } from "../settings/settings";
import { VIEW_TYPE_FILE_EXPLORER } from "../constants";

interface FileItem {
	titleEl?: HTMLElement;
	selfEl: HTMLElement;
}

export class FileLabels {
    app: App;
    settings: WritingGoalsSettings;
    /**
     *
     */
    constructor(app:App, settings:WritingGoalsSettings) {
        this.app = app;
        this.settings = settings;        
    }

    initFileLabels() {
        const fileExplorer = this.app.workspace.getLeavesOfType(VIEW_TYPE_FILE_EXPLORER)[0];
        const fileItems: { [path: string]: FileItem } = (
          fileExplorer.view as any
        ).fileItems;
        this.resetFileLabels(fileItems);
        if(this.settings.showInFileExplorer) {
          const combinedGoals = this.settings.noteGoals.concat(this.settings.folderGoals.map(fg => fg.path));
          combinedGoals.forEach(path => {
              if(!fileItems){
                return;
              }
              const item = fileItems[path];
              const itemEl = item ? (item.titleEl ?? item.selfEl) : undefined;
              if(item && itemEl && !this.containsLabel(itemEl)) {
                      new Goal({
                          target: itemEl,
                          props: {
                          path: path,
                          mode: 'simple',
                          },
                      });
                  }
              });
        }
      }

    resetFileLabels(fileItems:any) {
      for (let key in fileItems) {
        const item = fileItems[key];
        const itemEl = (item.titleEl ?? item.selfEl);
        for (let i = 0; i < itemEl.children.length; i++) {
          const child = itemEl.children[i];
          if(child && this.containsLabel(child)){
            itemEl.removeChild(child);
          }
        }
      }
    }

    containsLabel(el: any) {
      return el?.className?.contains('writing-goals-simple-container')
    }
}