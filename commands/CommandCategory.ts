import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Data } from "../Data";
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
            components: this.getConfigComponents()
        });
    }

    getConfigComponents(): Array<ActionRowBuilder<ButtonBuilder>> {
        return [
            this.getCategoriesRow("category")
        ]
    }

    getCategoriesRow(rowType: string): ActionRowBuilder<ButtonBuilder> {
        const buttons = new Array<ButtonBuilder>();
        for (let i = 0; i < this.data.categories.length; i++) {
            const category = this.data.categories[i];
            const buttonStyle = this.data.currentCategories.has(category) ? ButtonStyle.Primary : ButtonStyle.Secondary;
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
        const idSplit = interaction.customId.split("-");
        const category = idSplit[2];
        const on = interaction.component.style === ButtonStyle.Secondary;
        if (on) {
            this.data.currentCategories.add(category);
        } else {
            this.data.currentCategories.delete(category);
        }
        console.log(`Updated categories`);
    }
}