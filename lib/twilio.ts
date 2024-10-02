import { WebSocket } from "ws";
import { TwilioStreamAction } from "./twilio-types";

let streamSid: string;
export function setStreamSid(sid: string) {
  streamSid = sid;
}

let ws: WebSocket | null = null;
export function setWs(wss: WebSocket) {
  ws = wss;
}

/****************************************************
 Media Stream Actions
****************************************************/
export function dispatch(event: TwilioStreamAction) {
  ws?.send(JSON.stringify(event));
}
export function clearAudio() {
  dispatch({ event: "clear", streamSid });
}
export function sendAudio(audio: string) {
  dispatch({ event: "media", streamSid, media: { payload: audio } });
}
export function sendMark(name: string) {
  dispatch({ event: "mark", streamSid, mark: { name } });
}
