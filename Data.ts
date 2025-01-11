import { Utility } from "./Utility";

type QuestionId = string;
type UserId = string;
type ChannelId = string;
export type QuestionType = "MULTI_CHOICE" | "TRUE_FALSE";

export class Answer {
    constructor(public text: string, public correct: boolean) { }
}

export class User {
    qTypes: Array<string>;
    ask: string;  // which column(s) to ask / question
    answer: string; // which columns(s) to allow answer with

    constructor(public userId: UserId, public channelId: ChannelId) {
        this.qTypes = new Array();
        this.ask = "";
        this.answer = "";
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

}