import { ApplicationCommandOptionType, ApplicationCommandOption, SlashCommandOptions, SlashCallback } from './SlashTypes';

export class SlashCommand {
    #data: SlashCommandOptions;

    constructor(options?: SlashCommandOptions) {
        this.#data = new Object();

        if (!options) return;

        const { name, description, options: opts, id, callback } = options;

        if (id) this.#data = { id: id };

        if (name && typeof name === 'string' && new RegExp(/^[\w-]{1,32}$/).test(name)) this.#data.name = name;
        if (description && typeof description === 'string') this.#data.description = description;
        if (callback) this.#data.callback = callback;
        if (opts && Array.isArray(opts)) this.#data.options = this.checkOptions(opts);
    }

    private checkOptions(options: ApplicationCommandOption[]): ApplicationCommandOption[] {
        options.forEach(opt => {
            const { name, description, type, choices, required } = opt;

            if (!name || typeof name !== 'string') throw new Error('Slash command options must have a valid name set; a string with a length greater than zero.');
            if (!description || typeof description !== 'string') throw new Error('Slash command options must have a valid description set; a string with a length greater than zero.');
            if (!type || (typeof type !== 'string' && !(opt.type in ApplicationCommandOptionType))) throw new Error('Slash command options must have a valid type set; of type ApplicationCommandOptionType.');
            if ('required' in opt && typeof required !== 'boolean') throw new Error('Property \'required\' must be a boolean.');
            if (Array.isArray(choices)) choices.forEach(choice => {
                if (!choice.name || typeof choice.name !== 'string') throw new Error('Slash command option choices must have a name set.');
            });

            if (typeof opt.type === 'string') opt.type = ApplicationCommandOptionType[opt.type];

            if (opt.options && Array.isArray(opt.options)) this.checkOptions(opt.options);
        });

        return options;
    }

    /**
     * @param name The name of your slash command.
     */
    public setName(name: string) {
        if (name && typeof name === 'string' && new RegExp(/^[\w-]{1,32}$/).test(name)) this.#data.name = name;
    }

    /**
     * @param description The description of your slash command.
     */
    public setDescription(description: string) {
        if (description && typeof description === 'string' && description.length <= 100) this.#data.description = description;
    }

    /**
     * @param callback The function to be executed when the command is run.
     */
    public setCallback(callback: SlashCallback) {
        this.#data.callback = callback;
    }

    /**
     * Add a user input option
     */
    public addOption(option: ApplicationCommandOption) {
        if (!option) throw new Error('');
        let opt = this.checkOptions([option]).shift();

        if (!this.#data.options) this.#data.options = [];
        if (opt) this.#data.options?.push(opt);
    }

    /**
     * @returns A JSON representation of this slash command.
     */
    public toJSON() {
        const data = {
            name: this.name,
            description: this.description,
            options: this.options
        };

        return JSON.stringify(data);
    }

    get name() {
        return this.#data.name;
    }

    get description() {
        return this.#data.description;
    }

    get options() {
        return this.#data.options;
    }

    get id() {
        return this.#data.id;
    }
}