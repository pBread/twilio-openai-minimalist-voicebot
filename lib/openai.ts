import WS from "ws";
import log from "./logger";
import * as twlo from "./twilio";
import { OpenAIStreamMessage } from "./openai-types";

let ws: WS | null = null;

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

    ws.on("error", (err) => {
      log.oai.error("websocket error", err);
    });

    ws.on("message", (data: any) => {
      const msg = JSON.parse(data.toString()) as OpenAIStreamMessage;
    });
  });
}
