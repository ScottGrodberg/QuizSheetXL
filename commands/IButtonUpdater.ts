import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, CacheType, Interaction, SlashCommandBuilder } from "discord.js";
import { UserId } from "../Data";

export interface IButtonUpdater {
    updateConfig(interaction: ButtonInteraction<CacheType>): void;
    getConfigComponents(userId: UserId): Array<ActionRowBuilder<ButtonBuilder>>;
}