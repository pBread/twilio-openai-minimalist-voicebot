export type TwilioStreamMessage =
  | ConnectedEvent
  | MarkEvent
  | MediaEvent
  | StartEvent
  | StopEvent;

type ConnectedEvent = {
  event: "connected";
  protocol: string;
  version: string;
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
