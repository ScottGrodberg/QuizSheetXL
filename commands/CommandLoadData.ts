import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Data, Sheet } from "../Data";
import { ICommand } from "./ICommand";

const XLSX = require("xlsx");

export class CommandLoadData implements ICommand {

    public commandName = "reload";

    constructor(public data: Data) { }

    getCommand(): any {
        const command = new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription("Reload the data");
        return command;
    }

    async processCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const user = this.data.users.get(interaction.user.id)!;
        return fetch(user.server.sheetUrl).then(
            async (value: Response) => {
                await this.loadSheet(interaction, value);
            },
            (reason: any) => {
                console.log(reason);
            }
        );
    }

    async loadSheet(interaction: ChatInputCommandInteraction, response: Response) {
        const user = this.data.users.get(interaction.user.id)!;

        const htmlText = await response.text();
        const buf = Buffer.from(htmlText);
        const workbook = XLSX.read(buf);

        const sheetNames = this.getSheetNames(htmlText);
        if (sheetNames.length === 0) {
            return;
        }

        user.server.sheets = [];
        let reply = "";
        for (let i = 0; i < sheetNames.length; i++) {

            var wbSheet = workbook.Sheets[workbook.SheetNames[i]];
            const jsonSheet = XLSX.utils.sheet_to_json(wbSheet, { defval: "", raw: false });

            const sheet = new Sheet();
            reply += this.processSheet(jsonSheet, sheet, sheetNames[i]);

            user.server.sheets.push(sheet);
        }

        console.log(reply);
        interaction.reply(reply);

    }

    getSheetNames(htmlText: string): Array<string> {
        const matches = [...htmlText.matchAll(/docs-sheet-tab-caption">([0-9A-Za-z_\s]+)</g)];
        if (matches.length === 0) {
            console.error(`Did not find any sheets`);
            return [];
        }
        if (matches.some(m => m.length < 2)) {
            console.error(`Did not find sheet name`);
            return [];
        }
        const sheetNames = matches.map(m => m[1]);
        return sheetNames;
    }

    processSheet(jsonSheet: any, sheet: Sheet, sheetName: string): string {

        let reply = "";

        // Determine columns existence from the header
        const header = Object.values(jsonSheet[0]).slice(1).filter((v: any) => v.length > 0);
        const nCols = Math.min(header.length, Data.MAX_COLUMNS);
        const columns = header.slice(0, nCols) as Array<string>;

        // Import the data
        const _sheet = new Array<Array<string>>();
        for (let i = 1; i < jsonSheet.length; i++) {
            const values = Object.values(jsonSheet[i]).slice(1, nCols + 1) as Array<string>;
            if (values.every(v => v.length === 0)) {
                // empty row, don't import it
                continue;
            }
            _sheet.push(values);
        }
        sheet.columns = columns;
        sheet.data = _sheet;
        reply += `Imported ${jsonSheet.length} records from sheet ${sheetName}.\n`;
        if (header.length > Data.MAX_COLUMNS) {
            reply += `Only the leftmost ${Data.MAX_COLUMNS} columns were taken.\n`;
        }

        // Import categories
        const categories = new Set<string>();
        const indexCategory = columns.findIndex(column => column === "Category")
        if (indexCategory > -1) {
            for (let i = 0; i < _sheet.length; i++) {
                if (_sheet[i][indexCategory].length > 0) {
                    categories.add(_sheet[i][indexCategory]);
                }
            }
            sheet.categories = Array.from(categories);
            sheet.categoryColIdx = indexCategory;
            if (sheet.categories.length > Data.MAX_COLUMNS) {
                sheet.categories = sheet.categories.slice(0, Data.MAX_COLUMNS); // same as button limit
                reply += `Only took the first ${Data.MAX_COLUMNS} categories,\n`;
            }
        } else {
            reply += "If you want to filter the data, you need a column named Category.\n"
        }

        return reply;

    }
}