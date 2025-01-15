import { ActionRowBuilder, ActionRowComponent, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ChatInputCommandInteraction, Component, Interaction, SlashCommandBuilder } from "discord.js";
import { Data, User } from "../Data";
import { ICommand } from "./ICommand";
import { IButtonUpdater } from "./IButtonUpdater";

export class CommandConfig implements ICommand, IButtonUpdater {
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
            content: `1st row question format. 2nd row answer format`,
            components: this.getConfigComponents()
        });
    }

    getConfigComponents(): Array<ActionRowBuilder<ButtonBuilder>> {
        return [
            this.getQARow(this.data.question, "question"),
            this.getQARow(this.data.answer, "answer")
        ]
    }

    getQARow(set: Set<number>, rowType: string): ActionRowBuilder<ButtonBuilder> {
        const buttons = new Array<ButtonBuilder>();
        for (let i = 0; i < this.data.columns.length; i++) {
            const buttonStyle = set.has(i) ? ButtonStyle.Primary : ButtonStyle.Secondary;
            const button = new ButtonBuilder()
                .setCustomId(`button-${rowType}-${i}`)
                .setLabel(this.data.columns[i])
                .setStyle(buttonStyle);

            buttons.push(button);
        }

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(buttons);

        return row;

    }

    updateConfig(interaction: ButtonInteraction<CacheType>) {
        const idSplit = interaction.customId.split("-");
        const rowType = idSplit[1];
        const index = parseInt(idSplit[2]);
        const on = interaction.component.style === ButtonStyle.Secondary;
        switch (rowType) {
            case "question":
                if (on) {
                    this.data.question.add(index);
                } else {
                    this.data.question.delete(index);
                }
                break;
            case "answer":
                if (on) {
                    this.data.answer.add(index);
                } else {
                    this.data.answer.delete(index);
                }
                break;
        }
        console.log(`Updated config`);
    }
}