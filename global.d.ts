declare namespace NodeJS {
  export interface ProcessEnv {
    HOSTNAME: string;
    OPENAI_API_KEY: string;
    TWILIO_ACCOUNT_SID: string;
    TWILIO_AUTH_TOKEN: string;
  }
}
