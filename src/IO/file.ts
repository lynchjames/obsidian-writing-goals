import type { App } from "obsidian";
import { Notice, normalizePath } from "obsidian";

export class WritingGoalsFile {
  app: App;
  fileInMemoryCache: string;

  constructor(app: App) {
    this.app = app;
  }

  async exists(path: string): Promise<boolean> {
    return await this.app.vault.adapter.exists(normalizePath(path));
  }

  async loadFile(path: string): Promise<string> {

    if (!(await this.exists(path))) {
      throw Error(`The file is not found: ${path}`);
    }
    try {
      return await this.app.vault.adapter.read(normalizePath(path));
    } catch (error) {
      const errorMsg = "Writing Goals: error reading file - file may be in use by another process";
      console.log(errorMsg);
      new Notice(errorMsg);
    }
  }

  async loadJson<T>(path: string): Promise<T> {
    try {
      return JSON.parse(await this.loadFile(normalizePath(path))) as T;
    } catch (error) {
      const errorMsg = "Writing Goals: error reading JSON file at " + path;
      console.log(errorMsg);
      new Notice(errorMsg);

    }
  }

  async saveJson<T>(path: string, data: T): Promise<void> {
    const dataToSave = JSON.stringify(data, null, 2);
    try {
      await this.app.vault.adapter.write(normalizePath(path), dataToSave);
    } catch (error) {
	const errorMsg = "Writing Goals: error writing to JSON file at " + path;
	console.log(errorMsg);
        new Notice(errorMsg);

    }
  }
  
  async saveCsv(path: string, data: string): Promise<void> {
    try {
      await this.app.vault.adapter.write(normalizePath(path), data);
    } catch (error) {
      const errorMsg = "Writing Goals: error accessing csv file for history export - file may be in use";
      console.log(errorMsg);
      new Notice(errorMsg);
    }
  }

}
