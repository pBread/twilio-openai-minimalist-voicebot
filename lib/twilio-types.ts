/****************************************************
 Twilio Media Stream Actions
 https://www.twilio.com/docs/voice/media-streams/websocket-messages#send-websocket-messages-to-twilio
****************************************************/
export type TwilioStreamAction = Clear | SendAudio | SendMark;

type Clear = {
  event: "clear";
  streamSid: string;
};

type SendAudio = {
  event: "media";
  streamSid: string;
  media: { payload: string };
};

type SendMark = {
  event: "mark";
  streamSid: string;
  mark: { name: string };
};

/****************************************************
 Twilio Media Stream Messages
 https://www.twilio.com/docs/voice/media-streams/websocket-messages
****************************************************/
export type TwilioStreamMessage =
  | ConnectedEvent
  | DTMFEvent
  | MarkEvent
  | MediaEvent
  | StartEvent
  | StopEvent;

type ConnectedEvent = {
  event: "connected";
  protocol: string;
  version: string;
};

type DTMFEvent = {
  event: "dtmf";
  dtmf: { digit: string; track: string };
  sequenceNumber: number;
  streamSid: string;
};

export type MarkEvent = {
  event: "mark";
  mark: { name: string };
  sequenceNumber: number;
  streamSid: string;
};

export type MediaEvent = {
  event: "media";
  sequenceNumber: number;
  media: { track: string; chunk: string; timestamp: string; payload: string };
  streamSid: string;
};

type StartEvent = {
  event: "start";
  sequenceNumber: string;
  start: {
    accountSid: string;
    streamSid: string;
    callSid: string;
    tracks: string[];
    mediaFormat: { encoding: string; sampleRate: number; channels: number };
    customParameters: Record<string, unknown>;
  };
  streamSid: string;
};

type StopEvent = {
  event: "stop";
  sequenceNumber: string;
  streamSid: string;
  stop: { accountSid: string; callSid: string };
};

/****************************************************
 Misc Twilio
****************************************************/
export type CallStatus = "completed" | "initializing" | "started" | "error";
