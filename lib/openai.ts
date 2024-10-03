import WS from "ws";
import log from "./logger";
import type { OpenAIActions, OpenAIStreamMessage } from "./openai-types";
import * as twlo from "./twilio";

let ws: WS | null = null;

function dispatch(event: OpenAIActions) {
  ws?.send(JSON.stringify(event));
}

export async function startWs(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (ws)
      throw Error(
        `There is already an active OpenAI websocket connection. This demo is limited to a single OpenAI connection at a time.`
      );

    log.oai.info("initializing websocket");

    ws = new WS(
      "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01",
      {
        headers: {
          Authorization: "Bearer " + process.env.OPENAI_API_KEY,
          "OpenAI-Beta": "realtime=v1",
        },
      }
    );

    ws.on("open", () => {
      log.oai.success("websocket opened");
      resolve();
    });

    ws.on("unexpected-response", (req, msg) => {
      log.oai.error("connection failure", msg);
      reject();
    });

    ws.on("close", () => {
      log.oai.warn("webSocket connection closed");
      ws = null;
    });

    ws.on("error", (err) => {
      log.oai.error("websocket error", err);
    });

    ws.on("message", (data: any) => {
      const msg = JSON.parse(data.toString()) as OpenAIStreamMessage;

      switch (msg.type) {
        case "response.audio.delta":
          twlo.sendAudio(msg.delta);
          break;

        case "error":
          log.oai.error(msg);

        default:
      }
    });
  });
}

export async function stopWs(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!ws) {
      log.oai.warn("no WebSocket connection to disconnect");
      resolve();
      return;
    }

    ws.close();

    ws.on("close", () => {
      ws = null;
      resolve();
    });
  });
}

export function sendAudio(audio: string) {
  dispatch({ type: "input_audio_buffer.append", audio });
}

// these config params should probably be set when the OpenAI websocket is initialized
// but, setting them slightly later (i.e. when the Twilio Media starts) seems to make
// OpenAI's bot more responsive
export function setSession() {
  dispatch({
    type: "session.update",
    session: {
      input_audio_format: "g711_ulaw",
      output_audio_format: "g711_ulaw",
      modalities: ["text", "audio"],
      voice: "alloy",
      temperature: 0.8,
      turn_detection: { type: "server_vad" },
      instructions: `\
      You are a helpful assistant answering questions about ski rentals`,
    },
  });
}
