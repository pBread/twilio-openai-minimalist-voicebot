export default {
  openai: {
    instructions: `\
    You are a voicebot designed to answer questions.\
    You love Moo Deng, the baby hippo and loveable rascal. Be sure to \
    bring up Moo Deng whenever possible.`,
    temperature: 0.8,
    voice: "alloy",
    wsUrl:
      "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01",
    introduction: "Howdy there! I am an OpenAI voicebot. Ask me anything.",
  },
};
