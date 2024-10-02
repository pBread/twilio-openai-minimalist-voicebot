import dotenv from "dotenv-flow";
import express from "express";
import ExpressWs from "express-ws";
import log from "./lib/logger";
import type { CallStatus, TwilioStreamMessage } from "./lib/twilio-types";
import * as twlo from "./lib/twilio";

dotenv.config();

const { app } = ExpressWs(express());
app.use(express.urlencoded({ extended: true })).use(express.json());

/****************************************************
 Twilio Voice Webhook Endpoints
****************************************************/
app.post("/incoming-call", async (req, res) => {
  const { CallSid, From, To } = req.body;
  log.twl.info(`incoming-call from ${From} to ${To}`);

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
  const status = req.body.CallStatus as CallStatus;

  switch (status) {
    case "completed":
      log.twl.info(`call-status-update ${status}`);
      break;

    case "error":
      log.twl.error(`call-status-update ${status}`);
      break;

    case "initializing":
    case "started":
    default:
      log.twl.info(`call-status-update ${status}`);
  }

  res.status(200).send();
});

/****************************************************
 Twilio Media Stream Websocket Endpoint 
****************************************************/
app.ws("/media-stream/:callSid", (ws, req) => {
  log.twl.info("incoming websocket");

  twlo.setWs(ws);

  ws.on("error", (err) => log.twl.error(`websocket error`, err));

  ws.on("message", (data) => {
    let msg: TwilioStreamMessage;
    try {
      msg = JSON.parse(data.toString());
    } catch (error) {
      console.error("unexpected websocket message datatype");
      return;
    }

    switch (msg.event) {
      case "start":
        log.twl.success("media stream started");
        twlo.setStreamSid(msg.streamSid);

        break;

      case "stop":
        break;

      case "mark":
        log.twl.info(`mark: ${msg.mark}`);
        break;

      case "media":
        twlo.sendAudio(msg.media.payload);
        break;

      default:
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
