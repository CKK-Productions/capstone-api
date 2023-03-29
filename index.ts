import express, {Express, Request, Response} from 'express';
import dotenv from 'dotenv';
import { Voice, getTTS } from './tts';
dotenv.config()

const app: Express = express();
const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
    getTTS(Voice.Sam, "Bing Chilling", 100, 100).then(
        r => {res.send(r)}
    )

});

app.listen(port, () => {
    console.log("Server running");
})