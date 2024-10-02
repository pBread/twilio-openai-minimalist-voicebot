require("dotenv-flow/config");

const hostname = process.env.HOSTNAME;
const ngrokArgs = ["http", "3000"];

if (hostname) ngrokArgs.push("--hostname=" + hostname);

const { spawn } = require("child_process");
const ngrok = spawn("ngrok", ngrokArgs, { stdio: "inherit" });

ngrok.on("exit", (code) => {
  console.log(`ngrok process exited with code ${code}`);
});
