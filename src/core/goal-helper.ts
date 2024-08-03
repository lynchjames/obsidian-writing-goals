import { TFile, TAbstractFile, App, TFolder } from "obsidian"
import { ObsidianFileHelper } from "../IO/obsidian-file"
import type { WritingGoalsSettings } from "./settings/settings"
import type { GoalHistoryHelper } from "./goal-history/history"
import { WORD_COUNT_INCLUDE_FRONTMATTER_KEY } from "./constants"
import { FrontmatterHelper } from "../IO/frontmapper-helper"
import { goalHistory, noteGoals } from "../UI/stores/goal-store"
import { WritingGoals } from "./goal-entities"
import { CountCache } from "./count-cache"
import * as moment from "moment"
import { CanvasHelper } from "../IO/canvas-helper"
import { GoalType, type WritingGoal, type WritingSprintGoal } from "./goal-entity-types"

export class GoalHelper {
    app: App;
    fileHelper: ObsidianFileHelper;
    settings: WritingGoalsSettings;
    goalHistoryHelper: GoalHistoryHelper;
    frontmatterHelper: FrontmatterHelper;
    countCache: CountCache
    canvasHelper: CanvasHelper

    constructor(app: App, settings: WritingGoalsSettings, goalHistoryHelper: GoalHistoryHelper, countCache: CountCache) {
        this.app = app;
        this.settings = settings;
        this.fileHelper = new ObsidianFileHelper(this.settings);
        this.goalHistoryHelper = goalHistoryHelper;
        this.frontmatterHelper = new FrontmatterHelper(this.app, this.settings);
        this.canvasHelper = new CanvasHelper();
        this.countCache = countCache;
    }

    async createGoal(settings: WritingGoalsSettings, fileOrFolder: TAbstractFile, goalCount?: number, dailyGoalCount?: number): Promise<WritingGoal> {
        if (fileOrFolder == null) {
            return undefined;
        }
        const isFile = this.isValidFile(fileOrFolder);
        if (isFile) {
            goalCount = this.getGoalCount(settings.customGoalFrontmatterKey, fileOrFolder);
            dailyGoalCount = this.getGoalCount(settings.customDailyGoalFrontmatterKey, fileOrFolder);
        }
        const wordCount = isFile ? await this.getWordCount(fileOrFolder) : await this.getWordCountRecursive(fileOrFolder)
        await this.goalHistoryHelper.updateGoalForToday(fileOrFolder.path, goalCount, dailyGoalCount, wordCount);
        const todaysDailyGoal = await this.goalHistoryHelper.todaysGoalItem(fileOrFolder.path);
        const result = {
            path: fileOrFolder.path,
            title: this.getGoalTitle(fileOrFolder),
            goalType: isFile ? GoalType.Note : GoalType.Folder,
            goalCount: goalCount,
            dailyGoalCount: dailyGoalCount,
            startCount: todaysDailyGoal.startCount,
            wordCount: wordCount
        }
        return result;
    }


    async createSprintGoal(fileOrFolder: TAbstractFile, sprintGoalCount: number, sprintMinutes: number, startCount?: number): Promise<WritingSprintGoal> {
        if (fileOrFolder == null) {
            return undefined;
        }
        const isFile = this.isValidFile(fileOrFolder);
        const wordCount = isFile ? await this.getWordCount(fileOrFolder) : await this.getWordCountRecursive(fileOrFolder)
        const result = {
            path: fileOrFolder.path,
            title: this.getGoalTitle(fileOrFolder),
            goalType: isFile ? GoalType.Note : GoalType.Folder,
            startCount: startCount ?? wordCount,
            wordCount: wordCount,
            sprintGoalCount: sprintGoalCount,
            sprintMinutes: sprintMinutes
        }
        return result;
    }

    private getGoalTitle(fileOrFolder: TAbstractFile) {
        return fileOrFolder.name.split(".")[0]
    }

    getGoalCount(frontMatterKey: string, file: TAbstractFile) {
        const metadata = this.app.metadataCache.getFileCache(file as TFile);
        if (metadata && metadata.frontmatter) {
            return metadata.frontmatter[frontMatterKey] ?? 0;
        }
        return 0;
    }

    async getWordCount(fileOrFolder: TAbstractFile) {
        const isFile = this.isValidFile(fileOrFolder);
        if (isFile) {
            const include = this.frontmatterHelper.get(WORD_COUNT_INCLUDE_FRONTMATTER_KEY, fileOrFolder.path);
            if (include != null && (include == "false" || !include)) {
                return 0;
            }
            const file = fileOrFolder as TFile;
            if(!this.fileIsDirty(file)) {
                return this.countCache[file.path];
            }
            let fileContents = await this.app.vault.cachedRead(file);
            if(this.fileIsCanvas(file)) {
                fileContents = this.canvasHelper.getCanvasText(file, fileContents);
            }
            const metadata = this.app.metadataCache.getCache(fileOrFolder.path);
            const count = await this.fileHelper.countWords(fileContents, metadata);
            this.countCache[file.path] = count;
            goalHistory.set(await this.goalHistoryHelper.loadHistory());
            return count;
        } else {
            return await this.getWordCountRecursive(fileOrFolder);
        }
    }

    fileIsDirty(file: TFile) {
        const diff = (moment.now() - file.stat.mtime)/1000;
        return diff < 5 || this.countCache[file.path] == null;
    }

    fileIsCanvas(file: TFile) {
        return file.extension == "canvas"
    }

    async updateGoalsFromSettings() {
        let notes = new WritingGoals();
        for (let index = 0; index < this.settings.noteGoals.length; index++) {
            const noteGoal = this.settings.noteGoals[index];
            const file = this.app.vault.getAbstractFileByPath(noteGoal);
            const goal = await this.createGoal(this.settings, file);
            notes[noteGoal] = goal;
        }
        for (let index = 0; index < this.settings.folderGoals.length; index++) {
            const folderGoal = this.settings.folderGoals[index];
            const folder = this.app.vault.getAbstractFileByPath(folderGoal.path);
            const goal = await this.createGoal(this.settings, folder, folderGoal.goalCount, folderGoal.dailyGoalCount);
            notes[folderGoal.path] = goal;
        }
        noteGoals.set(notes);
    }

    private async getWordCountRecursive(fileOrFolder: TAbstractFile) {
        let count = 0;
        if (this.isValidFile(fileOrFolder)) {
            count = count + await this.getWordCount(fileOrFolder);
        } else if (fileOrFolder instanceof TFolder) {
            const children = (fileOrFolder as TFolder).children
            for (let index = 0; index < children.length; index++) {
                const child = children[index];
                count = count + await this.getWordCountRecursive(child);
            }
        }
        return count;
    }

    private isValidFile(fileOrFolder: TAbstractFile) {
        return fileOrFolder instanceof TFile && (fileOrFolder.extension == "md" || this.additionalFileTypes(fileOrFolder));
    }

    private additionalFileTypes(file: TFile) {
        return this.settings.additionalFileTypes.contains(file.extension);
    }
}