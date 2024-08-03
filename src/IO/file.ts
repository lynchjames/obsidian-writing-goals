import type { App } from "obsidian";

export class WritingGoalsFile {
  app: App;
  fileInMemoryCache: string;

  constructor(app: App) {
    this.app = app;
  }
  async exists(path: string): Promise<boolean> {
    return await this.app.vault.adapter.exists(path);
  }

  async loadFile(path: string): Promise<string> {
    if (!(await this.exists(path))) {
      throw Error(`The file is not found: ${path}`);
    }
    try {
      return await this.app.vault.adapter.read(path);
    } catch (error) {
      console.log("Writing Goals: error reading file - file may be in use by another process")
    }
  }

  async loadJson<T>(path: string): Promise<T> {
    try {
      return JSON.parse(await this.loadFile(path)) as T;
    } catch (error) {
        console.log("Writing Goals: error reading JSON file at ", path)
    }
  }

  async saveJson<T>(path: string, data: T): Promise<void> {
    const dataToSave = JSON.stringify(data, null, 2);
    try {
      await this.app.vault.adapter.write(path, dataToSave);
    } catch (error) {
        console.log("Writing Goals: error writing to JSON file at ", path)
    }
  }
  
  async saveCsv(path: string, data: string): Promise<void> {
    try {
      await this.app.vault.adapter.write(path, data);
    } catch (error) {
      console.log("Writing Goals: error accessing csv file for history export - file may be in use")
    }
  }

}