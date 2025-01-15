## Installation
1. Clone the repo
2. Cd into the folder and do `npm install`
3. Use the launch config to run locally

## Usage
1. Register the bot as a discord application https://discord.com/developers/applications
2. Only bot role is necessary, specifically permissions to Commands and Messages
3. Add your token and data sheet url to `config.json`
4. Invite the bot to your server and channel

## Notes on data sheet / import
* Takes columns from the left
* Columns should be contiguous with no gaps between them
* I don't think I need to say this but column headers should line up with column data
* Due to a discord limitation on buttons, the import takes up to 5 columns
* If you have any questions how this works, you can look at `CommandLoadData.ts` 
