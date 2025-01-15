import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, CacheType, Interaction, SlashCommandBuilder } from "discord.js";

export interface IButtonUpdater {
    updateConfig(interaction: ButtonInteraction<CacheType>): void;
    getConfigComponents(): Array<ActionRowBuilder<ButtonBuilder>>;
}