import { GoalHistoryHelper } from "../core/goal-history/history";
import { WritingGoalsFile } from "./file";
import { WritingGoalsSettings } from "../core/settings/settings";
import { App } from "obsidian";

export class CsvExport {
    settings: WritingGoalsSettings;
    file: WritingGoalsFile;
    goalHistoryHelper: GoalHistoryHelper;
    
    constructor(app: App, settings: WritingGoalsSettings, goalHistoryHelper: GoalHistoryHelper) {
        this.settings = settings;
        this.file = new WritingGoalsFile(app);
        this.goalHistoryHelper = goalHistoryHelper;
    }

    async exportGoalHistory() {
        if(!this.settings.enableCsvExport) {
            return;
        }
        const history = await this.goalHistoryHelper.loadHistory();
        const preparedData = [];
        preparedData.push(["Path", "Folder", "File", "Date", "Daily Goal", "Goal", "Start Count", "End Count"]);
        for (let historyPath in history) {
            let folderPath = this.getFolderFromPath(historyPath);
            let fileName = this.getFileNameFromPath(historyPath);
            history[historyPath].forEach(item => preparedData.push(
                [historyPath, folderPath, fileName, item.date, item.dailyGoal, item.goal, item.startCount, item.endCount]
            ));
        }
        const csvContent = preparedData.map(row => row.join(",")).join("\n");
        //Prevent file resetting if save occurs near in time to app unload
        if(csvContent.length === 0) {
            return;
        }
        await this.file.saveCsv(this.settings.csvExportFileName, csvContent);
    }

    getFileNameFromPath(path: string) {
        const pathItems = path.split('/');
        const lastItem = pathItems.last();
        return lastItem.endsWith(".md") ? lastItem : "";
    }

    getFolderFromPath(path: string) {
        const pathItems = path.split('/');
        const lastItem = pathItems.last();
        return lastItem.endsWith(".md") ? "" : lastItem;
    }
}