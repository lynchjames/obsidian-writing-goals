import type { App } from "obsidian";
import { WritingGoalsFile } from "../IO/file";
import { HistoryStatsItem, HistoryStatsItems } from "./history-stats";
import { DEFAULT_GOAL_HISTORY_PATH as GOAL_HISTORY_PATH } from "../constants";
import moment from "moment";
import type { WritingGoalsSettings } from "../settings/settings";

export interface GoalHistoryItem
{
    date?:string,
    dailyGoal:number,
    goal:number,
    startCount:number,
    endCount:number
}

export class GoalHistory {
    [key: string]: GoalHistoryItem[]
}

export class GoalHistoryHelper {
    
    goalFile: WritingGoalsFile;
    settings: WritingGoalsSettings;

    constructor(app:App, settings:WritingGoalsSettings) {
        this.settings = settings;
        this.goalFile = new WritingGoalsFile(app);
        this.init();
    }

    async init() {
        const historyExists = await this.historyExists();
        if(!historyExists) {
            await this.goalFile.saveJson(GOAL_HISTORY_PATH, new GoalHistory);
        }
    }
    
    async todaysGoalItem(path:string): Promise<GoalHistoryItem> {
        if(!this.historyExists()) {
            return undefined;
        }
        const goalHistory = await this.loadHistory();
        const item = this.goalItemForDate(goalHistory, path, this.today());
        return item;
    }


    async loadHistory():Promise<GoalHistory> {
        return await this.goalFile.loadJson(GOAL_HISTORY_PATH) as GoalHistory;
    }

    async updateGoalForToday(path: string, goalCount: number, dailyGoalCount:number, wordCount: number) {
        let item = await this.todaysGoalItem(path);
        if(item != null) {
            item.dailyGoal = dailyGoalCount;
            item.goal = goalCount;
            item.endCount = wordCount;
        } else {
           item = {dailyGoal: dailyGoalCount, goal:goalCount, startCount: wordCount, endCount: wordCount}; 
        }
        if(!this.settings.allowNegativeGoalProgress && item.endCount - item.startCount < 0){
            item.startCount = item.endCount;
        }
        item.date = this.today();
        await this.saveGoal(path, item)
    }

    async saveGoal(path:string, item:GoalHistoryItem) {
        const history = await this.loadHistory();
        let historyForPath = history[path] ?? [];
        historyForPath = historyForPath.filter(ghi => ghi.date != item.date);
        historyForPath.push(item);
        history[path] = historyForPath;
        await this.goalFile.saveJson(GOAL_HISTORY_PATH, history);
    }

    async resetDailyProgress(path: string) {
        const item = await this.todaysGoalItem(path);
        item.startCount = item.endCount;
        await this.saveGoal(path, item);
    }

    goalItemForDate(goalHistory:GoalHistory, path: string, date: string): GoalHistoryItem {
        return goalHistory[path]?.filter(gh => gh.date == date)[0];
    }

    today(): string {
        return moment().startOf('day').toString();
    }

    async historyExists() {
        return await this.goalFile.exists(GOAL_HISTORY_PATH);
    }

    async getStats(path?:string) {
        const history = await this.loadHistory();
        return this.transformHistory(history, path);
    }

    transformHistory(history: GoalHistory, path?:string) {
        const transformResult = new HistoryStatsItems();
        for(let historyPath in history){
            if(path == null || path == historyPath){
                const item = history[historyPath];
                transformResult[historyPath] = [];
                const sortedDateCounts = item.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                const statsItems = sortedDateCounts
                    .map(d => new HistoryStatsItem(
                            historyPath, 
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