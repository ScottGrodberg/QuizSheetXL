import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ChatInputCommandInteraction, SlashCommandBuilder, User } from "discord.js";
import { Data, UserId } from "../Data";
import { ICommand } from "./ICommand";
import { IButtonUpdater } from "./IButtonUpdater";

export class CommandCategory implements ICommand, IButtonUpdater {
    public commandName = "category";

    constructor(public data: Data) { }

    getCommand(): any {
        const command = new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription("Change the categories to work with");
        return command;
    }

    processCommand(interaction: ChatInputCommandInteraction): void {
        interaction.reply({
            content: `Select/deselect one or more categories`,
            components: this.getConfigComponents(interaction.user.id)
        });
    }

    getConfigComponents(userId: UserId): Array<ActionRowBuilder<ButtonBuilder>> {
        return [
            this.getCategoriesRow("category", userId)
        ]
    }

    getCategoriesRow(rowType: string, userId: UserId): ActionRowBuilder<ButtonBuilder> {
        const user = this.data.users.get(userId)!;
        const buttons = new Array<ButtonBuilder>();
        for (let i = 0; i < user.server.categories.length; i++) {
            const category = user.server.categories[i];
            const buttonStyle = user.currentCategories.has(category) ? ButtonStyle.Primary : ButtonStyle.Secondary;
            const button = new ButtonBuilder()
                .setCustomId(`button-${rowType}-${category}`)
                .setLabel(`${category}`)
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
        const category = idSplit[2];
        const on = interaction.component.style === ButtonStyle.Secondary;
        if (on) {
            user.currentCategories.add(category);
        } else {
            user.currentCategories.delete(category);
        }
        this.data.buildSheetSubset(interaction.user.id);
        console.log(`Updated categories`);
    }
}