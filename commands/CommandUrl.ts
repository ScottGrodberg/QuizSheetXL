import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Data } from "../Data";
import { ICommand } from "./ICommand";
import { CommandLoadData } from "./CommandLoadData";


export class CommandUrl implements ICommand {
    public commandName = "url";

    constructor(public data: Data, public commandLoadData: CommandLoadData) { }

    getCommand(): any {
        const command = new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription("Specify the g sheet url")
            .addStringOption(option =>
                option
                    .setName('url')
                    .setDescription('The url of the xlsx data file')
                    .setRequired(true)
            );
        return command;
    }

    processCommand(interaction: ChatInputCommandInteraction): void {
        const user = this.data.users.get(interaction.user.id)!;
        const url = interaction.options.getString("url")!;
        // TODO: Validate url
        user.server.sheetUrl = url;
        this.commandLoadData.processCommand(interaction);

    }
}