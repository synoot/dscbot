# Discord Bot
 
This is my discord bot made using TypeScript. It's designed to be mostly barebones with little hard-coded commands.
For example, try putting a command into the /commands folder *at runtime*, compile using `yarn update` (or `npm run update`, but it requires yarn either way), and run `-reload`.
You'll find any changes you've made to all of the commands, existing at runtime or not, will appear! This is done pretty simply, by just using `requireDir()` and flushing the require cache.

The framework is a tad dirty, but it works!

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

#### Tips for experienced developers:

* When making a **new, barebones** command file, make sure your `exports.command` is a new Command class.
* All codepaths must return either a `CommandResponse` or throw an error/terminate.
* There is a parameter in `CommandResponse`s named `users` which is an array of UserID's which will be pinged in place of $ signs in the `message` parameter.

#### Loading your commands during runtime

After you have loaded your bot, there is a way to add your new commands **without completely restarting it.**

1. Open a new command line in your project's root directory.
2. Run `yarn update` (only works on Windows, since it clears the build folder)
3. Go to the bot and run `-reload`.
4. Test your new commands!