import WS from "ws";
import config from "../config";
import log from "./logger";
import type {
  OpenAIActions,
  OpenAIStreamMessage,
  OpenAIStreamMessageTypes,
} from "./openai-types";

export let ws: WS; // This demo only supports on call at a time. Hence the OpenAI websocket is globally scoped.
export let wsPromise: Promise<void>;

/****************************************************
 Establish Websocket Connection to OpenAI
 https://platform.openai.com/docs/guides/realtime/overview
****************************************************/
export function createWebsocket() {
  // websocket must be closed or uninitialized
  if (ws && ws?.readyState !== ws.CLOSED)
    throw Error(
      `There is already an active OpenAI websocket connection. This demo is limited to a single OpenAI connection at a time.`
    );

  wsPromise = new Promise<void>((resolve, reject) => {
    ws = new WS(config.openai.wsUrl, {
      headers: {
        Authorization: "Bearer " + process.env.OPENAI_API_KEY,
        "OpenAI-Beta": "realtime=v1",
      },
    });

    ws.on("open", () => resolve());
    ws.on("unexpected-response", (_, msg) => reject(msg));
  });

  return wsPromise;
}

export async function closeWebsocket(): Promise<void> {
  return new Promise((resolve) => {
    if (!ws) {
      log.oai.warn("no WebSocket connection to disconnect");
      resolve();
      return;
    }

    ws.on("close", () => resolve());

    ws.close();
  });
}

/****************************************************
 Websocket Actions
****************************************************/
function dispatch(event: OpenAIActions) {
  ws?.send(JSON.stringify(event));
}

export function clearAudio() {
  dispatch({ type: "input_audio_buffer.clear" });
}

export function speak(text: string) {
  dispatch({
    type: "response.create",
    response: {
      modalities: ["text", "audio"],
      instructions: `Say this verbatum: ${text}`,
    },
  });
}

export function sendAudio(audio: string) {
  dispatch({ type: "input_audio_buffer.append", audio });
}

export function truncate(
  item_id: string,
  audio_end_ms: number,
  content_index = 0
) {
  dispatch({
    type: "conversation.item.truncate",
    item_id,
    audio_end_ms,
    content_index,
  });
}

// these config params should probably be set when the OpenAI websocket is initialized
// but, setting them slightly later (i.e. when the Twilio Media starts) seems to make
// OpenAI's bot more responsive.
export function setSessionParams() {
  dispatch({
    type: "session.update",
    session: {
      input_audio_format: "g711_ulaw",
      output_audio_format: "g711_ulaw",
      modalities: ["text", "audio"],
      turn_detection: { type: "server_vad" }, // VAD (voice activity detection) enables input_audio_buffer.speech_started / .speech_stopped

      instructions: config.openai.instructions,
      temperature: config.openai.temperature,
      voice: config.openai.voice,
    },
  });
}

/****************************************************
 Event Subscribers
****************************************************/
export function onMessage<T extends OpenAIStreamMessageTypes>(
  type: T,
  callback: (message: OpenAIStreamMessage & { type: T }) => void
) {
  ws.on("message", (data) => {
    const msg = JSON.parse(data.toString()) as OpenAIStreamMessage;
    if (msg.type === type) callback(msg as OpenAIStreamMessage & { type: T });
  });
}
