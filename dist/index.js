"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlashCommandOption = exports.SlashCommand = exports.ParameterType = exports.Parameter = exports.Command = exports.Client = exports.Version = void 0;
const Client_js_1 = require("./client/Client.js");
exports.Client = Client_js_1.default;
const Command_js_1 = require("./structs/Command.js");
exports.Command = Command_js_1.default;
const Parameter_js_1 = require("./structs/Parameter.js");
exports.Parameter = Parameter_js_1.default;
const ParameterType_js_1 = require("./structs/ParameterType.js");
exports.ParameterType = ParameterType_js_1.default;
const SlashCommandOption_js_1 = require("./structs/SlashCommandOption.js");
exports.SlashCommandOption = SlashCommandOption_js_1.default;
const SlashCommand_js_1 = require("./structs/SlashCommand.js");
exports.SlashCommand = SlashCommand_js_1.default;
const Version = '2.0.0';
exports.Version = Version;
