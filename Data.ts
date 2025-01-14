const { token, sheetUrl } = require("./config.json");

type UserId = string;
type ChannelId = string;

export class User {
    constructor(public userId: UserId, public channelId: ChannelId) { }
}

export class Data {
    users = new Map<UserId, User>();

    sheet = new Array<Array<string>>();
    columns = new Array<string>();

    // TODO: Move these into User so each can have their own formats
    question = new Set<number>();  // question format, which column(s) compose question
    answer = new Set<number>(); // answer format, which columns(s) to compose answers

    currentQuestion = -1; // number;
    currentAnswers = new Array<number>(4); // the correct answer will have the same id as the question

    pauseSeconds = 2; // Wait 2 after sending the question before sending the answers
    sheetUrl: string;

    constructor() {
        // // Question is the foreign language, answer is english
        // this.question.add(0);
        // this.question.add(1);
        // this.answer.add(2);

        // Question is english, answer is foreign language
        this.question.add(2);
        //this.answer.add(0);
        this.answer.add(1);

        this.sheetUrl = sheetUrl;
    }
}