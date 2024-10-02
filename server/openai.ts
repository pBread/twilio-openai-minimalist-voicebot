import WS from "ws";

let oaiWs: WS;

async function initOpenAiWebsocket(): Promise<void> {
  return new Promise((resolve, reject) => {
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
      console.log("WebSocket connection established");
      resolve();
    });

    oaiWs.on("error", (error) => {
      console.error("WebSocket error:", error);
      reject();
    });
  });
}

export { initOpenAiWebsocket };
