import express from 'express';
import { globalInferenceService } from '../services/inference.service';
import type { Server } from 'http';
import { randomUUID } from 'crypto';

const inferenceService = globalInferenceService;

const app = express();
app.use(express.json());

/*
Example body
{
  model: 'any',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' }
  ],
  "stream": true
}

Example response (stream = false)
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "gpt-3.5-turbo-0125",
  "system_fingerprint": "fp_44709d6fcb",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "\n\nHello there, how may I assist you today?",
    },
    "logprobs": null,
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 9,
    "completion_tokens": 12,
    "total_tokens": 21
  }
}

Example chunk response (stream = true)
{"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-3.5-turbo-0125", "system_fingerprint": "fp_44709d6fcb", "choices":[{"index":0,"delta":{"role":"assistant","content":""},"logprobs":null,"finish_reason":null}]}
{"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-3.5-turbo-0125", "system_fingerprint": "fp_44709d6fcb", "choices":[{"index":0,"delta":{"content":"Hello"},"logprobs":null,"finish_reason":null}]}

....

{"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-3.5-turbo-0125", "system_fingerprint": "fp_44709d6fcb", "choices":[{"index":0,"delta":{},"logprobs":null,"finish_reason":"stop"}]}
*/

function unixTimestamp() {
  return Math.floor(Date.now() / 1000);
}

function convertStringToHex(input: string) {
  return Buffer.from(input).toString('hex');
}

function systemFingerprint() {
  // const fingerprint = getFingerprint() // buffer
  // const fingerprintString = fingerprint.toString('hex')
  // return `fp_${fingerprintString}`

  return convertStringToHex('ragna-desktop');
}

function randomId() {
  return randomUUID().replace(/-/g, '').toLowerCase();
}

function formatResponse(assistantContent: any, finishReason: string | null = null) {
  const id = randomId();
  const fingerPrint = systemFingerprint();
  return {
    id: `chatcmpl-${id}`,
    object: 'chat.completion',
    created: unixTimestamp(),
    model: 'local',
    system_fingerprint: `fp_${fingerPrint}`,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: assistantContent
        },
        logprobs: null,
        finish_reason: finishReason
      }
    ]
    // usage: {
    //   prompt_tokens: 0,
    //   completion_tokens: 0,
    //   total_tokens: 0
    // }
  };
}

function formatChunkResponse(assistantContent: any, finishReason: string | null = null) {
  const id = randomId();
  const fingerPrint = systemFingerprint();
  return {
    id: `chatcmpl-${id}`,
    object: 'chat.completion.chunk',
    created: unixTimestamp(),
    model: 'local',
    system_fingerprint: `fp_${fingerPrint}`,
    choices: [
      {
        index: 0,
        delta: {
          // role: 'assistant',
          content: assistantContent
        },
        logprobs: null,
        finish_reason: finishReason
      }
    ]
  };
}

app.post('/v1/chat/completions', async (req, res) => {
  const body = req.body;
  // check if body is valid
  if (!body || !body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    res.status(400).send('Invalid request body');
    return;
  }

  const messages = body.messages;
  const lastMessageContent = messages[messages.length - 1]?.content;
  const lastMessageRole = messages[messages.length - 1]?.role;
  if (!lastMessageContent || !lastMessageRole || lastMessageRole !== 'user') {
    res.status(400).send('Invalid request body');
    return;
  }
  const history = messages.slice(0, messages.length - 1);
  const stream = body.stream || false;

  const temperature = body.temperature || 0.8;
  const maxTokens = body.max_tokens || 2500;

  const payload = {
    prompt: lastMessageContent,
    temperature,
    maxTokens,
    history: history
  };

  // console.log('GET /v1/chat/completions')
  // console.log(payload)

  res.setHeader('Access-Control-Allow-Origin', '*');

  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Cache-Control', 'no-cache');
  }

  function onNewChunk(text: string) {
    if (!stream) return;
    res.write(`data: ${JSON.stringify(formatChunkResponse(text))}\n\n`);
  }

  let assistantResponse: string | undefined;

  try {
    assistantResponse = await inferenceService.runInference(payload, onNewChunk);
  } catch (error: any) {
    res.status(500).send(error?.message || 'Internal server error');
  }

  if (!stream) {
    if (!assistantResponse) {
      res.status(500).send('Assistant response is empty');
      return;
    }
    res.send(formatResponse(assistantResponse));
    return;
  }
  res.write(`data: ${JSON.stringify(formatChunkResponse('', 'stop'))}\n\n`);
  res.write('data: [DONE]\n\n');
  res.end();
});

let server: Server;
let serverIsRunning: boolean = false;
export function startServer(payload: { port: number }) {
  if (serverIsRunning) {
    return;
  }

  server = app.listen(payload.port, () => {
    console.log(`Server listening on port ${payload.port}`);
    serverIsRunning = true;
  });

  server.on('close', function () {
    console.log('Server closed.');
    serverIsRunning = false;
  });
}

export function stopServer() {
  if (!serverIsRunning) {
    return;
  }
  server?.close();
}

export function getServerStatus() {
  return serverIsRunning;
}
