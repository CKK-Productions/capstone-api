import axios from "axios";
import $ from "jquery";

const baseUrl = "https://www.tetyys.com/SAPI4/SAPI4";

enum Voice{
    Sam = "Sam",
    BB = "Adult Male #2, American English (TruVoice)"
}

async function getTTS(voice: Voice, text: String, pitch: number, speed: number){
    const response = await fetch(`${baseUrl}?text=${text}&voice=${voice}&pitch=${pitch}&speed=${speed}`, {
        headers: {
            "Content-Type": "audio/mpeg"
        },
    });
    console.log(response.blob);
    return response.blob
}

export {baseUrl, getTTS, Voice}