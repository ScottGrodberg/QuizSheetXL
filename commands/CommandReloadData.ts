import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Data } from "../Data";
import { ICommand } from "./ICommand";

const request = require("request");
const XLSX = require("xlsx");

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
        request.get(this.data.sheetUrl, { encoding: null }, this.requestCallback.bind(this, interaction));
    }

    requestCallback(interaction: ChatInputCommandInteraction, err: any, res: any, data: any) {
        if (err || res.statusCode != 200) {
            console.log(`Error getting sheet: ${res?.statusCode}`);
            return;
        }
        const buf = Buffer.from(data);
        const workbook = XLSX.read(buf);

        var sheet1 = workbook.Sheets[workbook.SheetNames[0]];
        const arySheet = XLSX.utils.sheet_to_json(sheet1);

        const columns = Object.values(arySheet[0]).slice(1) as Array<string>;
        const sheet = new Array<Array<string>>(); // a 2d array

        for (let i = 1; i < arySheet.length; i++) {
            const values = Object.values(arySheet[i]) as Array<string>;
            if (values.length < columns.length) {
                // empty row, next
                continue;
            }
            sheet.push(values.slice(1));
        }
        this.data.sheet = sheet;
        this.data.columns = columns;
        interaction.reply(`Reloaded the data`);
    }
}