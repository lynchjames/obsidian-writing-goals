import { GoalHistory } from "../core/goal-history/history";
import { WritingGoalsFile } from "./file";
import { WritingGoalsSettings } from "../core/settings/settings";

export class CsvExport {
    settings: WritingGoalsSettings;
    file: WritingGoalsFile;
    
    constructor(settings: WritingGoalsSettings, goalFile: WritingGoalsFile) {
        this.settings = settings;
        this.file = goalFile;
    }

    async exportGoalHistory(history:GoalHistory) {
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
        console.log("Exporting csv")
        await this.file.saveCsv("writing-goals-history.csv", csvContent);
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