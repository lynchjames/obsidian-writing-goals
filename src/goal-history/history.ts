import type { App } from "obsidian";
import { WritingGoalsFile } from "../IO/file";
import { DEFAULT_GOAL_HISTORY_PATH as GOAL_HISTORY_PATH } from "../constants";
import moment, { type Moment } from "moment";

export interface GoalHistoryItem
{
    date:string,
    dailyGoal:number,
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
    }

    async init() {
        const historyExists = await this.historyExists();
        if(!historyExists) {
            await this.goalFile.saveJson(GOAL_HISTORY_PATH, new GoalHistory);
        }
    }
    
    async todaysGoal(path:string){
        if(this.historyExists()) {
            return undefined;
        }
        const goalHistory = await this.loadHistory();
        return this.goalItemForDate(goalHistory, path, this.today());
    }


    async loadHistory():Promise<GoalHistory> {
        return await this.goalFile.loadJson(GOAL_HISTORY_PATH) as GoalHistory;
    }

    async saveGoal(path:string, item:GoalHistoryItem) {
        const goalHistory = await this.loadHistory();
        let historyForPath = goalHistory[path] ?? [];
        historyForPath = historyForPath.filter(ghi => ghi.date != item.date);
        historyForPath.push(item);
        goalHistory[path] = historyForPath;
        this.goalFile.saveJson(GOAL_HISTORY_PATH, goalHistory);
    }

    goalItemForDate(goalHistory:GoalHistory, path: string, date: Moment): GoalHistoryItem {
        return goalHistory[path].filter(gh => gh.date.toString() == date.toString())[0];
    }

    today(): Moment {
        return moment().startOf('day');
    }

    historyExists() {
        return this.goalFile.exists(GOAL_HISTORY_PATH);
    }
}