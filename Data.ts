const { token, sheetUrl } = require("./config.json");

export type UserId = string;
export type ServerId = string;
export type ChannelId = string;

export class User {
    qColumns = new Set<number>();  // question format, which column(s) compose question
    aColumns = new Set<number>(); // answer format, which columns(s) to compose answers

    pauseSeconds = Data.DEFAULT_PAUSE_SECONDS;

    currentQuestion = -1; // number;
    currentAnswers = new Array<number>(Data.N_ANSWERS); // the correct answer will have the same id as the question

    currentCategories = new Set<string>();
    sheetSubsetRowIds = new Array<number>();  // filtered on Category

    constructor(public userId: UserId, public server: Server) {
        // Start with the first two columns as the question and answer.
        // These are the only two guaranteed by the import validation to not be empty
        this.qColumns.add(0);
        this.aColumns.add(1);
    }
}

export class Server {
    sheetUrl: string;

    sheet = new Array<Array<string>>();
    columns = new Array<string>();

    categories = new Array<string>();
    categoryColIdx = -1;

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
        const server = user.server;

        // Build a list of row ids which are a subset of sheet based on selected categories.
        let rowIdxs = new Array<number>();
        for (let i = 0; i < server.sheet.length; i++) {
            if (user.currentCategories.has(server.sheet[i][server.categoryColIdx])) {
                rowIdxs.push(i)
            }
        }
        user.sheetSubsetRowIds = rowIdxs;
    }

    rollbackQA(user: User) {
        user.currentQuestion = -1;
        user.currentAnswers.fill(-1);
    }

    setCategoriesToAll(user: User) {
        user.currentCategories = new Set(user.server.categories);
        this.buildSheetSubset(user.userId);
    }
}