const { token, sheetUrl } = require("./config.json");

export type UserId = string;
export type ServerId = string;
export type ChannelId = string;

export class User {
    question = new Set<number>();  // question format, which column(s) compose question
    answer = new Set<number>(); // answer format, which columns(s) to compose answers

    pauseSeconds = Data.DEFAULT_PAUSE_SECONDS;

    currentSheet = -1;

    currentCategories = new Set<string>();
    sheetSubsetRowIds = new Array<number>();

    currentQuestion = -1; // number;
    currentAnswers = new Array<number>(Data.N_ANSWERS); // the correct answer will have the same id as the question


    constructor(public userId: UserId, public server: Server) {
        // Totally random guess which columns to start wtih
        this.question.add(2);
        this.answer.add(1);
    }
}

export class Sheet {

    columns = new Array<string>();
    data = new Array<Array<string>>();

    categories = new Array<string>();
    categoryColIdx = -1;

}
export class Server {
    sheetUrl: string;
    sheets = new Array<Sheet>();

    constructor(public serverId: ServerId) {
        this.sheetUrl = sheetUrl;
    }
}

export class Data {
    static MAX_COLUMNS = 5;  // Need this to stay within the Discord limit of number of components in action row.
    static N_ANSWERS = 4;  // Answers are multiple-choice, with this many choices.
    static DEFAULT_PAUSE_SECONDS = 2;  // Wait after sending the question before sending the answers. Overridable within the /pause command

    users = new Map<UserId, User>();
    servers = new Map<ServerId, Server>();

    buildSheetSubset(userId: UserId) {
        const user = this.users.get(userId)!;
        const sheet = user.server.sheets[user.currentSheet];
        const data = sheet.data;

        // Build a list of row ids which are a subset of sheet based on selected categories.
        let rowIdxs = new Array<number>();
        for (let i = 0; i < data.length; i++) {
            if (user.currentCategories.has(data[i][sheet.categoryColIdx])) {
                rowIdxs.push(i)
            }
        }
        user.sheetSubsetRowIds = rowIdxs;
    }

    rollback(user: User) {
        user.currentQuestion = -1;
        user.currentAnswers.fill(-1);
    }
}