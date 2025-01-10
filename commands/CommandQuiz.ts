import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Data } from "../Data";
import { ICommand } from "./ICommand";

export class CommandQuiz implements ICommand {
    public commandName = "quiz";

    constructor(public data: Data) { }

    getCommand(): any {
        const command = new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription("Start a new quiz");
        return command;
    }

    processCommand(interaction: ChatInputCommandInteraction): void {
        // Reset the points to 0 for all users in this channel
        [...this.data.users.values()]
            .filter(user => user.channelId === interaction.channelId)
            .forEach(user => user.points = 0);

        interaction.reply(`Starting a new quiz, all points reset`);
    }

}