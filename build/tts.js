"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Voice = exports.getTTS = exports.baseUrl = void 0;
const baseUrl = "https://www.tetyys.com/SAPI4/SAPI4";
exports.baseUrl = baseUrl;
var Voice;
(function (Voice) {
    Voice["Sam"] = "Sam";
    Voice["BB"] = "Adult Male #2, American English (TruVoice)";
})(Voice || (Voice = {}));
exports.Voice = Voice;
function getTTS(voice, text, pitch, speed) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`${baseUrl}?text=${text}&voice=${voice}&pitch=${pitch}&speed=${speed}`, {
            headers: {
                "Content-Type": "audio/mpeg"
            },
        });
        console.log(response.blob);
        return response.blob;
    });
}
exports.getTTS = getTTS;
