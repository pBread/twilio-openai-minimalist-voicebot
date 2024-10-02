import { WebSocket } from "ws";
import { TwilioStreamAction } from "./twilio-types";

let streamSid: string;
export const setStreamSid = (sid: string) => (streamSid = sid);

let ws: WebSocket;
export const setWs = (wss: WebSocket) => (ws = wss);

export const dispatch = (event: TwilioStreamAction) =>
  ws?.send(JSON.stringify(event));

export const clearAudio = () => dispatch({ event: "clear", streamSid });
export const sendAudio = (audio: string) =>
  dispatch({ event: "media", streamSid, media: { payload: audio } });
export const sendMark = (name: string) =>
  dispatch({ event: "mark", streamSid, mark: { name } });
