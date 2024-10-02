import dotenv from "dotenv-flow";
import express from "express";
import ExpressWs from "express-ws";

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
          <Stream url="wss://${process.env.HOSTNAME}/connection/${CallSid}"
        </Connect>
      </Response>
      `);
});

app.post("/call-status-update", (req, res) => {
  const { CallSid, CallStatus } = req.body;
  console.log(`call-status-update ${CallSid} ${CallStatus}`);

  res.status(200).send();
});

/****************************************************
 Media Stream
****************************************************/
app.ws("/connection/:callSid", (ws, req) => {
  const CallSid = req.params.callSid;
  console.log(`establishing websocket ${CallSid}`);

  ws.on("error", (err) => console.error(`websocket error`, err));

  ws.on("message", (data) => {});
});

/****************************************************
 Start Server
****************************************************/
const port = process.env.PORT || "3000";
app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});
