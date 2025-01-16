import { Interaction, SlashCommandBuilder } from "discord.js";

export interface ICommand {
    commandName: string;
    getCommand(): SlashCommandBuilder;
    processCommand(interaction: Interaction): void;
}