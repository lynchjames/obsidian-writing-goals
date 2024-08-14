import type { App, PluginManifest } from "obsidian";
import { FileSystemAdapter, moment } from "obsidian";
import { WritingGoalsFile } from "../../IO/file";
import { HistoryStatsItem, HistoryStatsItems } from "./history-stats";
import { DEFAULT_GOAL_HISTORY_PATH as GOAL_HISTORY_PATH } from "../constants";
import type { WritingGoalsSettings } from "../settings/settings";

export interface GoalHistoryItem {
    date?: string,
    dailyGoal: number,
    goal: number,
    startCount: number,
    endCount: number
}

export class GoalHistory {
    [key: string]: GoalHistoryItem[]
}

export class GoalHistoryHelper {

    app: App;
    settings: WritingGoalsSettings;
    manifest: PluginManifest;
    goalFile: WritingGoalsFile;

    constructor(app: App, settings: WritingGoalsSettings, manifest: PluginManifest) {
        this.app = app;
        this.settings = settings;
        this.manifest = manifest;
        this.goalFile = new WritingGoalsFile(this.app);
        this.init();
    }

    async init() {
        const historyExists = await this.historyExists();
        if (!historyExists) {
            await this.goalFile.saveJson(this.historyPath(), new GoalHistory);
        }
    }

    historyPath() {
        const historyPath = `${this.manifest.dir!!}/${GOAL_HISTORY_PATH}`;
        return historyPath;
    }

    async historyExists() {
        return await this.goalFile.exists(this.historyPath());
    }

    async todaysGoalItem(path: string): Promise<GoalHistoryItem> {
        if (!this.historyExists()) {
            return undefined;
        }
        const goalHistory = await this.loadHistory();
        const item = this.goalItemForDate(goalHistory, path, this.today());
        return item;
    }


    async loadHistory(): Promise<GoalHistory> {
        return await this.goalFile.loadJson(this.historyPath()) as GoalHistory;
    }

    async updateGoalForToday(path: string, goalCount: number, dailyGoalCount: number, wordCount: number) {
        let item = await this.todaysGoalItem(path);
        if (item != null) {
            item.dailyGoal = dailyGoalCount;
            item.goal = goalCount;
            item.endCount = wordCount;
        } else {
            item = { dailyGoal: dailyGoalCount, goal: goalCount, startCount: wordCount, endCount: wordCount };
        }
        if (!this.settings.allowNegativeGoalProgress && item.endCount - item.startCount < 0) {
            item.startCount = item.endCount;
        }
        item.date = this.today();
        await this.saveGoal(path, item)
    }

    async saveGoal(path: string, item: GoalHistoryItem) {
        const history = await this.loadHistory();
        let historyForPath = history[path] ?? [];
        historyForPath = historyForPath.filter(ghi => ghi.date != item.date);
        historyForPath.push(item);
        history[path] = historyForPath;
        await this.goalFile.saveJson(this.historyPath(), history);
    }

    async resetDailyProgress(path: string) {
        const item = await this.todaysGoalItem(path);
        item.startCount = item.endCount;
        await this.saveGoal(path, item);
    }

    async renameHistoryEntry(path: string, oldPath: string) {
        const history = await this.loadHistory();
        const existingEntries = history[oldPath];
        if (existingEntries) {
            history[path] = existingEntries;
            delete history[oldPath];
        }
        await this.goalFile.saveJson(this.historyPath(), history);
    }

    goalItemForDate(goalHistory: GoalHistory, path: string, date: string): GoalHistoryItem {
        return goalHistory[path]?.filter(gh => gh.date == date)[0];
    }

    today(): string {
        return moment().startOf("day").toString();
    }

    async getStats(path?: string) {
        const history = await this.loadHistory();
        return this.transformHistory(history, path);
    }

    transformHistory(history: GoalHistory, path?: string) {
        const transformResult = new HistoryStatsItems();
        for (let historyPath in history) {
            if (path == null || path == historyPath) {
                const item = history[historyPath];
                transformResult[historyPath] = [];
                const sortedDateCounts = item.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                // Limiting data for chart to a limited number of entries. Will need to change this for the dedicated stats view. 
                const take = sortedDateCounts.reverse().slice(0, 90).reverse();
                const statsItems = take
                    .map(d => new HistoryStatsItem(
                        historyPath,
                        //TODO: Convert this format to a plugin setting
                        moment(new Date(d.date)).format("ddd DD MMM YYYY"),
                        this.calculateWordsWritten(d)
                    ));
                transformResult[historyPath].push(...statsItems);
            }
        }
        return transformResult;
    }

    calculateWordsWritten(item: GoalHistoryItem) {
        const diff = item.endCount - item.startCount;
        const count = this.settings.allowNegativeGoalProgress || diff >= 0 ? diff : 0;
        return count;
    }
}
