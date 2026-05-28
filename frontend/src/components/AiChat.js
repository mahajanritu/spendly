import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Mic,
  MicOff,
  FileText
} from 'lucide-react';

import API from '../utils/api';

const SUGGESTIONS = [
  'This month expenses?',
  'What are my savings?',
  'Suggest a budget',
  'Investment tips',
  'Generate monthly report',
];

const WELCOME_MESSAGE = {
  role: 'ai',
  text:
    "👋 Hi! I'm Spendly AI — your personal finance assistant!\n\nAsk me anything about your finances:\n• 💰 Expense analysis\n• 📊 Budget suggestions\n• 📈 Investment tips\n• 📋 Monthly report\n\nI'll reply in whatever language you write in! 🌐"
};

export default function AiChat() {
  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState([
    WELCOME_MESSAGE
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);

  // Speech Recognition
  useEffect(() => {
    if (
      'webkitSpeechRecognition' in window ||
      'SpeechRecognition' in window
    ) {
      const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'hi-IN';

      recognitionRef.current.onresult = (event) => {
        const transcript =
          event.results[0][0].transcript;

        setInput(transcript);
        setListening(false);
      };

      recognitionRef.current.onerror = () => {
        setListening(false);
      };

      recognitionRef.current.onend = () => {
        setListening(false);
      };
    }
  }, []);

  // Mic Start/Stop
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(
        'Speech recognition is not supported in your browser. Please use Chrome.'
      );
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  // Send Message
  const sendMessage = async (msg) => {
    const text = msg || input;

    if (!text.trim()) return;

    setInput('');

    setMessages((m) => [
      ...m,
      {
        role: 'user',
        text
      }
    ]);

    setLoading(true);

    try {
      const { data } = await API.post(
        '/ai/chat',
        {
          message: text
        }
      );

      setMessages((m) => [
        ...m,
        {
          role: 'ai',
          text: data.reply
        }
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: 'ai',
          text:
            '❌ Sorry, something went wrong. Please try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Generate Report
  const generateReport = async () => {
    setReportLoading(true);

    setMessages((m) => [
      ...m,
      {
        role: 'user',
        text: '📊 Generate my monthly financial report'
      }
    ]);

    try {
      const { data } = await API.get('/ai/report');

      setMessages((m) => [
        ...m,
        {
          role: 'ai',
          text: data.report
        }
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: 'ai',
          text:
            '❌ Report generate nahi ho saki. Dobara try karo!'
        }
      ]);
    } finally {
      setReportLoading(false);
    }
  };

  // New Chat
  const startNewChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setInput('');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background:
            'linear-gradient(135deg, #7c6bff, #5b4fcf)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow:
            '0 4px 24px rgba(124,107,255,0.6)',
          zIndex: 999
        }}
      >
        {open ? (
          <X size={24} color="white" />
        ) : (
          <MessageCircle size={24} color="white" />
        )}
      </button>

      {/* Chat Window */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 96,
            right: 24,
            width: 360,
            height: 520,
            background: 'var(--card)',
            border: '1px solid var(--border2)',
            borderRadius: 20,
            display: 'flex',
            flexDirection: 'column',
            boxShadow:
              '0 20px 60px rgba(0,0,0,0.6)',
            zIndex: 1000
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              borderBottom:
                '1px solid var(--border)',
              background:
                'linear-gradient(135deg, rgba(124,107,255,0.2), rgba(124,107,255,0.05))',
              borderRadius: '20px 20px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            {/* Left */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background:
                    'linear-gradient(135deg, #7c6bff, #5b4fcf)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18
                }}
              >
                🤖
              </div>

              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14
                  }}
                >
                  Spendly AI
                </div>

                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--green2)'
                  }}
                >
                  ● Online • Any Language
                </div>
              </div>
            </div>

            {/* Right Buttons */}
            <div
              style={{
                display: 'flex',
                gap: 8
              }}
            >
              {/* New Chat */}
              <button
                onClick={startNewChat}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border:
                    '1px solid var(--border)',
                  background: 'var(--bg3)',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: 'Sora, sans-serif'
                }}
              >
                New Chat
              </button>

              {/* Report */}
              <button
                onClick={generateReport}
                disabled={reportLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 10px',
                  borderRadius: 8,
                  background:
                    'rgba(124,107,255,0.2)',
                  border:
                    '1px solid rgba(124,107,255,0.3)',
                  cursor: 'pointer',
                  color: 'var(--accent3)',
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: 'Sora, sans-serif'
                }}
              >
                <FileText size={12} />

                {reportLoading
                  ? 'Generating...'
                  : 'Report'}
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent:
                    msg.role === 'user'
                      ? 'flex-end'
                      : 'flex-start'
                }}
              >
                {msg.role === 'ai' && (
                  <div
                    style={{
                      fontSize: 18,
                      marginRight: 6,
                      alignSelf: 'flex-end'
                    }}
                  >
                    🤖
                  </div>
                )}

                <div
                  style={{
                    maxWidth: '78%',
                    padding: '10px 14px',
                    borderRadius:
                      msg.role === 'user'
                        ? '18px 18px 4px 18px'
                        : '18px 18px 18px 4px',
                    background:
                      msg.role === 'user'
                        ? 'linear-gradient(135deg, #7c6bff, #5b4fcf)'
                        : 'var(--bg3)',
                    color: 'var(--text)',
                    fontSize: 13,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {(loading || reportLoading) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <div style={{ fontSize: 18 }}>
                  🤖
                </div>

                <div
                  style={{
                    padding: '10px 14px',
                    background: 'var(--bg3)',
                    borderRadius:
                      '18px 18px 18px 4px',
                    fontSize: 13,
                    color: 'var(--text3)'
                  }}
                >
                  Thinking... ✨
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          <div
            style={{
              padding: '6px 14px',
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              scrollbarWidth: 'none'
            }}
          >
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                style={{
                  fontSize: 11,
                  padding: '4px 10px',
                  whiteSpace: 'nowrap',
                  background: 'var(--bg3)',
                  border:
                    '1px solid var(--border)',
                  borderRadius: 20,
                  cursor: 'pointer',
                  color: 'var(--text2)',
                  fontFamily: 'Sora, sans-serif',
                  flexShrink: 0
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div
            style={{
              padding: '10px 14px',
              borderTop:
                '1px solid var(--border)',
              display: 'flex',
              gap: 8,
              alignItems: 'center'
            }}
          >
            {/* Mic */}
            <button
              onClick={toggleListening}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                flexShrink: 0,
                background: listening
                  ? 'rgba(239,68,68,0.2)'
                  : 'var(--bg3)',
                border: listening
                  ? '1px solid rgba(239,68,68,0.4)'
                  : '1px solid var(--border)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {listening ? (
                <MicOff
                  size={16}
                  color="#ef4444"
                />
              ) : (
                <Mic
                  size={16}
                  color="var(--text2)"
                />
              )}
            </button>

            {/* Input */}
            <input
              style={{
                flex: 1,
                background: 'var(--bg2)',
                border:
                  '1px solid var(--border)',
                borderRadius: 12,
                padding: '10px 12px',
                fontSize: 13,
                color: 'var(--text)',
                fontFamily: 'Sora, sans-serif',
                outline: 'none'
              }}
              placeholder={
                listening
                  ? '🎤 Listening...'
                  : 'Ask anything...'
              }
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              onKeyPress={(e) =>
                e.key === 'Enter' &&
                sendMessage()
              }
            />

            {/* Send */}
            <button
              onClick={() => sendMessage()}
              disabled={
                loading || !input.trim()
              }
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                flexShrink: 0,
                background:
                  'linear-gradient(135deg, #7c6bff, #5b4fcf)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity:
                  loading || !input.trim()
                    ? 0.5
                    : 1
              }}
            >
              <Send
                size={15}
                color="white"
              />
            </button>
          </div>
        </div>
      )}
    </>
  );
}