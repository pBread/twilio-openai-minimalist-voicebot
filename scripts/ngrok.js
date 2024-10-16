require("dotenv-flow/config");

const hostname = process.env.HOSTNAME;
const PORT = process.env.PORT || "3000";
const ngrokArgs = ["http", PORT];

if (hostname) ngrokArgs.push("--hostname=" + hostname);
console.log("ngrok " + ngrokArgs.join(" "));

const { spawn } = require("child_process");
const ngrok = spawn("ngrok", ngrokArgs, { stdio: "inherit" });

ngrok.on("exit", (code) => {
  console.log(`ngrok process exited with code ${code}`);
});
