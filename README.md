## Installation
1. Clone the repo
2. Cd into the folder and do `npm install`
3. Use the launch config to run locally

## Usage
1. Register the bot as a discord application https://discord.com/developers/applications
2. When making an oauth2 invite, only the bot role is necessary, access to Commands and Messages
3. Add your token and data sheet url to `config.json`
4. Invite the bot to your server and channel

## Commands
* `/sheet` tell the bot where your data sheet is
* `/reload` reload the data sheet
* `/category` lets you select which categories to study
* `/qaformat` choose which columns to work with
* `/pause` tell the bot how long to wait before showing the answers

## Notes on data sheet / import
* Takes columns from the left, assumes the first two have data in all rows
* Columns should be contiguous with no gaps between them
* I don't think I need to say this but column headers should line up with column data
* If you have any questions how this works, you can look at `CommandLoadData.ts` 

## Limits
* Discord button rows are limited to 5 buttons. Any command that uses buttons for its ui will be limited to 5 possible choices.
* g sheets are limited to 100 rows each when gotten over http, which we do
* This code does not support parsing multiple workbook sheets. Only the first sheet is taken
