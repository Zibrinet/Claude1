const btn = document.getElementById('speak-btn');
const statusEl = document.getElementById('status');
const transcriptEl = document.getElementById('transcript');
const replyEl = document.getElementById('reply');

// Check browser support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  statusEl.textContent = 'Speech recognition is not supported. Please use Chrome.';
  btn.disabled = true;
}

const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

let isRecording = false;

// --- Button click: toggle recording ---
btn.addEventListener('click', () => {
  if (!isRecording) {
    transcriptEl.textContent = '';
    replyEl.textContent = '';
    recognition.start();
  } else {
    recognition.stop();
  }
});

// --- Recording started ---
recognition.addEventListener('start', () => {
  isRecording = true;
  btn.textContent = '⏹';
  btn.classList.add('recording');
  btn.title = 'Click to stop';
  statusEl.textContent = 'Listening…';
});

// --- Got a result ---
recognition.addEventListener('result', (event) => {
  const transcript = event.results[0][0].transcript;
  transcriptEl.textContent = transcript;
  sendToClaude(transcript);
});

// --- Recording ended (user stopped or browser auto-stopped) ---
recognition.addEventListener('end', () => {
  isRecording = false;
  btn.classList.remove('recording');
  btn.textContent = '🎤';
  btn.title = 'Click to speak';
});

// --- Mic or speech errors ---
recognition.addEventListener('error', (event) => {
  isRecording = false;
  btn.classList.remove('recording');
  btn.textContent = '🎤';
  btn.disabled = false;

  if (event.error === 'not-allowed') {
    statusEl.textContent = 'Microphone access denied. Please allow it and try again.';
  } else if (event.error === 'no-speech') {
    statusEl.textContent = 'No speech detected. Try again.';
  } else {
    statusEl.textContent = `Error: ${event.error}`;
  }
});

// --- Send transcript to Claude ---
async function sendToClaude(message) {
  btn.disabled = true;
  statusEl.textContent = 'Thinking…';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    replyEl.textContent = data.reply;
    speak(data.reply);
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'Something went wrong. Check the console.';
    btn.disabled = false;
  }
}

// --- Speak Claude's reply ---
function speak(text) {
  statusEl.textContent = 'Speaking…';
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 1.0;
  utterance.onend = () => {
    statusEl.textContent = 'Press the button and start talking';
    btn.disabled = false;
  };
  window.speechSynthesis.speak(utterance);
}
