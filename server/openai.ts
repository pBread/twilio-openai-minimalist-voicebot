import WS from "ws";
import log from "./logger";
import { sendAudioToTwilio } from "./twilio";

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
      const msg = JSON.parse(data.toString());

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

function handleOpenAiMessage(msg: { type: string; delta: string }) {
  log.opai.info("message", msg.type as string, msg);

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

const xxx = {
  type: "response.audio.delta",
  event_id: "event_AE0r0IrN2eklytAEikgnc",
  response_id: "resp_AE0qy474rVq686pMVunYX",
  item_id: "item_AE0qzfOWi7aOmb6E3EkhS",
  output_index: 0,
  content_index: 0,
  delta:
    "/Pv9/Pz9/n7//f5+fXt7fn18e3t7fXt3eHl8fnp2eHl8fHh2en3/fnp7/vt+e3r89ff+ff/5+H56e/739/r7/P96cm98+fb3/nv+fXh9/fv7/v/2+P58//fz/XV2ePz9d3N0cG9tbXp8b2trcPx9cHJ9//5ybvfs8PTt6/F1bvLn+G5z7d7e8Xh9/PTr6N3a6vX4fe/rb2zx8PluT0x75XxjWWHpalNn6uttUlPw3+7s693U3eLX3Hfp08jJ1ejk1elXU1fbyNrhzdlQQERg3GpGRE1OQzo9WXpNOzpDRD9EXOLZ4+PQzdXczce9ucXSxr28wtPMv8fh1b66vsvDvtJl7MvI1O/Vyt9LREE/TE9JQTssKi84S04+QUtAQD5HbmpiaFr3z93YzOHhwLq/wr66u8TPzMbJvrrBzt/wyMDIwbu+yd7n8lJFT3nbw+o6Mi4qKyosOTo5PkE+PDg5QVNaT13Pw8rbzr+/vre2sq+xvMTDv8DEyr63vtnZyb++yMG5w+RjU0Y/RNnRRDMuLi0oJi41MS41Pz81M0JiTTw+3cLN5863tsi+rq+0s6+zvcK7tL7Pxba2xc67uczOu7O52VhdTTxfv+M8OTQsJiMqLyopN0c6MTE7Rz03SXhu68vGwMDHu7K1sa6usbq6tbq6t7y0r7m+v725vL23uMLO71JLS9nbRDo3KyQjJSgpKi88OzEzOTozMkNoSVrIvr/CwcC7ubOwsrGxtrm6uri6vruxtbzAvru7uLW6vshoSUxU6PhBPTQqIyMkJiUsNTY5PDc2OS8ySFE+ZL++vr27tr3AsK69vLG0ubm0sbnEu7S9v73FvLS4u7y9wexKT1hfTD4/NyklJCIjIyk0NzU9Pjg1NTU8RUPrxMq/uLu5uruysL++sbG4s66vtb69uL3GvcDBt7S2vL67v3JJX9paOzw8LyMiJCIiJSw6OjE7OzMzNThCT1bRwr++uLa0s7Wztr6/trOvrbCztru/vsDFwsW/uLS4ube7wulcW+5WODQ2LiUjJSUlJiw2OjI1Ozs4NThCX2l9zr67urm2sLO5vL28ubSyr6+vs7i8vLzCysfAvr29vr6+wsrX72taSDs1MS4rKSgnJigrLi8xNjs/QUJGT15rd+bUysO+ure2uLm5ubi4trW1tba2uLq7u72/wMDAwcLEyczO1utqWk1DPDUvLSspJyUkJScqLC0xOD5IU1762M3JxcG/vLm3tba2t7a1tre3t7e3t7m6u7u8vL7BxMTFytDb9mVaT0Y/PDcyLiwqKCcmJSUmKS0yOD5KZN7OyMTAvby7u7q5uLe2t7m6ubm4ubm4uLe4ubq7vL2/wsbKztTka1ZMRT47NzIvLSspKCcmJicoKi0zO0Za79XHv727urq6urm6urm5ubm5ubq6ube3trW1tri5u72/xMvV4vVtXE9JQj05NTIvLSsqKCgnJygpKy4zO0df2ci/u7i2tLS0tLa2t7i4uLi4ubm6urq6ubm6u7y9vsDEyM3V5HJdUUpEPzs4NTIvLiwrKikpKSorLS80O0RV687Dvbq4trS0tLS1tre3uLi5uru7vLy8vLy8vb2+v8HDxsrP2elwXVJLRT87ODUyLy4sKyopKSkrLS81O0RT+tTIwL27urq7u72+v8DCw8LBv728urm4uLi4ubq6u7y+wcfN2O9jU0pDPjw5NzU0MjEvLy4uLi4vMTQ3Oj5HUmvfzsa/vbu6ubm6u7y9vr/AwcHAv7++vr6+vr6+v8HDxcjLz9fmb1tQS0ZBPjw6ODU0MjEwMDAyNDU3OT5KTlRoZfLTxsDEwLu8uc7HtLe5ur7Av7u7vsPHyczP097s9X52a2NhXlpZVU9MSUZFQ0A+PTs7Ozs7Ozw+QERITVdl/+bb083KyMbEwsHAwL+/v7+/vr6+vr+/v8LEx8rO1NzofGZcVE9MSUdGREREQ0NERUZGR0dISUlKS0tMTk9RU1VXWlxfZGt2+Ozj3NfRzsvJx8TDwb+/v7+/wMLEx8rN0NXc5O98amNdWldUUk9OTk5NTU1NTU1OTk5PT1BQUVNTU1RWWFpcXV9iZmpvd/3z7eji3tza2NfW1NPT09PU1NXX2NnZ2tvc3d7f4uTn6+72/Hx4dG9samdkZGRiYF9eXV9fYGFiZWdpamxubm1sa2xvcW5sbG50ev/9+vDs7Orn4d7h5uTe3uPk5ejn5+rn5unq6ezs7PH1eXx+enL+dW1iZmxmY3Bz/Ovo7uRxdX59eH5tXvZcXHVd7VvO3HLZ5+nPze1C+uvv1MTOy0mlTlrzblNBzvLOPlrkN0lVykHrRL/uXsbe6DzRRT1HPtgz2ELFPeZZx1VUw1nUQbxMy0PBUtNJyvls23jKVs5byGXRYMv56fxyzW/cW7lk193F0P/Q3MdP6s/fVPTMVt5PyFp0V9ZrRNRW70TPT9pI4t3lX97Ka9HUzNnL0sTPy8fKz8TM1dDS9eFvfGBaWWdNS1tUSkpRS0Q7PT0yMjMzLDAwNDY3Qk5PbcHGwbi0t7azs7W4trK5urW0uru2tbvEv7vG5NLNa1NVVEc+PDw3LjAuJiMkIh8hIycrLjxn1b+xrayrq62vtLm+zdbV4f7UzMe/t7axrq2ura+ws7m+xc75WUxLPjo5ODIuLComHx8hHxw=",
};
