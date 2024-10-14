import type { WebSocket } from "ws";
import type {
  TwilioStreamAction,
  TwilioStreamMessage,
  TwilioStreamMessageTypes,
} from "./twilio-types";

let streamSid: string;
export function setStreamSid(sid: string) {
  streamSid = sid;
}

export let ws: WebSocket; // This demo only supports on call at a time, hence the Twilio Media Stream websocket is globally scoped.
export function setWs(wss: WebSocket) {
  ws = wss;
}

/****************************************************
 Media Stream Actions
****************************************************/
export function clearAudio() {
  ws?.send(JSON.stringify({ event: "clear", streamSid }));
}
export function sendAudio(audio: string) {
  ws?.send(
    JSON.stringify({ event: "media", streamSid, media: { payload: audio } })
  );
}
export function sendMark(name: string) {
  ws?.send(JSON.stringify({ event: "mark", streamSid, mark: { name } }));
}

/****************************************************
 Event Subscribers
****************************************************/
export function onMessage<T extends TwilioStreamMessageTypes>(
  type: T,
  callback: (message: TwilioStreamMessage & { event: T }) => void
) {
  ws.on("message", (data) => {
    const msg = JSON.parse(data.toString()) as TwilioStreamMessage;
    if (msg.event === type) callback(msg as TwilioStreamMessage & { event: T });
  });
}
