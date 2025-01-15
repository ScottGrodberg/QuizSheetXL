import { Client, GatewayIntentBits, Events, Message, OmitPartialGroupDMChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, Guild } from "discord.js";
import { Data } from "./Data";
import { CommandReloadData } from "./commands/CommandReloadData";
import { CommandConfig } from "./commands/CommandConfig";
import { CommandSheet } from "./commands/CommandSheet";
import { CommandPause } from "./commands/CommandPause";
import { IButtonUpdater } from "./commands/IButtonUpdater";

const { token } = require("./config.json");

const data = new Data();

const commandConfig = new CommandConfig(data);
const commandPause = new CommandPause(data);
const commandReloadData = new CommandReloadData(data);
const commandSheet = new CommandSheet(data, commandReloadData);
const commands = [
    commandConfig,
    commandPause,
    commandReloadData,
    commandSheet
];

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once(Events.ClientReady, client => {
    console.log(`Logged into discord as ${client.user.tag}`);

    commands.forEach(command => {
        client.guilds.cache.forEach((guild: Guild) => {
            client.application.commands.create(command.getCommand(), guild.id);
        });
    });

    // Load the sheet data for the first time
    const interaction = { reply: () => { } } as any;
    commandReloadData.processCommand(interaction);

});

client.on(Events.InteractionCreate, interaction => {
    processCommand(interaction);
});

client.on(Events.MessageCreate, message => {
    answer(message);
    question(message);
});

client.login(token);

function processCommand(interaction: any) {
    commands.forEach(command => {
        if (command.commandName === interaction.commandName) {
            command.processCommand(interaction);
        }
    });

    if (!interaction.isButton()) {
        return;
    }

    // Process the button click
    const buttonId = interaction.customId.split("-")[1];
    let command: IButtonUpdater;
    if (buttonId === "answer" || buttonId === "question") {
        command = commandConfig;
    } else if (buttonId === "pause") {
        command = commandPause;
    } else {
        console.error(`Unexpected button id`);
        return;
    }
    command.updateConfig(interaction);
    interaction.update({
        components: command.getConfigComponents()
    });
}

function question(message: OmitPartialGroupDMChannel<Message<boolean>>) {

    // Don't reply to self
    if (message.author == client.user || message.author?.bot) {
        return
    }

    if (data.currentQuestion === -1) {
        // No question is currently selected, select one now
        selectQuestionAndAnswers();
    }

    // Output the question
    let question = "";
    for (let i = 0; i < data.columns.length; i++) {
        if (data.question.has(i)) {
            question += data.sheet[data.currentQuestion][i] + " ";
        }
    }
    message.channel.send(`${question}`);

    setTimeout(() => {
        // Pause, and then output the answers
        let answers = "";
        for (let i = 0; i < data.N_ANSWERS; i++) {
            for (let j = 0; j < data.columns.length; j++) {
                if (data.answer.has(j)) {
                    answers += (i + 1) + " " + data.sheet[data.currentAnswers[i]][j] + "     ";
                }
            }
        }
        message.channel.send(`${answers}`);
    }, data.pauseSeconds * 1000);

}


function selectQuestionAndAnswers() {
    // Randomly choose a question
    data.currentQuestion = Math.floor(Math.random() * data.sheet.length);

    // reset the answers, get ready to assign
    data.currentAnswers.fill(-1);

    // Randomly put the correct answer in one of the slots        
    data.currentAnswers[Math.floor(Math.random() * data.N_ANSWERS)] = data.currentQuestion;

    // Start building a set to hold the answers, add the current question as one of the possible chocies
    const answerSet = new Set<number>();
    answerSet.add(data.currentQuestion);

    // Randomly choose n-1 more (incorrect) answers
    while (answerSet.size < data.N_ANSWERS) {
        answerSet.add(Math.floor(Math.random() * data.sheet.length)); // +1 to not select the header row
    }

    // Remove the answer that was blocking a random choice
    answerSet.delete(data.currentQuestion);

    // Iterate the answers, if still needs to be filled then fill it, otherwise skip over        
    const answerArray = Array.from(answerSet);
    for (let i = 0; i < data.N_ANSWERS; i++) {
        if (data.currentAnswers[i] !== -1) {
            continue;
        }
        data.currentAnswers[i] = answerArray.shift()!;
    }

}

function answer(message: OmitPartialGroupDMChannel<Message<boolean>>) {
    // don't reply to self
    if (message.author == client.user || message.author.bot) {
        return
    }
    const content = message.content;
    if (content.length !== 1) {
        return;
    }
    const match = content.match(/\d/);
    if (!match) {
        return;
    }
    const index = parseInt(match[0]);
    if (index < 1 || index > data.columns.length) {
        return;
    }
    if (data.currentAnswers[index - 1] === data.currentQuestion) {
        message.channel.send(`Correct`);
        data.currentQuestion = -1;
    } else {
        message.channel.send(`Wrong`);
    }

}
