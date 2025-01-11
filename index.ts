import { Client, GatewayIntentBits, Events } from "discord.js";

import { Data } from "./Data";
import { CommandQuestion } from "./commands/CommandQuestion";
import { CommandAnswer } from "./commands/CommandAnswer";
import { CommandReloadData } from "./commands/CommandReloadData";

const { token, guildId } = require("./config.json");

const data = new Data();
const commandReloadData = new CommandReloadData(data);
const commandQuestion = new CommandQuestion(data);
const commandAnswer = new CommandAnswer(data);
const commands = [
    commandReloadData,
    commandQuestion,
    commandAnswer
];

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.once(Events.ClientReady, client => {
    console.log(`Logged into discord as ${client.user.tag}`);

    commands.forEach(command => {
        client.application.commands.create(command.getCommand(), guildId);
    });

    // Load the sheet data for the first time
    const interaction = { reply: () => { } } as any;
    commands[0].processCommand(interaction);

});

client.on(Events.InteractionCreate, interaction => processCommand(interaction));

client.on(Events.MessageCreate, message => { });

client.login(token);

function processCommand(interaction: any) {
    commands.forEach(command => {
        if (command.commandName === interaction.commandName) {
            command.processCommand(interaction);
        }
    });

}