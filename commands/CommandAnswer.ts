import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Data, User } from "../Data";
import { ICommand } from "./ICommand";

export class CommandAnswer implements ICommand {
    public commandName = "answer";

    constructor(public data: Data) { }

    getCommand(): any {
        const command = new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription("Toggle answer column")
            .addNumberOption(option =>
                option.setName('index')
                    .setDescription('The column index')
                    .setRequired(true)
            ).addBooleanOption(option =>
                option.setName('include')
                    .setDescription('Include?')
                    .setRequired(true)
            );
        return command;
    }

    processCommand(interaction: ChatInputCommandInteraction): void {

        const index = interaction.options.getNumber("index")!;
        const include = interaction.options.getBoolean("include")!;

        let user = this.data.users.get(interaction.user.id);
        if (!user) {
            user = new User(interaction.user.id, interaction.channelId);
            this.data.users.set(interaction.user.id, user);
        }

        if (include) {
            this.data.answer.add(index);
            interaction.reply(`Added column ${index} to the answer format`);
        } else {
            this.data.answer.delete(index);
            interaction.reply(`Removed column ${index} from the answer format`);
        }

    }

}