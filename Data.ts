import { Utility } from "./Utility";

type QuestionId = string;
type UserId = string;
type ChannelId = string;
export type QuestionType = "MULTI_CHOICE" | "TRUE_FALSE";

export class Answer {
    constructor(public text: string, public correct: boolean) { }
}

export class User {
    question: Set<number>;  // question format, which column(s) compose question
    answer: Set<number>; // answer format, which columns(s) to compose answers

    constructor(public userId: UserId, public channelId: ChannelId) {
        this.question = new Set();
        this.answer = new Set();
    }
}

export class Question {
    id: string;
    answers: Array<Answer>;

    constructor(public questionType: QuestionType, public text: string) {
        this.id = Utility.generateUid(8);
        this.answers = new Array();
    }
}

export class Data {
    users = new Map<UserId, User>();
    sheet = new Array<Array<string>>();
    columns = new Array<string>();
}