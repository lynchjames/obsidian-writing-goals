export class HistoryStatsItem {
    path: string;
    date: string;
    value: number;

    constructor(path: string, date: string, value: number) {
        this.path = path;
        this.date = date;
        this.value = value;
    }
}

export class HistoryStatsItems {
    [key: string]: HistoryStatsItem[]
}