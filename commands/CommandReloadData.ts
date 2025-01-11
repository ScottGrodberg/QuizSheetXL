import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Data } from "../Data";
import { ICommand } from "./ICommand";

const { token, guildId, dataUrl } = require("../config.json");
export class CommandReloadData implements ICommand {

    public commandName = "reload";

    constructor(public data: Data) { }

    getCommand(): any {
        const command = new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription("Reload the data");
        return command;
    }

    processCommand(interaction: ChatInputCommandInteraction): void {
        const request = require("request");
        const XLSX = require("xlsx");

        request.get(dataUrl, { encoding: null }, function (err: any, res: any, data: any) {
            if (err || res.statusCode != 200) {
                console.log(res.statusCode);
                return;
            }
            const buf = Buffer.from(data);
            const workbook = XLSX.read(buf);

            var sheet1 = workbook.Sheets[workbook.SheetNames[0]];
            console.log(XLSX.utils.sheet_to_json(sheet1));
            interaction.reply(`Reloaded the data`);
        });

    }

}