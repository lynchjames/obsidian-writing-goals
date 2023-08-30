import type { App } from "obsidian";
import { DEFAULT_GOAL_HISTORY_PATH } from "../constants";
import moment, { duration } from "moment";

export class WritingGoalsFile {
    app: App;
    constructor(app:App) {
        this.app = app;
    }
    async exists(path: string): Promise<boolean> {
      return await this.app.vault.adapter.exists(path);
    }
  
    async loadFile(path: string): Promise<string> {
      if (!(await this.exists(path))) {
        throw Error(`The file is not found: ${path}`);
      }
      return this.app.vault.adapter.read(path);
    }
  
    async loadJson<T>(path: string): Promise<T> {
      return JSON.parse(await this.loadFile(path)) as T;
    }
  
    async saveJson<T>(path: string, data: T): Promise<void> {
      await this.app.vault.adapter.write(path, JSON.stringify(data));
    }
}