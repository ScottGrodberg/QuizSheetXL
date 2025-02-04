import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Data } from "../Data";
import { ICommand } from "./ICommand";
import { CommandLoadData } from "./CommandLoadData";


export class CommandSheet implements ICommand {
    public commandName = "sheet";

    constructor(public data: Data, public commandLoadData: CommandLoadData) { }

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

    async processCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const user = this.data.users.get(interaction.user.id)!;
        const url = interaction.options.getString("url")!;
        // TODO: Validate url
        user.server.sheetUrl = url;
        await this.commandLoadData.processCommand(interaction);

        // All users in a server share the sheet.
        // Since the sheet has just been changed,
        //   all users state must be reset.
        // Sorry to other users.
        this.data.users.forEach(_user => {
            if (_user.server !== user.server) {
                return;
            }
            this.data.rollbackQA(_user);
            this.data.setCategoriesToAll(_user);
        });

    }
}