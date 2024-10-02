/****************************************************
 Open AI Real Stime Websocket Events
 https://platform.openai.com/docs/api-reference/realtime-server-events
****************************************************/
export type OpenAIStreamMessage =
  | ConversationItemCreatedEvent
  | ErrorEvent
  | InputAudioBufferCommittedEvent
  | InputAudioBufferSpeechStartedEvent
  | InputAudioBufferSpeechStoppedEvent
  | ResponseAudioDeltaEvent
  | ResponseAudioTranscriptDeltaEvent
  | ResponseContentPartAddedEvent
  | ResponseCreatedEvent
  | ResponseOutputItemAddedEvent
  | SessionCreatedEvent
  | SessionUpdatedEvent;

// Base types
type RealtimeSession = {
  id: string;
  object: string;
  model: string;
  expires_at: number;
  modalities: string[];
  instructions: string;
  voice: string;
  turn_detection: {
    type: string;
    threshold: number;
    prefix_padding_ms: number;
    silence_duration_ms: number;
  };
  input_audio_format: string;
  output_audio_format: string;
  input_audio_transcription: string | null;
  tool_choice: string;
  temperature: number;
  max_response_output_tokens: string;
  tools: any[];
};

type RealtimeItem = {
  id: string;
  object: string;
  type: string;
  status: string;
  role: string;
  content: any[];
};

type RealtimeResponse = {
  object: string;
  id: string;
  status: string;
  status_details: string | null;
  output: any[];
  usage: any | null;
};

// Event Types
type ConversationItemCreatedEvent = {
  type: "conversation.item.created";
  event_id: string;
  previous_item_id: string;
  item: RealtimeItem;
};

type ErrorEvent = {
  event_id: string;
  type: string;
  error: {
    type: string;
    code: string;
    message: string;
    param: any;
    event_id: string;
  };
};

type InputAudioBufferCommittedEvent = {
  type: "input_audio_buffer.committed";
  event_id: string;
  previous_item_id: string | null;
  item_id: string;
};

type InputAudioBufferSpeechStartedEvent = {
  type: "input_audio_buffer.speech_started";
  event_id: string;
  audio_start_ms: number;
  item_id: string;
};

type InputAudioBufferSpeechStoppedEvent = {
  type: "input_audio_buffer.speech_stopped";
  event_id: string;
  audio_end_ms: number;
  item_id: string;
};

type ResponseAudioDeltaEvent = {
  type: "response.audio.delta";
  event_id: string;
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  delta: string;
};

type ResponseAudioTranscriptDeltaEvent = {
  type: "response.audio_transcript.delta";
  event_id: string;
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  delta: string;
};

type ResponseContentPartAddedEvent = {
  type: "response.content_part.added";
  event_id: string;
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  part: {
    type: string;
    transcript: string;
  };
};

type ResponseCreatedEvent = {
  type: "response.created";
  event_id: string;
  response: RealtimeResponse;
};

type ResponseOutputItemAddedEvent = {
  type: "response.output_item.added";
  event_id: string;
  response_id: string;
  output_index: number;
  item: RealtimeItem;
};

type SessionCreatedEvent = {
  type: "session.created";
  event_id: string;
  session: RealtimeSession;
};

type SessionUpdatedEvent = {
  type: "session.updated";
  event_id: string;
  session: RealtimeSession;
};
