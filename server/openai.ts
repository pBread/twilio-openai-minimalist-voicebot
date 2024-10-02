import WS from "ws";

let oaiWs: WS | null;

async function startOpenAiWebsocket(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (oaiWs)
      throw Error(
        `There is already an active OpenAI websocket connection. This demo is limited to a single OpenAI connection at a time.`
      );

    console.log("[OpenAI] connecting to websocket");

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
      console.log("[OpenAI] websocket opened");
      resolve();
    });

    oaiWs.on("error", (error) => {
      console.error("[OpenAI] websocket error", error);

      reject();
    });
  });
}

function stopOpenAiWebsocket(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!oaiWs) {
      console.log("[OpenAI] no WebSocket connection to disconnect");
      resolve();
      return;
    }

    oaiWs.on("close", () => {
      console.log("[OpenAI] webSocket connection closed");
      oaiWs = null;
      resolve();
    });

    oaiWs.on("error", (error) => {
      console.error("[OpenAI] error while closing WebSocket", error);
      reject(error);
    });

    oaiWs.close();
  });
}

export { startOpenAiWebsocket, stopOpenAiWebsocket };
