import { Client, GatewayIntentBits, Events, Message } from "discord.js";

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

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once(Events.ClientReady, client => {
    console.log(`Logged into discord as ${client.user.tag}`);

    commands.forEach(command => {
        client.application.commands.create(command.getCommand(), guildId);
    });

    // Load the sheet data for the first time
    const interaction = { reply: () => { } } as any;
    commands[0].processCommand(interaction);

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
}

function question(interaction: any) {
    // don't reply to self
    if (interaction.author == client.user || interaction.author?.bot) {
        return
    }
    if (data.currentQuestion === -1) {
        // Randomly choose a question
        data.currentQuestion = Math.floor(Math.random() * data.sheet.length);

        // reset the answers, get ready to assign
        data.currentAnswers = [-1, -1, -1, -1];

        // Randomly put the correct answer in one of the four slots        
        data.currentAnswers[Math.floor(Math.random() * 4)] = data.currentQuestion;

        // Start building a set to hold the answers, add the current question as one of the possible chocies
        const answerSet = new Set<number>();
        answerSet.add(data.currentQuestion);

        // Randomly choose 3 more (incorrect) answers
        while (answerSet.size < 4) {
            answerSet.add(Math.floor(Math.random() * data.sheet.length)); // +1 to not select the header row
        }

        // Remove the answer that was blocking a random choice
        answerSet.delete(data.currentQuestion);

        // Iterate the answers, if still needs to be filled then fill it, otherwise skip over        
        const answerArray = Array.from(answerSet);
        for (let i = 0; i < 4; i++) {
            if (data.currentAnswers[i] !== -1) {
                continue;
            }
            data.currentAnswers[i] = answerArray.shift()!;
        }
    }

    let output = "";
    for (let i = 0; i < 4; i++) {
        if (data.question.has(i)) {
            output += data.sheet[data.currentQuestion][i] + " ";
        }
    }
    output += "\n";

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (data.answer.has(j)) {
                output += (i + 1) + " " + data.sheet[data.currentAnswers[i]][j] + "  ";
            }
        }
    }
    interaction.reply(`${output}`);
}

function answer(interaction: any) {
    // don't reply to self
    if (interaction.author == client.user || interaction.author.bot) {
        return
    }
    const _interaction = interaction as Message;
    const content = _interaction.content;
    if (content.length !== 1) {
        return;
    }
    const match = content.match(/\d/);
    if (!match) {
        return;
    }
    const index = parseInt(match[0]);
    if (index < 1 || index > 4) {
        return;
    }
    if (data.currentAnswers[index - 1] === data.currentQuestion) {
        _interaction.reply(`Correct`);
        data.currentQuestion = -1;
    } else {
        _interaction.reply(`Wrong`);
    }

}