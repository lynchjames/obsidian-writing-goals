import { TFile, TAbstractFile, App, TFolder } from "obsidian"
import { ObsidianFileHelper } from "./IO/obsidian-file"
import type { WritingGoalsSettings } from "./settings/settings"
import type { GoalHistoryHelper } from "./goal-history/history"

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
    dailyGoalCount: number
    startCount: number
}

export class Notes {
    [key: string]: NoteGoal
}

export class NoteGoalHelper {
    app: App
    fileHelper: ObsidianFileHelper
    settings: WritingGoalsSettings
    goalHistoryHelper: GoalHistoryHelper

    constructor(app:App, settings:WritingGoalsSettings, goalHistoryHelper:GoalHistoryHelper) {
        this.app = app;
        this.settings = settings;
        this.fileHelper = new ObsidianFileHelper(this.settings);
        this.goalHistoryHelper = goalHistoryHelper;
    }

    async createGoal(settings:WritingGoalsSettings, file: TAbstractFile, goalCount?: number, dailyGoalCount?: number): Promise<NoteGoal> {
        const isFile = file instanceof TFile;
        if(isFile) {
            goalCount = this.getGoalCount(settings.customGoalFrontmatterKey, file);
            dailyGoalCount = this.getGoalCount(settings.customDailyGoalFrontmatterKey, file);
        }
        const wordCount = isFile ? await this.getWordCount(file) : await this.getWordCountRecursive(file)
        await this.goalHistoryHelper.updateGoalForToday(file.path, goalCount, dailyGoalCount, wordCount);
        const todaysDailyGoal = await this.goalHistoryHelper.todaysGoalItem(file.path);
        const result = {
            path: file.path,
            title: file.name.replace('.md', ''),
            goalType: isFile ? GoalType.Note : GoalType.Folder,
            goalCount: goalCount,
            dailyGoalCount: dailyGoalCount,
            startCount: todaysDailyGoal.startCount,
            wordCount: wordCount
        }
        return result;
    }

    getGoalCount(frontMatterKey:string, file:TAbstractFile){
        const metadata = this.app.metadataCache.getFileCache(file as TFile);
        if(metadata && metadata.frontmatter){
            return metadata.frontmatter[frontMatterKey] ?? 0;
        }
        return 0;
    }

    async getWordCount(file:TAbstractFile){
        const metadata = this.app.metadataCache.getFileCache(file as TFile);
        const fileContents = await this.app.vault.cachedRead(file as TFile);
        const wordCount = await this.fileHelper.countWords(fileContents, metadata);
        return wordCount;
    }

    async getWordCountRecursive(fileOrFolder: TAbstractFile){
        let count = 0;
        if(fileOrFolder instanceof TFile){
            count = count + await this.getWordCount(fileOrFolder);
        } else {
            const children = (fileOrFolder as TFolder).children
            for (let index = 0; index < children.length; index++) {
                const child = children[index];
                count = count + await this.getWordCountRecursive(child);
            }
        }
        return count;
    }
}