import { TFolder, type App, TFile } from "obsidian";

export class FrontmatterHelper {
    app: App;
    
    constructor(app:App) {
        this.app = app;
    }

    get<T>(key: string, path: string): T {
        const file = this.app.vault.getAbstractFileByPath(path);
        if(file == null || file instanceof TFolder) {
            return undefined;
        }
        const metadata = this.app.metadataCache.getFileCache(file as TFile);
        if(metadata == null) {
            return undefined;
        }
        const value = metadata.frontmatter[key];
        return value as T;
    }

}