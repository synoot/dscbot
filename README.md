# Discord Bot
 
This is a Discord bot made using TypeScript. The goal of this bot was
1. To learn TypeScript,
2. To make a bot with modular and programmatically defined commands

The second one is a mouthful, I know. It means that, at run time, all of the commands are loaded outside of any source files.

As in, every command in the command directory can be modified or removed, re-built, and then updated without having to restart the bot.
There are most definitely other bots like this, however, this is a large step up from most of my other bots, so I take pride in this one.

### Features

* Modular commands
* Speedy, I guess? Someone run benchmarks for me
* Mostly asynchronous
* JSON-based data persistence
* OOP-friendly data & command framework
* Fully typed and written in TypeScript
* Supports dev and production environments without installing twice

### Setting up

Setting up this bot is pretty simple.

1. Clone the repository into a new folder.
2. Add a "save" folder and "build" folder.
  * You MUST add two files: `config.json` and `main.json`.
  * Add three lines to `config.json`:
    * `token_prod` - carries the **production** token, or the bot you'd use in a public environment.
    * `token_dev` - carries the **development** token, or the bot you'd use in a private testing environment.
    * `prefix` - carries the default prefix used for commands.
3. Run `yarn dev` to log into the **development** bot, and `yarn prod` to log into the **production** bot. (Or, alternatively, compile using `tsc` and run using `node /build/index.js (prod/dev)`)
4. ???
5. Profit

### Adding commands

Adding commands is quite simple.

#### For new developers:

1. Review `commands/example.ts` for an example command.
2. Create a new TypeScript file in `commands`.
3. Follow the format in the example command.

#### Tips for older developers:

* When making a **new, barebones** command file, make sure your `exports.command` is a new Command class.
* All codepaths must return either a `CommandResponse` or throw an error/terminate.
* There is a parameter in `CommandResponse`s named `users` which is an array of UserID's which will be pinged in place of $ signs in the `message` parameter.
* There is a class named `DataHelper` (there's an exported getter for getting the `DataHelper` used in `index.ts`, so you can save to the main save file) which contains some boilerplate for fetching data.
* There is a class named `FileHelper` which contains some boilerplate for reading and writing files.

#### Loading your commands during runtime

After you have loaded your bot, there is a way to add your new commands **without completely restarting it.**

1. Open a new command line in your project's root directory.
2. Run `yarn update` (only works on Windows, since it clears the build folder)
3. Go to the bot and run `-reload`.
4. Test your new commands!