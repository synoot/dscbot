# V3 overview
This is a Discord Bot. It doesn't function like some may think a bot works - instead of directly processing commands, running logic, etc. in one file, it has a split structure, one that I hope is easier to edit and provides a tidier codebase as a learning resource.

# V3: Modules
Modules are not a new concept for V3. It was in the last version, which is *probably* on the master branch right now. The core concept is that it has a function which is called for every message, and it processes said message. They can have commands and are handled separately. They can also be enabled / disabled.

The idea behind this was to have some organization behind reused pieces of code - as an example, if you had a long snippet of code that increments a counter for every message, it would most likely be a good idea to put that into a module. Not only is it easier to edit, but it helps people sift through your codebase when looking for code to improve or just to learn from.

Modules are stored in the `src/modules` directory. IntelliSense should guide you; but you should also be able to look at other modules (if or when they're added).

# V3: Commands
Commands are also not a new concept for V3, as a surprise to no one. Commands are usually called by the Commands module, which cannot be disabled per-guild. At their very basic, commands are objects with names and a preset prefix. For example, if the prefix was `-` and the command name was `foobar`, the Commands module would check if `-foobar` existed in it's command list. This is an important distinction to make - **commands are not just stored by name.** To make my life easier, I decided to make the command register its name AND prefix. So, in the example before, `foobar` is a command that *doesn't really exist.* `-foobar` points to the `foobar` command, everyone is happy.

Commands are categorized by their parent directory - which means that commands stored in `src/commands` are technically under the `Uncategorized` category. If you had a command stored under `src/commands/foo`, it's category would be `foo`. This is used to make the help command look nice and also for organization. The maximum depth is one, so it won't detect `src/commands/foo/bar`.

# V3: Slash Commands
Slash commands, however, are a new concept for V3. The plan for this subset of commands is unclear. Slash commands have no prefix, they have a name, callback, and description. For example, if you wanted to make the `-foobar` command from earlier into a slash command, you would call it by doing `/foobar`. Slash commands are *formally registered on the Discord guild.* There are also some slash command limitations, if you don't feel like reading the Discord documentation:

1. You may only register 100 top-level, uncategorized slash commands, globally.
    * Global commands cannot share the same name.
    * Global commands take, at most, 1 hour to update.
2. You may only register 100 top-level, uncategorized slash commands, per guild.
    * Guild commands cannot share the same name.
    * Guild commands and global commands can share the same name.
    * Multiple applications can have commands with the same name.
    * Guild commands update instantly.
3. You must send an initial response to a command request (dubbed an Interaction) within 3 seconds, but you can send multiple responses afterwards for up to 15 minutes.

## Subcommands

Subcommands are different from regular slash commands - imagine you had a command named `/counter` that has two possible actions - `increment` or `decrement`. You *could* use a parameter, but you could also use a subcommand to add better autocomplete. If you had `/counter <option>` you could technically put in anything in place of `<option>`. If you added a subcommand, however, `/counter increment` and `/counter decrement` function as two distinct commands.

## What's the deal?

Due to these differences between regular commands, and slash commands, the command class structure may change. There will be more on this as the bot develops.