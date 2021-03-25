"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlashCommand = exports.Command = exports.Client = void 0;
var Client_js_1 = require("./structures/client/Client.js");
Object.defineProperty(exports, "Client", { enumerable: true, get: function () { return Client_js_1.Client; } });
var Command_js_1 = require("./structures/commands/Command.js");
Object.defineProperty(exports, "Command", { enumerable: true, get: function () { return Command_js_1.Command; } });
var Slash_js_1 = require("./structures/slash/Slash.js");
Object.defineProperty(exports, "SlashCommand", { enumerable: true, get: function () { return Slash_js_1.SlashCommand; } });
