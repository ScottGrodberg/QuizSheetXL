import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Data, User } from "../Data";
import { ICommand } from "./ICommand";

export class CommandConfig implements ICommand {
    public commandName = "config";

    constructor(public data: Data) { }

    getCommand(): any {
        const command = new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription("Show the configuration");
        return command;
    }

    processCommand(interaction: ChatInputCommandInteraction): void {

        const confirm = new ButtonBuilder()
            .setCustomId('test')
            .setLabel('Test ')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(confirm);

        interaction.reply({
            content: `Here is the config`,
            components: [row],
        });

    }

}