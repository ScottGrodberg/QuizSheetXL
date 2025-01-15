const { token, sheetUrl } = require("./config.json");

type UserId = string;
type ChannelId = string;

export class User {
    constructor(public userId: UserId, public channelId: ChannelId) { }
}

export class Data {

    MAX_COLUMNS = 5;  // Need this to stay within the Discord limit of number of components in action row.
    N_ANSWERS = 4;  // Answers are multiple-choice, with this many choices.
    DEFAULT_PAUSE_SECONDS = 2;  // Wait after sending the question before sending the answers. Overridable within the /pause command

    users = new Map<UserId, User>();

    // TODO: Move these into a data structure for servers
    sheet = new Array<Array<string>>();
    columns = new Array<string>();

    // TODO: Move these into User so each can have their own formats
    question = new Set<number>();  // question format, which column(s) compose question
    answer = new Set<number>(); // answer format, which columns(s) to compose answers

    pauseSeconds = this.DEFAULT_PAUSE_SECONDS;
    currentQuestion = -1; // number;
    currentAnswers = new Array<number>(this.N_ANSWERS); // the correct answer will have the same id as the question

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