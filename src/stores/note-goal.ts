import { TFile, TAbstractFile, App, TFolder } from "obsidian"
import type { FileHelper } from "../IO/file"
import type { WritingGoalsSettings } from "../settings/settings"

export enum GoalType {
    Note,
    Folder
}

export interface NoteGoal {
    path: string
    title: string
    goalType: GoalType
    goalCount: number
    wordCount: number
}

export class Notes {
    [key: string]: NoteGoal
}

export async function createGoal(app: App, settings:WritingGoalsSettings, fileHelper:FileHelper, file: TAbstractFile, goalCount?: number): Promise<NoteGoal> {
    const isFile = file instanceof TFile;
    if(isFile) {
        goalCount = getGoalCount(app, settings.customGoalFrontmatterKey, file);
    }
    return {
        path: file.path,
        title: file.name.replace('.md', ''),
        goalType: isFile ? GoalType.Note : GoalType.Folder,
        goalCount: goalCount,
        wordCount: isFile ? await getWordCount(app, fileHelper, file) : await getWordCountRecursive(app, fileHelper, file),
    }
}

export function getGoalCount(app: App, frontMatterKey:string, file:TAbstractFile){
    const metadata = app.metadataCache.getFileCache(file as TFile);
    if(metadata && metadata.frontmatter){
        return metadata.frontmatter[frontMatterKey] ?? 0;
    }
    return 0;
}

async function getWordCount(app:App, fileHelper:FileHelper, file:TAbstractFile){
    const metadata = app.metadataCache.getFileCache(file as TFile);
    const fileContents = await app.vault.cachedRead(file as TFile);
    const wordCount = await fileHelper.countWords(fileContents, metadata);
    return wordCount;
}

async function getWordCountRecursive(app: App, fileHelper: FileHelper, fileOrFolder: TAbstractFile){
    let count = 0;
    if(fileOrFolder instanceof TFile){
        count = count + await getWordCount(app, fileHelper, fileOrFolder);
    } else {
        const children = (fileOrFolder as TFolder).children
        for (let index = 0; index < children.length; index++) {
            const child = children[index];
            count = count + await getWordCountRecursive(app, fileHelper, child);
        }
    }
    return count;
}
