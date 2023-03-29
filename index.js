"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const tts_1 = require("./tts");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
app.get('/', (req, res) => {
    (0, tts_1.getTTS)(tts_1.Voice.Sam, "Bing Chilling", 100, 100).then(r => { res.send(r); });
});
app.listen(port, () => {
    console.log("Server running");
});
