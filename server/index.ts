import dotenv from "dotenv-flow";
import express from "express";
import ExpressWs from "express-ws";
import log from "./logger";
import {
  dispatchToOpenAi,
  sendAudioToOpenAI,
  startOpenAiWebsocket,
  stopOpenAiWebsocket,
  updateSession,
} from "./openai";
import type { TwilioStreamMessage } from "./types";

dotenv.config();

const { app } = ExpressWs(express());
app.use(express.urlencoded({ extended: true })).use(express.json());

/****************************************************
 Webhook Endpoints
****************************************************/
app.post("/incoming-call", async (req, res) => {
  const { CallSid, From, To } = req.body;
  log.twlo.info(`incoming-call from ${From} to ${To}`);

  await startOpenAiWebsocket();

  res.status(200);
  res.type("text/xml");

  res.end(`
    <Response>
      <Connect>
        <Stream url="wss://${process.env.HOSTNAME}/media-stream/${CallSid}" />
      </Connect>
    </Response>
    `);
});

app.post("/call-status-update", async (req, res) => {
  const CallStatus = req.body.CallStatus as
    | "completed"
    | "initializing"
    | "started"
    | "error";

  if (CallStatus === "completed" || CallStatus === "error") {
    log.twlo.warn(`call-status-update ${CallStatus}`);
    await stopOpenAiWebsocket();
  } else log.twlo.info(`call-status-update ${CallStatus}`);

  res.status(200).send();
});

/****************************************************
 Twilio Media Stream
****************************************************/
app.ws("/media-stream/:callSid", (ws, req) => {
  const CallSid = req.params.callSid;
  log.twlo.info(`establishing websocket ${CallSid}`);

  let streamId: string;

  ws.on("error", (err) => console.error(`websocket error`, err));

  ws.on("message", (data) => {
    let msg: TwilioStreamMessage;
    try {
      msg = JSON.parse(data.toString());
    } catch (error) {
      console.error("unexpected websocket message datatype");
      return;
    }

    switch (msg.event) {
      case "connected":
        log.twlo.success("media stream connected");
        break;

      case "mark":
        log.twlo.debug("mark", msg);
        break;

      case "media":
        if (msg.sequenceNumber < 500) sendAudioToOpenAI(msg.media.payload);
        else if (msg.sequenceNumber === 500) {
          dispatchToOpenAi({ type: "response.create" });
          log.twlo.debug("response.create media");
        }

        break;

      case "start":
        log.twlo.success("media stream started");
        streamId = msg.streamSid;

        updateSession();
        break;

      case "stop":
        log.twlo.warn("media stream stopped");
        break;

      default:
        log.twlo.warn(`unhandled media stream message`, msg);
    }
  });
});

/****************************************************
 Start Server
****************************************************/
const port = process.env.PORT || "3000";
app.listen(port, () => {
  log.app.info(`server running on http://localhost:${port}`);
});
