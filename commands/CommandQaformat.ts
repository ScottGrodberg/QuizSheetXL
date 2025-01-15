import { ActionRowBuilder, ActionRowComponent, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ChatInputCommandInteraction, Component, Interaction, SlashCommandBuilder } from "discord.js";
import { Data, User, UserId } from "../Data";
import { ICommand } from "./ICommand";
import { IButtonUpdater } from "./IButtonUpdater";

export class CommandQaformat implements ICommand, IButtonUpdater {
    public commandName = "qaformat";

    constructor(public data: Data) { }

    getCommand(): any {
        const command = new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription("Change the question and answers formats");
        return command;
    }

    processCommand(interaction: ChatInputCommandInteraction): void {
        interaction.reply({
            content: `1st row question format. 2nd row answer format`,
            components: this.getConfigComponents(interaction.user.id)
        });
    }

    getConfigComponents(userId: UserId): Array<ActionRowBuilder<ButtonBuilder>> {
        const user = this.data.users.get(userId)!;
        return [
            this.getQARow(user.question, "question", user),
            this.getQARow(user.answer, "answer", user)
        ]
    }

    getQARow(set: Set<number>, rowType: string, user: User): ActionRowBuilder<ButtonBuilder> {
        const buttons = new Array<ButtonBuilder>();
        for (let i = 0; i < user.server.columns.length; i++) {
            const buttonStyle = set.has(i) ? ButtonStyle.Primary : ButtonStyle.Secondary;
            const button = new ButtonBuilder()
                .setCustomId(`button-${rowType}-${i}`)
                .setLabel(user.server.columns[i])
                .setStyle(buttonStyle);

            buttons.push(button);
        }

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(buttons);

        return row;

    }

    updateConfig(interaction: ButtonInteraction<CacheType>) {
        const user = this.data.users.get(interaction.user.id)!;
        const idSplit = interaction.customId.split("-");
        const rowType = idSplit[1];
        const index = parseInt(idSplit[2]);
        const on = interaction.component.style === ButtonStyle.Secondary;
        switch (rowType) {
            case "question":
                if (on) {
                    user.question.add(index);
                } else {
                    user.question.delete(index);
                }
                break;
            case "answer":
                if (on) {
                    user.answer.add(index);
                } else {
                    user.answer.delete(index);
                }
                break;
        }
        console.log(`Updated qa formats`);
    }
}