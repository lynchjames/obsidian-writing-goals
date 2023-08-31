import type { App } from "obsidian";
import { WritingGoalsFile } from "../IO/file";
import { DEFAULT_GOAL_HISTORY_PATH as GOAL_HISTORY_PATH } from "../constants";
import moment, { type Moment } from "moment";

export interface GoalHistoryItem
{
    date?:string,
    dailyGoal:number,
    goal:number,
    startCount:number,
    endCount:number
}

export class GoalHistory {
    //Dictionary with path as the key and array of history items as the value
    [key: string]: GoalHistoryItem[]
}

export class GoalHistoryHelper {
    
    goalFile: WritingGoalsFile;
    constructor(app:App) {
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
        item.date = this.today();
        await this.saveGoal(path, item)
    }

    async saveGoal(path:string, item:GoalHistoryItem) {
        const goalHistory = await this.loadHistory();
        let historyForPath = goalHistory[path] ?? [];
        historyForPath = historyForPath.filter(ghi => ghi.date != item.date);
        historyForPath.push(item);
        goalHistory[path] = historyForPath;
        this.goalFile.saveJson(GOAL_HISTORY_PATH, goalHistory);
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
}