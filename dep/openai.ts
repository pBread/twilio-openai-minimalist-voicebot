import WS from "ws";
import log from "./logger";
import { sendAudioToTwilio } from "./twilio";
import { OpenAIEvent } from "./openai-types";

let oaiWs: WS | null;

export async function startOpenAiWebsocket(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (oaiWs)
      throw Error(
        `There is already an active OpenAI websocket connection. This demo is limited to a single OpenAI connection at a time.`
      );

    log.opai.info("connecting to websocket");

    oaiWs = new WS(
      "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01",
      {
        headers: {
          Authorization: "Bearer " + process.env.OPENAI_API_KEY,
          "OpenAI-Beta": "realtime=v1",
        },
      }
    );

    oaiWs.on("open", () => {
      log.opai.success("websocket opened");

      resolve();
    });

    oaiWs.on("error", (error) => {
      log.opai.error("websocket error", error);

      reject();
    });

    oaiWs.on("message", (data: any) => {
      const msg = JSON.parse(data.toString()) as OpenAIEvent;

      handleOpenAiMessage(msg);

      resolve();
    });
  });
}

export function stopOpenAiWebsocket(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!oaiWs) {
      log.opai.warn("no WebSocket connection to disconnect");
      resolve();
      return;
    }

    oaiWs.on("close", () => {
      log.opai.warn("webSocket connection closed");
      oaiWs = null;
      resolve();
    });

    oaiWs.on("error", (error) => {
      log.opai.error("error while closing WebSocket", error);
      reject(error);
    });

    oaiWs.close();
  });
}

export function sendAudioToOpenAI(audio: string) {
  const event = {
    type: "input_audio_buffer.append",
    audio,
  };

  dispatchToOpenAi(event);
}

const msgMap = new Map();

setInterval(() => {
  console.log(JSON.stringify(Object.fromEntries(msgMap.entries())));
}, 5000);

function handleOpenAiMessage(msg: OpenAIEvent) {
  log.opai.info("message", msg.type as string, msg);

  msgMap.set(msg.type, msg);

  switch (msg.type) {
    case "response.audio.delta":
      sendAudioToTwilio(msg.delta);
  }
}

export function updateSession() {
  dispatchToOpenAi({
    type: "session.update",
    session: {
      turn_detection: { type: "server_vad" },
      input_audio_format: "g711_ulaw",
      output_audio_format: "g711_ulaw",
      voice: "alloy",
      instructions:
        "You are a helpful assistant answering questions about skit rentals",
      modalities: ["text", "audio"],
      temperature: 0.8,
    },
  });
}

export function dispatchToOpenAi(event: {}) {
  oaiWs?.send(JSON.stringify(event));
}
