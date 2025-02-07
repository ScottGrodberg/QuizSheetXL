import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Data } from "../Data";
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
                await this.loadSheet(interaction, value).then(reply => {
                    console.log(reply);
                    interaction.reply(reply);
                })
            },
            (reason: any) => {
                console.error(reason);
            }
        );
    }

    async loadSheet(interaction: ChatInputCommandInteraction, response: Response): Promise<string> {

        let reply = "";

        const user = this.data.users.get(interaction.user.id)!;

        const res = await response.text();
        const buf = Buffer.from(res);

        let workbook;
        try {
            workbook = XLSX.read(buf);
        } catch (ex) {
            console.error(ex);
            reply += `Problem reading the sheet. Is it public? See the detailed error logged from the server.`;
            return reply;
        }

        var sheet1 = workbook.Sheets[workbook.SheetNames[0]];
        const arySheet = XLSX.utils.sheet_to_json(sheet1, { defval: "", raw: false });

        // Determine columns existence from the header
        const header = Object.values(arySheet[0]).slice(1).filter((v: any) => v.length > 0);
        const nCols = Math.min(header.length, Data.MAX_COLUMNS);
        const columns = header.slice(0, nCols) as Array<string>;

        // Import the data
        const sheet = new Array<Array<string>>();
        for (let i = 1; i < arySheet.length; i++) {
            const values = Object.values(arySheet[i]).slice(1, nCols + 1) as Array<string>;
            if (values[0].trim().length === 0 || values[1].trim().length === 0) {
                // empty row, don't import it
                continue;
            }
            sheet.push(values);
        }
        user.server.columns = columns;
        user.server.sheet = sheet;
        reply += `Imported ${sheet.length} records. `;
        if (header.length > Data.MAX_COLUMNS) {
            reply += `Only the leftmost ${Data.MAX_COLUMNS} columns were taken. `;
        }

        // Reset the server's categories
        user.server.categories = new Array<string>();
        user.server.categoryColIdx = -1;

        const indexCategory = columns.findIndex(column => column === "Category")
        if (indexCategory > -1) {
            // Build up the server's categories
            const categories = new Set<string>();
            for (let i = 0; i < sheet.length; i++) {
                if (sheet[i][indexCategory].length > 0) {
                    categories.add(sheet[i][indexCategory]);
                }
            }
            user.server.categories = Array.from(categories);
            user.server.categoryColIdx = indexCategory;
            if (user.server.categories.length > Data.MAX_COLUMNS) {
                user.server.categories = user.server.categories.slice(0, Data.MAX_COLUMNS); // same as button limit
                reply += `Only took the first ${Data.MAX_COLUMNS} categories`;
            }
        } else {
            reply += "If you want to filter the data, you need a column named Category. "
        }

        return reply;
    }
}