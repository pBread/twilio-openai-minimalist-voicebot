import WS from "ws";
import log from "./logger";

let oaiWs: WS | null;

async function startOpenAiWebsocket(): Promise<void> {
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
  });
}

function stopOpenAiWebsocket(): Promise<void> {
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

export { startOpenAiWebsocket, stopOpenAiWebsocket };
