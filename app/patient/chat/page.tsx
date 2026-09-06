'use client';

import { usePatientStore } from '@/lib/store';
import { socratesQuestions, ayushQuestions, detectRedFlags, translations } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Mic, Volume2, VolumeX, AlertTriangle, Sparkles, Send, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import type { ChatMessage } from '@/lib/types';

export default function ChatPage() {
  const { language, ayushMode, setAyushMode, messages, addMessage, clearMessages, patientName, setStep, setRedFlagTriggered, redFlagTriggered } = usePatientStore();
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const questions = ayushMode ? ayushQuestions : socratesQuestions;
  const t = translations[language] || translations.en;

  useEffect(() => {
    if (messages.length === 0) {
      // Start with first question
      const firstQ = questions[0];
      const msg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: firstQ.question,
        timestamp: new Date().toISOString(),
        quickReplies: firstQ.quickReplies,
        source: ayushMode ? 'ayush' : 'socrates',
      };
      addMessage(msg);
      if (ttsEnabled) speakText(firstQ.question);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ayushMode]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const speakText = useCallback((text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.9;
      utter.pitch = 1;
      const voices = window.speechSynthesis.getVoices();
      const langVoice = voices.find(v => v.lang.startsWith(language === 'hi' ? 'hi' : 'en'));
      if (langVoice) utter.voice = langVoice;
      window.speechSynthesis.speak(utter);
    }
  }, [language]);

  const startListening = useCallback(() => {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice input is not supported in this browser');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
  }, [language]);

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Check for red flags
    const { triggered, matchedRules } = detectRedFlags(text);
    if (triggered && !redFlagTriggered) {
      setRedFlagTriggered(true);
      matchedRules.forEach(rule => {
        toast.error(`Red flag detected: ${rule.label}`, { duration: 6000 });
      });
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMsg);
    setInput('');
    setIsTyping(true);

    // Move to next question
    const nextIdx = currentQ + 1;
    setTimeout(() => {
      if (nextIdx < questions.length) {
        const nextQ = questions[nextIdx];
        const aiMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: nextQ.question,
          timestamp: new Date().toISOString(),
          quickReplies: nextQ.quickReplies,
          source: ayushMode ? 'ayush' : 'socrates',
        };
        addMessage(aiMsg);
        if (ttsEnabled) speakText(nextQ.question);
        setCurrentQ(nextIdx);
      } else {
        // Interview complete
        const aiMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: "Thank you! I have collected all the information. Let's move on to uploading any documents you may have, and then we'll review your summary together.",
          timestamp: new Date().toISOString(),
        };
        addMessage(aiMsg);
        if (ttsEnabled) speakText(aiMsg.content);
      }
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  const isComplete = currentQ >= questions.length - 1 && messages.filter(m => m.role === 'user').length >= questions.length;

  return (
    <div className="flex h-screen flex-col bg-gradient-to-b from-sky-50 to-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur md:px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => { router.push('/patient'); }} className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 text-white">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">AI Clinical Assistant</h2>
              <p className="text-xs text-slate-500">Question {Math.min(currentQ + 1, questions.length)} of {questions.length}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
            title={ttsEnabled ? 'Mute audio' : 'Enable audio'}
          >
            {ttsEnabled ? <Volume2 className="h-5 w-5 text-teal-600" /> : <VolumeX className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setAyushMode(!ayushMode)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              ayushMode ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            AYUSH
          </button>
        </div>
      </header>

      {/* Red flag banner */}
      {redFlagTriggered && (
        <div className="animate-pulse-ring flex items-center gap-3 border-b-2 border-red-300 bg-red-50 px-4 py-3 md:px-6">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm font-medium text-red-700">
            Urgent symptom detected. A triage nurse has been alerted. Please proceed to the triage desk if your symptoms worsen.
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-amber-50 px-4 py-2 md:px-6">
        <p className="text-center text-xs text-amber-700">{t.chatbotDisclaimer}</p>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-100">
        <div
          className="h-full bg-gradient-to-r from-sky-500 to-teal-500 transition-all duration-500"
          style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-sky-500 text-white'
                    : 'bg-white text-slate-700 shadow-sm border border-slate-100'
                }`}
              >
                <p className="text-sm leading-relaxed md:text-base">{msg.content}</p>
                {msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {msg.quickReplies.map((reply) => (
                      <button
                        key={reply}
                        onClick={() => handleSend(reply)}
                        className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm text-sky-700 transition-all hover:bg-sky-100 hover:shadow-sm"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm border border-slate-100">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 bg-white px-4 py-4 md:px-6">
        <div className="mx-auto max-w-2xl">
          {isComplete ? (
            <Button
              onClick={() => { setStep('upload'); router.push('/patient/upload'); }}
              className="h-14 w-full bg-gradient-to-r from-sky-500 to-teal-500 text-base font-semibold hover:from-sky-600 hover:to-teal-600"
            >
              Continue to Document Upload <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all ${
                  isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-sky-100 text-sky-600 hover:bg-sky-200'
                }`}
                title="Voice input"
              >
                <Mic className="h-5 w-5" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(input); }}
                placeholder={isListening ? 'Listening...' : 'Type your answer...'}
                className="h-12 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
                disabled={isListening}
              />
              <Button
                onClick={() => handleSend(input)}
                disabled={!input.trim()}
                className="h-12 w-12 shrink-0 rounded-xl bg-sky-500 hover:bg-sky-600"
                size="icon"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
