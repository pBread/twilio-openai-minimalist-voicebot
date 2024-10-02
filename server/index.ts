import dotenv from "dotenv-flow";
import express from "express";
import ExpressWs from "express-ws";
import type { TwilioStreamMessage } from "./types";

dotenv.config();

const { app } = ExpressWs(express());
app.use(express.urlencoded({ extended: true })).use(express.json());

/****************************************************
 Webhook Endpoints
****************************************************/
app.post("/incoming-call", async (req, res) => {
  const { CallSid, From, To } = req.body;
  console.log(`incoming-call from ${From} to ${To}`);

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

app.post("/call-status-update", (req, res) => {
  console.log(`call-status-update ${req.body.CallStatus}`);

  res.status(200).send();
});

/****************************************************
 Twilio Media Stream
****************************************************/
app.ws("/media-stream/:callSid", (ws, req) => {
  const CallSid = req.params.callSid;
  console.log(`establishing websocket ${CallSid}`);

  ws.on("error", (err) => console.error(`websocket error`, err));

  ws.on("message", (data) => {
    let msg: TwilioStreamMessage;
    try {
      msg = JSON.parse(data.toString());
    } catch (error) {
      console.error("unexpected websocket message datatype");
      return;
    }

    if (msg.event === "connected") console.log("media stream connected");
    else if (msg.event === "mark") {
    } else if (msg.event === "start") console.log("media stream started");
    else if (msg.event === "stop") console.log("media stream stopped");
    else if (msg.event === "media") {
    } else console.warn(`unhandled media stream message`, msg);
  });
});

/****************************************************
 Start Server
****************************************************/
const port = process.env.PORT || "3000";
app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});
