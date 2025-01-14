import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Data } from "../Data";
import { ICommand } from "./ICommand";
import { CommandReloadData } from "./CommandReloadData";


export class CommandSheet implements ICommand {
    public commandName = "sheet";

    constructor(public data: Data, public commandReloadData: CommandReloadData) { }

    getCommand(): any {
        const command = new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription("Specify the g sheet url")
            .addStringOption(option =>
                option
                    .setName('url')
                    .setDescription('The url of the sheet')
                    .setRequired(true)
            );
        return command;
    }

    processCommand(interaction: ChatInputCommandInteraction): void {
        const url = interaction.options.getString("url")!;
        // TODO: Validate url
        this.data.sheetUrl = url;
        this.commandReloadData.processCommand(interaction);

    }
}