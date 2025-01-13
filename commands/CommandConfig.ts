import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Component, SlashCommandBuilder } from "discord.js";
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
        interaction.reply({
            content: `Here is the config`,
            components: [this.getActionRowComponents()],
        });
    }

    getActionRowComponents(): ActionRowBuilder<ButtonBuilder> {

        // Build the question format buttons
        const buttons = new Array<ButtonBuilder>();
        for (let i = 0; i < 4; i++) {
            const buttonStyle = this.data.question.has(i) ? ButtonStyle.Primary : ButtonStyle.Secondary;
            const button = new ButtonBuilder()
                .setCustomId(`button-question-${i}`)
                .setLabel(this.data.columns[i])
                .setStyle(buttonStyle);

            buttons.push(button);
        }

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(buttons);

        return row;

    }

    updateConfig() {
        console.log(`TODO: Updated config`);
    }
}