import { PermissionResolvable } from 'discord.js';
import Client from '../client/Client.js';
import helpCommand from '../util/helpCommand.js';
import { Collection, Index } from 'js-augmentations';
import Command, { CommandOptions } from './Command.js';
import { isIterable } from '../util/util.js';
import { Resolvable } from '../util/types.js';
import ParameterType, { ParameterTypeResolvable } from './ParameterType.js';
import CommandGroup from './CommandGroup.js';

interface CommandManagerOptions {
    prefix?: string;
    allowBots?: boolean;
    permissions?: Iterable<PermissionResolvable>;
    automaticMessageParsing?: boolean;
    promptUserForInput?: boolean;
}

type CommandResolvable =
    | Resolvable<Command>
    | Resolvable<CommandOptions>;

class CommandManager {
    public prefix: string;
    public allowBots: boolean;
    public groups: Collection<string>;
    public commands: Index<string, Command>;
    public types: Index<string, ParameterType>;
    public permissions: Collection<PermissionResolvable>;
    public promptUserForInput: boolean;

    constructor(public client: Client, options: CommandManagerOptions = {}) {
        this.client = client;

        const { prefix, permissions, allowBots, automaticMessageParsing, promptUserForInput } = options;

        this.commands = new Index();
        this.types = new Index();
        this.groups = new Collection();
        this.permissions = new Collection();
        this.allowBots = Boolean(allowBots);
        this.promptUserForInput = typeof promptUserForInput === 'boolean' ? promptUserForInput : true;
        this.setPrefix(prefix ?? '');

        if (permissions && isIterable(permissions))
            this.permissions.push(...permissions);

        if (automaticMessageParsing ?? true)
            this.client.on('messageCreate', this.client.parseMessage);
    }

    *[Symbol.iterator]() {
        yield* this.commands.array();
    }

    /**
     * @param prefix A command prefix the bot should discriminate messages with
     * @example
     * setPrefix('$');
     */
    public setPrefix(prefix: string) {
        if (typeof prefix === 'string')
            this.prefix = prefix;

        return this;
    }

    public indexType(type: ParameterTypeResolvable): this {
        return this.indexTypes(type);
    }

    public indexTypes(...types: Resolvable<ParameterTypeResolvable>[]): this {
        types.map(i => isIterable(i) ? [...i] : i).flat().forEach(type => {
            if (!type.key)
                throw new Error('ParameterTypes must have a key set.');

            if (!type.predicate)
                throw new Error('ParameterTypes must have a predicate set.');

            this.types.set(type.key, type instanceof ParameterType ? type : new ParameterType(type));
        });

        return this;
    }

    /**
     * Add a new command to the bot; if provided name matches an existing command, the existing command will be overwritten
     * @param command An instance of the Command class or an object conforming to type CommandDetails
     * @example
     * const command = new Command()
     *      .setName('name')
     *      .setDescription('description')
     * 
     * indexCommand(command);
     */
    public indexCommand(command: CommandResolvable): this {
        return this.indexCommands(command);
    }

    /**
     * Add new commands to the bot; if provided commands match existing commands, the existing commands will be overwritten
     * @param commands Instances of the Command class or objects conforming to type CommandDetails
     * @example
     * const ping = new UniversalCommand()
     *      .setName('ping')
     *      .setDescription('Ping pong');
     * 
     * const purge = new GuildCommand()
     *      .setName('purge')
     *      .setDescription('Delete messages');
     * 
     * indexCommands(ping, purge);
     */
    public indexCommands(...commands: CommandResolvable[]): this {
        commands.map(item => isIterable(item) ? [ ...item ] : item).flat().forEach(command => {
            if (!(command instanceof Command))
                return this.indexCommands(new Command(command));

            if (!command.name)
                throw new Error('A command must have a name set.');

            if (command.group && !this.groups.has(command.group))
                throw new Error(`There is not existing command group named \'${command.group}\'; use .indexGroups(\'${command.group}\')`);

            command.aliases.forEach(alias => {
                this.commands.forEach(({ aliases, name }) => {
                    if (aliases.has(alias))
                        throw new Error(`Alias '${alias}' already exists on command '${name}'`);
                });
            });

            command.parameters.forEach(({ type }) => {
                if (type && !this.types.get(type) && !['String', 'Number', 'Boolean', 'User', 'Member', 'Channel', 'Role'].includes(type))
                    throw new Error(`There is no ParameterType with key '${type}'`);
            });

            this.commands.set(command.name, command);
        });

        return this;
    }

    public indexDefaults(): this {
        this.indexCommands(helpCommand);

        return this;
    }

    // public indexGroup(group: CommandGroup): this {
    //     return this.commandsGroups(group);
    // }

    public indexGroups(...groups: Resolvable<string>[]): this {
        groups.flat().map(item => typeof item !== 'string' && isIterable(item) ? [ ...item ] : item).flat().forEach(group => this.groups.add(group));

        return this;
    }

    public deleteCommands(...commands: CommandResolvable[] | Resolvable<string>[]): this {
        commands.flat().map(item => typeof item !== 'string' && isIterable(item) ? [ ...item ] : item).flat().forEach(command => {
            let toDelete: Command | undefined;

            if (command instanceof Command)
                toDelete = command;
            else
                toDelete = this.commands.get(typeof command === 'string' ? command : command.name);

            if (toDelete)
                this.commands.delete(toDelete.name);
        });

        return this;
    }

    public deleteGroup(group: string): this {
        return this.deleteGroups(group);
    }

    public deleteGroups(...groups: Resolvable<string>[]): this {
        groups.flat().map(item => typeof item !== 'string' && isIterable(item) ? [ ...item ] : item).flat().forEach(group => this.groups.delete(group));

        return this;
    }
}

export {
    CommandManagerOptions,
    CommandResolvable,
    CommandManager
}

export default CommandManager;