import { Client, GatewayIntentBits, Events, Message, OmitPartialGroupDMChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, Guild, Interaction } from "discord.js";
import { Data, Server, ServerId, User, UserId } from "./Data";
import { CommandLoadData } from "./commands/CommandLoadData";
import { CommandQaformat } from "./commands/CommandQaformat";
import { CommandSheet } from "./commands/CommandSheet";
import { CommandPause } from "./commands/CommandPause";
import { IButtonUpdater } from "./commands/IButtonUpdater";
import { CommandCategory } from "./commands/CommandCategory";

const { token } = require("./config.json");

const data = new Data();

const commandCategory = new CommandCategory(data);
const commandQaformat = new CommandQaformat(data);
const commandPause = new CommandPause(data);
const commandLoadData = new CommandLoadData(data);
const commandSheet = new CommandSheet(data, commandLoadData);
const commands = [
    commandCategory,
    commandQaformat,
    commandPause,
    commandLoadData,
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

});

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.user == client.user || interaction.user.bot) {
        return
    }
    await checkMakeUserAndServer(interaction.guildId!, interaction.user.id);
    processCommand(interaction);
});

client.on(Events.MessageCreate, async message => {
    if (message.author == client.user || message.author.bot) {
        return
    }
    await checkMakeUserAndServer(message.guildId!, message.author.id);
    processAnswer(message);
    question(message);
});

client.login(token);

async function checkMakeUserAndServer(serverId: ServerId, userId: UserId): Promise<any> {

    // check and create server
    let newServer = false;
    let server = data.servers.get(serverId);
    if (!server) {
        server = new Server(serverId);
        data.servers.set(server.serverId, server);
        newServer = true;
    }

    // check and create user
    let newUser = false;
    let user = data.users.get(userId);
    if (!user) {
        user = new User(userId, server);
        data.users.set(user.userId, user);
        newUser = true;
    }

    // Update the server in case the user moved
    user.server = server;

    if (newServer) {
        // Load the data sheet
        const interaction = { reply: () => { }, user: { id: userId } } as any;
        await commandLoadData.processCommand(interaction);
    }

    if (newUser) {
        // Show all categories
        data.setCategoriesToAll(user);
    }

}

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
        command = commandQaformat;
    } else if (buttonId === "pause") {
        command = commandPause;
    } else if (buttonId === "category") {
        command = commandCategory;
    } else {
        console.error(`Unexpected button id`);
        return;
    }
    command.updateConfig(interaction);
    interaction.update({
        components: command.getConfigComponents(interaction.user.id)
    });
}

function question(message: OmitPartialGroupDMChannel<Message<boolean>>) {

    const user = data.users.get(message.author.id)!;

    if (user.currentQuestion === -1) {
        // No question is currently selected, select one now
        const madeQA = selectQuestionAndAnswers(user);
        if (!madeQA) {
            message.channel.send(`I did not find a valid question and answers. Make sure to select enough categories so that there are at least 3 available rows to chose from`);
            return;
        }
    }

    // Output the question
    let question = "";
    for (let i = 0; i < user.server.columns.length; i++) {
        if (user.qColumns.has(i)) {
            question += user.server.sheet[user.currentQuestion][i] + " ";
        }
    }
    message.channel.send(`${question}`);

    setTimeout(() => {
        // Pause, and then output the answers
        let answers = "";
        for (let i = 0; i < Data.N_ANSWERS; i++) {
            answers += `     ${(i + 1)}. `;
            for (let j = 0; j < user.server.columns.length; j++) {
                const rowId = user.currentAnswers[i];
                if (rowId === -1) {
                    continue;
                }
                if (user.aColumns.has(j)) {
                    answers += user.server.sheet[rowId][j] + "  ";
                }
            }
        }
        message.channel.send(`${answers}`);
    }, user.pauseSeconds * 1000);

}


function selectQuestionAndAnswers(user: User): boolean {

    // Randomly choose a question
    user.currentQuestion = user.sheetSubsetRowIds[Math.floor(Math.random() * user.sheetSubsetRowIds.length)];

    // reset the answers, get ready to assign
    user.currentAnswers.fill(-1);

    // Randomly put the correct answer in one of the slots        
    user.currentAnswers[Math.floor(Math.random() * Data.N_ANSWERS)] = user.currentQuestion;

    // Start building a set to hold the answers, add the current question as one of the possible chocies
    const answerSet = new Set<number>();
    answerSet.add(user.currentQuestion);

    // Randomly choose n-1 more (incorrect) answers from the subset
    let retries = 20; // in case there are fewer rows in a category than N_ANSWERS
    while (answerSet.size < Data.N_ANSWERS && retries > 0) {
        answerSet.add(user.sheetSubsetRowIds[Math.floor(Math.random() * user.sheetSubsetRowIds.length)]); // +1 to not select the header row
        retries--;
    }

    // Remove the answer that was blocking a random choice
    answerSet.delete(user.currentQuestion);

    if (answerSet.size === 0) {
        // Not enough answers, possibly due to underselected or underpopulated categories
        // Roll everything back
        data.rollbackQA(user);
        return false;
    }

    // Iterate the answers, if still needs to be filled then fill it, otherwise skip over        
    const answerArray = Array.from(answerSet);
    for (let i = 0; i < Data.N_ANSWERS; i++) {
        if (answerArray.length === 0) {
            // we've exhausted the answerSet, probably due to an under-populated category
            break;
        }
        if (user.currentAnswers[i] !== -1) {
            continue;
        }
        user.currentAnswers[i] = answerArray.shift()!;
    }
    return true;
}

function processAnswer(message: OmitPartialGroupDMChannel<Message<boolean>>) {

    const user = data.users.get(message.author.id)!;
    const content = message.content;
    if (content.length !== 1) {
        return;
    }
    const match = content.match(/\d/);
    if (!match) {
        return;
    }
    const index = parseInt(match[0]);
    if (index < 1 || index > user.currentAnswers.length) {
        return;
    }
    if (user.currentAnswers[index - 1] === user.currentQuestion) {
        message.channel.send(`Correct`);
        user.currentQuestion = -1;
    } else {
        message.channel.send(`Wrong`);
    }

}
