import { TFile, TAbstractFile, App } from "obsidian"
import { GOAL_FRONTMATTER_KEY } from "../constants"
import type { FileHelper } from "../IO/file"

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
    labelSet: boolean
}

export class Notes {
    [key: string]: NoteGoal
}

export async function createNoteGoal(app: App, fileHelper:FileHelper, file: TAbstractFile): Promise<NoteGoal> {
    return {
        path: file.path,
        title: file.name,
        goalType: file instanceof TFile ? GoalType.Note : GoalType.Folder,
        goalCount: await getGoalCount(app, file),
        wordCount: await getWordCount(app, fileHelper, file),
        labelSet: false
    }
}

function getGoalCount(app: App, file:TAbstractFile){
    const metadata = app.metadataCache.getFileCache(file as TFile);
    const goalCount = metadata.frontmatter[GOAL_FRONTMATTER_KEY];
    return goalCount;
}

async function getWordCount(app:App, fileHelper:FileHelper, file:TAbstractFile){
    const metadata = app.metadataCache.getFileCache(file as TFile);
    const fileContents = await app.vault.cachedRead(file as TFile);
    const wordCount = await fileHelper.countWords(fileContents, metadata);
    return wordCount;
}