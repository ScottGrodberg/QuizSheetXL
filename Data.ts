import { Utility } from "./Utility";

type QuestionId = string;
type UserId = string;
type ChannelId = string;
export type QuestionType = "MULTI_CHOICE" | "TRUE_FALSE";

export class Answer {
    constructor(public text: string, public correct: boolean) { }
}

export class User {
    points: number;
    question?: Question;

    constructor(public userId: UserId, public channelId: ChannelId) {
        this.points = 0;
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
    questions = new Map<QuestionId, Question>();
    users = new Map<UserId, User>(); // Used to track which question the user is creating
    channels = new Map<ChannelId, Array<Question>>();
}