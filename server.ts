import dotenv from "dotenv-flow";
import express from "express";
import ExpressWs from "express-ws";
import log from "./lib/logger";
import * as oai from "./lib/openai";
import * as twlo from "./lib/twilio";
import type { CallStatus, TwilioStreamMessage } from "./lib/twilio-types";

dotenv.config();

const { app } = ExpressWs(express());
app.use(express.urlencoded({ extended: true })).use(express.json());

/****************************************************
 Twilio Voice Webhook Endpoints
****************************************************/
app.post("/incoming-call", async (req, res) => {
  const { CallSid, From, To } = req.body;
  log.twl.info(`incoming-call from ${From} to ${To}`);

  try {
    await oai.initWebsocket(); // this demo only supports one call at a time

    res.status(200);
    res.type("text/xml");

    // incoming calls are instructed to send media to the websocket below
    res.end(`
        <Response>
          <Connect>
            <Stream url="wss://${process.env.HOSTNAME}/media-stream/${CallSid}" />
          </Connect>
        </Response>
        `);
  } catch (error) {
    log.oai.error(
      "incoming call webhook failed because OpenAI websocket could not connect."
    );
    res.status(500).send();
  }
});

app.post("/call-status-update", async (req, res) => {
  const status = req.body.CallStatus as CallStatus;

  if (status === "error") log.twl.error(`call-status-update ${status}`);
  else log.twl.info(`call-status-update ${status}`);

  if (status === "error" || status === "completed") oai.closeWebsocket();

  res.status(200).send();
});

/****************************************************
 Twilio Media Stream Websocket Endpoint 
****************************************************/
app.ws("/media-stream/:callSid", (ws, req) => {
  log.twl.info("incoming websocket");

  twlo.setWs(ws);

  ws.on("error", (err) => log.twl.error(`websocket error`, err));

  // user starts speaking
  oai.on("input_audio_buffer.speech_started", (msg) => {
    oai.clearAudio();
    twlo.clearAudio();
  });

  // bot audio packets are forwarded to the Twilio call
  oai.on("response.audio.delta", (msg) => {
    twlo.sendAudio(msg.delta);
  });

  // bot partial transcript
  oai.on("response.audio_transcript.delta", (msg) => {
    log.oai.info("bot transcript (delta): ", msg.delta);
  });

  // bot transcript complete
  oai.on("response.audio_transcript.done", (msg) => {
    log.oai.info("bot transcript (final): ", msg.transcript);
  });

  ws.on("message", (data) => {
    let msg: TwilioStreamMessage;
    try {
      msg = JSON.parse(data.toString());
    } catch (err) {
      log.app.error("unexpected websocket message datatype", err);
      return;
    }

    switch (msg.event) {
      case "start":
        log.twl.success("media stream started");
        twlo.setStreamSid(msg.streamSid);

        oai.setSession();

        break;

      case "stop":
        break;

      case "mark":
        log.twl.info(`mark: ${msg.mark}`);
        break;

      case "media":
        oai.sendAudio(msg.media.payload);
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
