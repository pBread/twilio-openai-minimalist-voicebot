import { WebSocket } from "ws";

let twloWs: WebSocket | null = null;
let streamSid: string;

export function setTwilioWs(ws: WebSocket) {
  twloWs = ws;
}

export function setTwilioStreamSid(id: string) {
  streamSid = id;
}

export function sendAudioToTwilio(audio: string) {
  dispatchToTwilio({ event: "media", streamSid, media: { payload: audio } });
}

export function dispatchToTwilio(event: {}) {
  twloWs?.send(JSON.stringify(event));
}
