import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Data, Question, QuestionType, User } from "../Data";
import { ICommand } from "./ICommand";

export class CommandQ implements ICommand {
    public commandName = "q";

    constructor(public data: Data) { }

    getCommand(): any {
        const command = new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription("Create a new question")
            .addStringOption(option =>
                option.setName('qtype')
                    .setDescription('The type of question')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Multiple Choice', value: 'MULTI_CHOICE' },
                        { name: 'True or False', value: 'TRUE_FALSE' }
                    )
            ).addStringOption(option =>
                option.setName('text')
                    .setDescription('The text of the question')
                    .setRequired(true)
            );
        return command;
    }

    processCommand(interaction: ChatInputCommandInteraction): void {
        // Make a new question
        const qType = interaction.options.getString("qtype")! as QuestionType;
        const text = interaction.options.getString("text")!;
        const question = new Question(qType, text);

        // Add ref to the record map
        this.data.questions.set(question.id, question);

        // Create a user if not exists and add ref to question
        let user = this.data.users.get(interaction.user.id);
        if (!user) {
            user = new User(interaction.user.id, interaction.channelId);
            this.data.users.set(interaction.user.id, user);
        }
        user.question = question;

        let _questions: Array<Question> | undefined = this.data.channels.get(interaction.channelId);
        if (!_questions) {
            _questions = new Array();
            this.data.channels.set(interaction.channelId, _questions);
        }
        _questions.push(question);

        interaction.reply("Starting a new question");
    }

}