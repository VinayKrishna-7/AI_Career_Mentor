import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  MessageSquare,
  Send,
  Loader2,
  Trash2,
  Plus,
  Bot,
  User,
  AlertCircle,
  Settings,
  Key,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Code2,
  Cpu,
  Clock,
  X,
  ExternalLink,
} from 'lucide-react';

const SUGGESTED_STUDY_PROMPTS = [
  {
    icon: Clock,
    label: 'Preparation Timeline (Months)',
    query: 'How many months do I need to prepare for an SDE internship? Break down the schedule month by month.',
  },
  {
    icon: GraduationCap,
    label: 'SDE Internship Roadmap',
    query: 'I want to become an SDE intern. Give me a complete study roadmap and preparation plan.',
  },
  {
    icon: Code2,
    label: 'Master DSA & Problem Solving',
    query: 'How do I master Data Structures and Algorithms for technical interviews? Explain the core patterns.',
  },
  {
    icon: Cpu,
    label: 'Core CS (OS & DBMS)',
    query: 'Explain the essential Operating Systems and DBMS concepts required for software engineering interviews.',
  },
];

export const ChatPage = () => {
  const toast = useToast();
  const [conversations, setConversations] = useState([]);
  const [currentConvId, setCurrentConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [aiStatus, setAiStatus] = useState(null);

  // API Key Settings Modal State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configProvider, setConfigProvider] = useState('groq');
  const [configApiKey, setConfigApiKey] = useState('');
  const [configModel, setConfigModel] = useState('openai/gpt-oss-120b');
  const [configSaving, setConfigSaving] = useState(false);
  const [configSuccess, setConfigSuccess] = useState('');

  const messagesEndRef = useRef(null);

  const fetchAiStatus = async () => {
    try {
      const res = await api.get('/chat/status');
      if (res.data?.success) {
        setAiStatus(res.data.status);
        if (res.data.status?.provider) {
          setConfigProvider(res.data.status.provider);
        }
        if (res.data.status?.model) {
          setConfigModel(res.data.status.model);
        }
      }
    } catch {
      // Non-critical background status check
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      if (res.data.success) {
        setConversations(res.data.conversations);
        if (res.data.conversations.length > 0 && !currentConvId) {
          selectConversation(res.data.conversations[0].id);
        } else if (res.data.conversations.length === 0) {
          handleNewChat();
        }
      }
    } catch {
      setError('Failed to load chat history.');
    }
  };

  const selectConversation = async (convId) => {
    setCurrentConvId(convId);
    setLoading(true);
    try {
      const res = await api.get(`/chat/conversations/${convId}/messages`);
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch {
      setError('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchAiStatus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleNewChat = async () => {
    try {
      const res = await api.post('/chat/conversations', { title: 'New Study Session' });
      if (res.data.success) {
        setConversations((prev) => [res.data.conversation, ...prev]);
        setCurrentConvId(res.data.conversation.id);
        setMessages([]);
      }
    } catch {
      setError('Could not create new chat.');
    }
  };

  const sendMessageWithText = async (text) => {
    if (!text.trim() || sending) return;

    // Ensure we have an active conversation
    let targetConvId = currentConvId;
    if (!targetConvId) {
      try {
        const newConv = await api.post('/chat/conversations', { title: text.slice(0, 30) });
        targetConvId = newConv.data.conversation.id;
        setCurrentConvId(targetConvId);
        setConversations((prev) => [newConv.data.conversation, ...prev]);
      } catch {
        setError('Failed to start chat session.');
        return;
      }
    }

    const userText = text.trim();
    setInputMessage('');
    setSending(true);
    setError('');

    // Optimistically append user message
    const optimisticUserMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUserMsg]);

    try {
      const res = await api.post(`/chat/conversations/${targetConvId}/messages`, {
        content: userText,
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.assistantMessage]);
        fetchConversations();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    sendMessageWithText(inputMessage);
  };

  const handleDeleteConversation = async (convId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this study session?')) return;

    try {
      await api.delete(`/chat/conversations/${convId}`);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (currentConvId === convId) {
        setCurrentConvId(null);
        setMessages([]);
      }
      toast.info('Conversation deleted.');
    } catch {
      toast.error('Failed to delete conversation.');
    }
  };

  const handleSaveAiConfig = async (e) => {
    e.preventDefault();
    if (!configApiKey.trim()) return;

    setConfigSaving(true);
    setConfigSuccess('');
    try {
      const res = await api.post('/chat/config', {
        provider: configProvider,
        apiKey: configApiKey.trim(),
        model: configModel,
      });
      if (res.data.success) {
        setAiStatus(res.data.status);
        setConfigSuccess('API Key updated! Live model activated.');
        toast.success(`API key updated! Live ${configProvider.toUpperCase()} model activated.`);
        setTimeout(() => {
          setShowConfigModal(false);
          setConfigSuccess('');
          setConfigApiKey('');
        }, 1200);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save API config.';
      setError(msg);
      toast.error(msg);
    } finally {
      setConfigSaving(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col md:flex-row gap-4">
      {/* Conversations Sidebar */}
      <div className="w-full md:w-72 bg-[#0B0F0E] rounded-xl border border-[#2A302D] p-4 flex flex-col shrink-0 shadow-xs">
        <button
          onClick={handleNewChat}
          className="w-full py-2.5 px-4 rounded-lg bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors mb-3 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#F5F4EF]" />
          <span>New Study Session</span>
        </button>

        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-[11px] font-bold text-[#A2AAA5] uppercase tracking-wider">
            Study History
          </span>
          <span className="text-[11px] text-[#A2AAA5] font-semibold">{conversations.length}</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => selectConversation(c.id)}
              className={`p-3 rounded-lg cursor-pointer text-xs font-medium flex items-center justify-between group transition-colors border ${
                currentConvId === c.id
                  ? 'bg-[#222825] text-[#F5F4EF] font-bold border-[#2A8278]'
                  : 'text-[#A2AAA5] hover:bg-[#222825] hover:text-[#F5F4EF] border-transparent'
              }`}
            >
              <div className="truncate flex-1 pr-2">
                <span className="block truncate">{c.title}</span>
              </div>
              <button
                onClick={(e) => handleDeleteConversation(c.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 text-[#A2AAA5] hover:text-[#F5F4EF] transition-opacity cursor-pointer"
                title="Delete chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-[#101312] rounded-xl border border-[#2A302D] flex flex-col shadow-xs overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#2A302D] flex items-center justify-between gap-3 bg-[#0B0F0E]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2A8278]/20 text-[#2A8278] border border-[#2A8278]/40 flex items-center justify-center font-bold text-sm shadow-xs">
              <BookOpen className="w-4 h-4 text-[#2A8278]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#F5F4EF]">AI Career Mentor</h2>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#222825] text-[#2A8278] border border-[#2A302D]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2A8278]" />
                  Online
                </span>
              </div>
              <span className="text-[11px] text-[#A2AAA5] block">
                Study roadmaps, CS fundamentals & interview preparation
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#2A302D] bg-[#222825] hover:bg-[#2A302D] text-[#F5F4EF] text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-[#D5B777]" />
            <span>AI Settings</span>
          </button>
        </div>

        {/* Real AI Key Tip Banner when no key is set */}
        {!aiStatus?.hasKey && (
          <div className="bg-[#222825] border-b border-[#2A302D] px-4 py-2 flex items-center justify-between text-xs text-[#F5F4EF]">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-[#D5B777] shrink-0" />
              <span>
                Want responses from <strong className="text-[#D5B777]">Claude 3.5 Sonnet</strong> or <strong className="text-[#D5B777]">Gemini 1.5 Flash</strong>?
              </span>
            </div>
            <button
              onClick={() => setShowConfigModal(true)}
              className="text-xs font-bold text-[#D5B777] hover:underline ml-2 cursor-pointer"
            >
              Add API Key &rarr;
            </button>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-[#222825] border border-[#2A302D] text-[#F5F4EF] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#D5B777]" />
              <span>{error}</span>
            </div>
          )}

          {messages.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-xl bg-[#222825] border border-[#2A302D] text-[#D5B777] flex items-center justify-center shadow-xs">
                <GraduationCap className="w-6 h-6 text-[#D5B777]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F5F4EF]">
                  What study topic would you like to master today?
                </h3>
                <p className="text-xs text-[#A2AAA5] mt-1 leading-relaxed">
                  Focused on your studies: SDE internship roadmaps, deep concept definitions,
                  DSA patterns, Operating Systems, DBMS, and technical interview preparation.
                </p>
              </div>

              {/* Prompt Suggestions */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {SUGGESTED_STUDY_PROMPTS.map((p, idx) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => sendMessageWithText(p.query)}
                      className="p-3 rounded-xl border border-[#2A302D] hover:border-[#2A8278] bg-[#191E1C] hover:bg-[#222825] text-left transition-all group flex flex-col justify-between cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center gap-2 text-[#D5B777] mb-1">
                        <Icon className="w-4 h-4 text-[#D5B777]" />
                        <span className="text-xs font-bold text-[#F5F4EF] group-hover:text-[#D5B777] transition-colors">
                          {p.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#A2AAA5] line-clamp-2">
                        {p.query}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs shadow-xs ${
                    isUser
                      ? 'bg-[#2A8278] text-[#F5F4EF] border border-[#2A8278]'
                      : 'bg-[#222825] text-[#D5B777] border border-[#2A302D]'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4 text-[#F5F4EF]" /> : <Bot className="w-4 h-4 text-[#D5B777]" />}
                </div>

                <div
                  data-chat-bubble={isUser ? 'user' : 'bot'}
                  className={`p-4 rounded-xl max-w-2xl leading-relaxed text-xs sm:text-sm ${
                    isUser
                      ? 'chat-bubble-user bg-[#2A8278] text-[#F5F4EF] rounded-tr-none whitespace-pre-wrap font-medium shadow-md'
                      : 'chat-bubble-bot bg-[#191E1C] border border-[#2A302D] text-[#F5F4EF] rounded-tl-none shadow-xs'
                  }`}
                >
                  {isUser ? (
                    msg.content
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ node, ...props }) => (
                          <h1 className="text-base font-bold text-[#F5F4EF] mt-3 mb-1.5" {...props} />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2 className="text-sm font-bold text-[#D5B777] mt-3 mb-1.5" {...props} />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3 className="text-xs sm:text-sm font-bold text-[#F5F4EF] mt-3 mb-1.5 flex items-center gap-1.5" {...props} />
                        ),
                        h4: ({ node, ...props }) => (
                          <h4 className="text-xs font-semibold text-[#D5B777] mt-2 mb-1" {...props} />
                        ),
                        p: ({ node, ...props }) => (
                          <p className="mb-2 leading-relaxed text-[#F5F4EF]" {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc pl-5 mb-2.5 space-y-1 text-[#F5F4EF]" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="list-decimal pl-5 mb-2.5 space-y-1 text-[#F5F4EF]" {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="leading-relaxed text-[#F5F4EF]" {...props} />
                        ),
                        table: ({ node, ...props }) => (
                          <div className="overflow-x-auto my-3 rounded-xl border border-[#2A302D] bg-[#101312] shadow-xs">
                            <table className="min-w-full divide-y divide-[#2A302D] text-xs" {...props} />
                          </div>
                        ),
                        th: ({ node, ...props }) => (
                          <th className="bg-[#222825] px-3 py-2 text-left font-semibold text-[#D5B777] border-b border-[#2A302D]" {...props} />
                        ),
                        td: ({ node, ...props }) => (
                          <td className="px-3 py-2 border-t border-[#2A302D] text-[#F5F4EF]" {...props} />
                        ),
                        code: ({ node, inline, className, children, ...props }) => {
                          const isInline = !String(children).includes('\n');
                          return isInline ? (
                            <code className="bg-[#222825] text-[#D5B777] px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold border border-[#2A302D]" {...props}>
                              {children}
                            </code>
                          ) : (
                            <div className="my-2.5 rounded-xl bg-[#0B0F0E] text-[#F5F4EF] p-3.5 overflow-x-auto text-[11px] sm:text-xs font-mono border border-[#2A302D] shadow-xs">
                              <pre className="m-0 leading-normal">
                                <code>{children}</code>
                              </pre>
                            </div>
                          );
                        },
                        hr: () => <hr className="my-3 border-[#2A302D]" />,
                        strong: ({ node, ...props }) => (
                          <strong className="font-bold text-[#D5B777]" {...props} />
                        ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote className="border-l-4 border-[#2A8278] pl-3 py-1.5 my-2.5 bg-[#222825] rounded-r-lg text-[#F5F4EF] text-xs italic" {...props} />
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            );
          })}

          {sending && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#222825] text-[#D5B777] border border-[#2A302D] flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4 text-[#D5B777]" />
              </div>
              <div className="p-3.5 rounded-xl bg-[#191E1C] border border-[#2A302D] text-[#A2AAA5] text-xs flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#2A8278]" />
                <span className="text-[#F5F4EF]">Formulating response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-[#2A302D] flex gap-2 bg-[#0B0F0E]">
          <input
            type="text"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={sending}
            className="flex-1 px-4 py-2.5 rounded-lg border border-[#2A302D] text-xs sm:text-sm focus:outline-none bg-[#222825] text-[#F5F4EF] placeholder:text-[#A2AAA5]/60 focus:border-[#2A8278]"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || sending}
            className="px-5 py-2.5 rounded-lg bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4 text-[#F5F4EF]" />
          </button>
        </form>
      </div>

      {/* AI Model / Key Settings Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#191E1C] rounded-xl max-w-md w-full p-6 shadow-2xl border border-[#2A302D]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#222825] border border-[#2A302D] text-[#D5B777] flex items-center justify-center">
                  <Key className="w-4 h-4 text-[#D5B777]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F5F4EF]">AI Model & API Key</h3>
                  <p className="text-[11px] text-[#A2AAA5]">Configure Groq, Gemini, Claude, or OpenAI</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-lg hover:bg-[#222825] text-[#A2AAA5] hover:text-[#F5F4EF] cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAiConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#F5F4EF] mb-1">
                  AI Provider
                </label>
                <div className="grid grid-cols-4 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setConfigProvider('gemini');
                      setConfigModel('gemini-1.5-flash');
                    }}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                      configProvider === 'gemini'
                        ? 'border-[#2A8278] bg-[#2A8278] text-[#F5F4EF] font-bold shadow-xs'
                        : 'border-[#2A302D] bg-[#222825] text-[#A2AAA5] hover:text-[#F5F4EF]'
                    }`}
                  >
                    Gemini
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfigProvider('groq');
                      setConfigModel('llama-3.3-70b-versatile');
                    }}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                      configProvider === 'groq'
                        ? 'border-[#2A8278] bg-[#2A8278] text-[#F5F4EF] font-bold shadow-xs'
                        : 'border-[#2A302D] bg-[#222825] text-[#A2AAA5] hover:text-[#F5F4EF]'
                    }`}
                  >
                    Groq (Free)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfigProvider('anthropic');
                      setConfigModel('claude-3-5-sonnet-20241022');
                    }}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                      configProvider === 'anthropic' || configProvider === 'claude'
                        ? 'border-[#2A8278] bg-[#2A8278] text-[#F5F4EF] font-bold shadow-xs'
                        : 'border-[#2A302D] bg-[#222825] text-[#A2AAA5] hover:text-[#F5F4EF]'
                    }`}
                  >
                    Claude
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfigProvider('openai');
                      setConfigModel('gpt-4o-mini');
                    }}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                      configProvider === 'openai'
                        ? 'border-[#2A8278] bg-[#2A8278] text-[#F5F4EF] font-bold shadow-xs'
                        : 'border-[#2A302D] bg-[#222825] text-[#A2AAA5] hover:text-[#F5F4EF]'
                    }`}
                  >
                    OpenAI
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#F5F4EF]">
                    {configProvider === 'anthropic'
                      ? 'Anthropic Claude API Key'
                      : configProvider === 'gemini'
                      ? 'Google Gemini API Key'
                      : configProvider === 'groq'
                      ? 'Groq API Key (100% Free)'
                      : 'OpenAI API Key'}
                  </label>
                  {configProvider === 'gemini' && (
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#D5B777] underline hover:text-[#F5F4EF] flex items-center gap-0.5"
                    >
                      Get Free Key <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {configProvider === 'groq' && (
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#D5B777] underline hover:text-[#F5F4EF] flex items-center gap-0.5"
                    >
                      Get Free Key <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {configProvider === 'anthropic' && (
                    <a
                      href="https://console.anthropic.com/settings/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#D5B777] underline hover:text-[#F5F4EF] flex items-center gap-0.5"
                    >
                      Get Claude Key <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {configProvider === 'openai' && (
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#D5B777] underline hover:text-[#F5F4EF] flex items-center gap-0.5"
                    >
                      Get OpenAI Key <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                <input
                  type="password"
                  placeholder={
                    configProvider === 'anthropic'
                      ? 'sk-ant-...'
                      : configProvider === 'gemini'
                      ? 'AIzaSy...'
                      : configProvider === 'groq'
                      ? 'gsk_...'
                      : 'sk-...'
                  }
                  value={configApiKey}
                  onChange={(e) => {
                    const val = e.target.value;
                    setConfigApiKey(val);
                    if (val.startsWith('sk-ant-')) {
                      setConfigProvider('anthropic');
                      setConfigModel('claude-3-5-sonnet-20241022');
                    } else if (val.startsWith('AIza')) {
                      setConfigProvider('gemini');
                      setConfigModel('gemini-1.5-flash');
                    } else if (val.startsWith('gsk_')) {
                      setConfigProvider('groq');
                      setConfigModel('openai/gpt-oss-120b');
                    } else if (val.startsWith('sk-') && !val.startsWith('sk-ant-')) {
                      setConfigProvider('openai');
                      setConfigModel('gpt-4o-mini');
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#2A302D] text-xs focus:outline-none font-mono bg-[#222825] text-[#F5F4EF] placeholder:text-[#A2AAA5]/50 focus:border-[#2A8278]"
                  required
                />
                <p className="text-[11px] text-[#A2AAA5] mt-1">
                  {configProvider === 'anthropic'
                    ? 'Claude 3.5 Sonnet provides state-of-the-art coding and analytical mentoring.'
                    : configProvider === 'gemini'
                    ? 'Google Gemini 1.5 Flash offers high-speed, free-tier tokens for students.'
                    : configProvider === 'groq'
                    ? 'Groq delivers ultra-fast 120B parameter inference completely free.'
                    : 'Requires an OpenAI API Key with billing credits.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F5F4EF] mb-1">
                  Model Version
                </label>
                <select
                  value={configModel}
                  onChange={(e) => setConfigModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#2A302D] text-xs bg-[#222825] text-[#F5F4EF] focus:outline-none focus:border-[#2A8278] cursor-pointer"
                >
                  {configProvider === 'anthropic' ? (
                    <>
                      <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Recommended)</option>
                      <option value="claude-3-haiku-20240307">Claude 3 Haiku (Fast)</option>
                    </>
                  ) : configProvider === 'gemini' ? (
                    <>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (Free & Fast)</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
                      <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                    </>
                  ) : configProvider === 'groq' ? (
                    <>
                      <option value="openai/gpt-oss-120b">OpenAI GPT-OSS 120B (High Reasoning & Best)</option>
                      <option value="qwen/qwen3.8-27b">Qwen 3.8 27B (Fast & Accurate)</option>
                      <option value="openai/gpt-oss-20b">OpenAI GPT-OSS 20B (Ultra-Fast)</option>
                    </>
                  ) : (
                    <>
                      <option value="gpt-4o-mini">GPT-4o Mini (Fast & Efficient)</option>
                      <option value="gpt-4o">GPT-4o (Flagship Model)</option>
                    </>
                  )}
                </select>
              </div>

              {configSuccess && (
                <div className="p-2.5 rounded-xl bg-[#222825] border border-[#2A8278] text-[#F5F4EF] text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2A8278]" />
                  <span>{configSuccess}</span>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="flex-1 py-2 rounded-xl border border-[#2A302D] text-[#A2AAA5] hover:text-[#F5F4EF] bg-[#222825] hover:bg-[#2A302D] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={!configApiKey.trim() || configSaving}
                  className="flex-1 py-2 rounded-xl bg-[#2A8278] hover:bg-[#236e66] text-[#F5F4EF] text-xs font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {configSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F5F4EF]" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save & Activate</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
