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
        request.get(this.data.sheetUrl, { encoding: null }, this.loadSheetFromResponse.bind(this, interaction));
    }

    loadSheetFromResponse(interaction: ChatInputCommandInteraction, err: any, res: any, data: any) {
        if (err || res.statusCode != 200) {
            console.log(`Error getting sheet: ${res?.statusCode}`);
            return;
        }
        const buf = Buffer.from(data);
        const workbook = XLSX.read(buf);

        var sheet1 = workbook.Sheets[workbook.SheetNames[0]];
        const arySheet = XLSX.utils.sheet_to_json(sheet1, { defval: "" });

        let reply = "";

        // determine the columns from the header
        const header = Object.values(arySheet[0]).slice(1).filter((v: any) => v.length > 0);
        const nCols = Math.min(header.length, this.data.MAX_COLUMNS);
        const columns = header.slice(0, nCols) as Array<string>;

        const sheet = new Array<Array<string>>(); // a 2d array

        for (let i = 1; i < arySheet.length; i++) {
            const values = Object.values(arySheet[i]) as Array<string>;
            if (values.every(v => v.length === 0)) {
                // empty row, next
                continue;
            }
            sheet.push(values.slice(1, nCols + 1));
        }
        this.data.sheet = sheet;
        this.data.columns = columns;
        reply += `Imported ${sheet.length} records. `;
        if (header.length > this.data.MAX_COLUMNS) {
            reply += "Only the leftmost 5 columns were taken. "
        }
        interaction.reply(reply);
    }
}