import dotenv from "dotenv-flow";
import express from "express";
import ExpressWs from "express-ws";

dotenv.config();

const { app } = ExpressWs(express());
app.use(express.urlencoded({ extended: true })).use(express.json());

/****************************************************
 Webhook Endpoints
****************************************************/
app.post("/incoming-call", async (req, res) => {});

app.post("/call-status-update", (req, res) => {});

/****************************************************
 Media Stream
****************************************************/
app.ws("/connection/:callSid", (ws, req) => {});

/****************************************************
 Start Server
****************************************************/
const port = process.env.PORT || "3000";
app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});
