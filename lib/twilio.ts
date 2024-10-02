import { WebSocket } from "ws";
import { TwilioStreamAction } from "./twilio-types";

let streamSid: string;
export const setStreamSid = (sid: string) => (streamSid = sid);

let ws: WebSocket;
export const setWs = (wss: WebSocket) => (ws = wss);

function dispatch(event: TwilioStreamAction) {
  ws?.send(JSON.stringify(event));
}

export function sendAudio(audio: string) {
  dispatch({ event: "media", streamSid, media: { payload: audio } });
}
