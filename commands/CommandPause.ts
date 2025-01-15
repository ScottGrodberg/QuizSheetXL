import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Data, UserId } from "../Data";
import { ICommand } from "./ICommand";
import { IButtonUpdater } from "./IButtonUpdater";

export class CommandPause implements ICommand, IButtonUpdater {
    public commandName = "pause";

    constructor(public data: Data) { }

    getCommand(): any {
        const command = new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription("Change the length of pause");
        return command;
    }

    processCommand(interaction: ChatInputCommandInteraction): void {
        interaction.reply({
            content: `Pause after asking a question, before showing the answers`,
            components: this.getConfigComponents(interaction.user.id)
        });
    }

    getConfigComponents(userId: UserId): Array<ActionRowBuilder<ButtonBuilder>> {
        return [
            this.getPauseRow("pause", userId)
        ]
    }

    getPauseRow(rowType: string, userId: UserId): ActionRowBuilder<ButtonBuilder> {
        const buttons = new Array<ButtonBuilder>();
        const user = this.data.users.get(userId)!;

        for (let i = 0; i < 4; i++) {
            const buttonStyle = user.pauseSeconds === i ? ButtonStyle.Primary : ButtonStyle.Secondary;
            const button = new ButtonBuilder()
                .setCustomId(`button-${rowType}-${i}`)
                .setLabel(`${i} seconds`)
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
        const index = parseInt(idSplit[2]);
        const on = interaction.component.style === ButtonStyle.Secondary;
        if (on) {
            user.pauseSeconds = index;
        }
        console.log(`Updated pause length`);
    }
}