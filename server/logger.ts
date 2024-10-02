import logger from "node-color-log";

const app = logger.createNamedLogger("APP");
const opai = logger.createNamedLogger("OAI");
const twlo = logger.createNamedLogger("TWL");

const log = {
  get app() {
    return opai.color("white");
  },

  get opai() {
    return opai.color("cyan");
  },

  get twlo() {
    return twlo.color("magenta");
  },
};

export default log;
