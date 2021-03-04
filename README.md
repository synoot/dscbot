# Discord Bot v2

Another rewrite. This will likely become the main branch in the future.

## Planned additions

* Change the integrated systems (commands & xp) into a plugin-like structure, to allow fully reloading them at run time
* Add an HTTP server module that lets someone configure the bot from a website
* Allow -reload to reload modules

## Planned module structure

Modules will be an ES6 module, and it'd export a main function that takes in parameters.
The point of modules are to separate systems that rely solely on the index file into other files, to allow dynamic changes, and to tidy the index file.

Modules may be disabled, and will export commands - disabled modules' commands are not registered.

For example, here's what a theoretical XP module would do:

xp_main(msg, guild_id) -> gets guild options, if enabled, does xp calculations, and saves data

command_main(msg, guild_id) -> checks if the message mentions a command, and runs it