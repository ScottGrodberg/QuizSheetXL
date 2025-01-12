import { Utility } from "./Utility";

type UserId = string;
type ChannelId = string;

export class User {
    constructor(public userId: UserId, public channelId: ChannelId) { }
}

export class Data {
    users = new Map<UserId, User>();

    // TODO: These vars should have data for a single channel
    sheet = new Array<Array<string>>();

    question = new Set<number>();  // question format, which column(s) compose question
    answer = new Set<number>(); // answer format, which columns(s) to compose answers

    currentQuestion = -1; // number;
    currentAnswers = new Array<number>(4); // the correct answer will have the same id as the question

    constructor() {
        this.question.add(0);
        this.question.add(1);
        this.answer.add(2);
    }
}