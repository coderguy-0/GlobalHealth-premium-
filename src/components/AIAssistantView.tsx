import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  RefreshCw, 
  ShieldAlert, 
  BookOpen, 
  Lightbulb,
  CheckCircle2,
  FileText,
  HeartPulse,
  Pill,
  FlaskConical,
  Calendar,
  Lock
} from 'lucide-react';
import { LanguageCode } from '../types';
import { usePatientEhr } from '../context/PatientEhrContext';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sourceContext?: string;
}

interface AIAssistantViewProps {
  currentLanguage: LanguageCode;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ currentLanguage }) => {
  const { activePatient, wellness, medicationReminders, appointments } = usePatientEhr();
  // The assistant is strictly driven by the authenticated session: signed-in
  // users get answers grounded in THEIR OWN scoped record; guests get general
  // education only. It never reads another person's (or the demo patient's)
  // health details.
  const { user, requireAuth } = useAuth();
  const isSignedIn = !!user;
  const displayName = isSignedIn ? (user!.fullName || activePatient.name) : activePatient.name;
  const firstName = displayName.split(' ')[0] || 'there';

  const buildGreeting = (): string => {
    if (isSignedIn) {
      return `Hello ${firstName}! I am GlobalHealth's personal AI Health Assistant, linked to YOUR private health record (MRN: ${activePatient.mrn}).\n\nI can answer general health questions and summarize the labs, vitals, medications and appointments on your own record. If something isn't on your record yet, I'll say so — I never fill in gaps with anyone else's data.\n\n*Note: I provide educational health information only and am not a substitute for clinical diagnosis or medical care.*`;
    }
    return `Welcome! You are using GlobalHealth's AI Health Assistant in GENERAL mode.\n\nI can answer general health, wellness, nutrition and medicine questions for anyone. To ask about personal records — your labs, vitals, medications or appointments — please sign in: the assistant only accesses the health record of the account that is logged in, and never anyone else's.\n\n*Note: Educational information only — not medical advice.*`;
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: buildGreeting(),
      timestamp: 'Just now',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const suggestedPrompts = isSignedIn
    ? [
        'Show my recent lab reports',
        'What medications am I currently prescribed?',
        'Summarize my recent vitals and blood pressure',
        'When is my next upcoming appointment?',
        'How can I lower my cholesterol naturally?'
      ]
    : [
        'What is a healthy blood pressure range?',
        'How much water should I drink daily?',
        'Explain what a CBC blood test measures',
        'What are healthy sleep habits?',
        'Sign in to ask about my own health record'
      ];

  const pushAssistantMessage = (text: string, sourceContext?: string) => {
    setMessages(prev => [...prev, {
      id: `bot-${Date.now()}`,
      sender: 'assistant' as const,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sourceContext
    }]);
    setIsLoading(false);
  };

  // Guests asking record-style questions get a sign-in invitation, never data.
  const signInRequiredResponse = () =>
    `To answer questions about personal labs, vitals, medications or appointments, you need to be signed in — the assistant is linked to the health record of the logged-in account only, so I can't see (and will never show) anyone's personal details while you're a guest.\n\nUse the **Sign in** option in the navigation bar to link your own private health record. I'm still happy to help with general health questions right now!`;

  const handleSend = async (promptToSend?: string) => {
    const text = promptToSend || inputPrompt;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!promptToSend) setInputPrompt('');
    setIsLoading(true);

    const lower = text.toLowerCase();

    // Check for EHR-grounded queries first (signed-in users' OWN record only)
    if (lower.includes('lab') || lower.includes('test result') || lower.includes('cbc') || lower.includes('blood test')) {
      setTimeout(() => {
        if (!isSignedIn) return pushAssistantMessage(signInRequiredResponse(), 'Authentication Required');
        const labs = activePatient.labReports || [];
        let resp = `Here is the laboratory diagnostic record on YOUR file, ${firstName}:\n\n`;
        if (labs.length > 0) {
          labs.forEach(l => {
            resp += `🧪 **${l.testName}**\n- **Result:** ${l.resultValue} ${l.unit} (Ref: ${l.referenceRange})\n- **Status:** ${l.status}\n- **Date:** ${new Date(l.performedAt).toLocaleDateString()}\n- **Review Status:** ${l.reviewStatus || 'REVIEWED'} by ${l.reviewedBy || 'your care team'}\n- **Physician Note:** ${l.doctorNotes}\n\n`;
          });
        } else {
          resp += `No lab panels are on your record yet. Labs appear here once you or your authorized care team add them (e.g. from the Medical Tests or Health Records sections). I won't substitute another person's results for yours.\n\nIn the meantime, I can explain what any lab test measures and what the reference ranges mean — just ask!`;
        }
        pushAssistantMessage(resp, `Your personal EHR (MRN: ${activePatient.mrn})`);
      }, 500);
      return;
    }

    if (lower.includes('medication') || lower.includes('prescription') || lower.includes('pills') || lower.includes('drugs')) {
      setTimeout(() => {
        if (!isSignedIn) return pushAssistantMessage(signInRequiredResponse(), 'Authentication Required');
        const meds = activePatient.currentMedications || [];
        if (meds.length === 0 && medicationReminders.length === 0) {
          return pushAssistantMessage(
            `There are no medications or prescriptions on YOUR record yet, ${firstName}. Your own medications will appear here as soon as they are added — I never show anyone else's prescription list.\n\nIf you'd like, tell me the name of a medicine and I can share general educational information about what it treats, common dosing patterns and side effects to discuss with your doctor.`,
            `Your personal EHR (MRN: ${activePatient.mrn})`
          );
        }
        let resp = `Here are the active medications on YOUR record:\n\n`;
        meds.forEach(m => {
          resp += `💊 **${m}**\n`;
        });
        if (medicationReminders.length > 0) {
          resp += `\n**Active Dosing Reminders:**\n`;
          medicationReminders.forEach(r => {
            resp += `• ${r.name} at ${r.time} (${r.takenToday ? '✓ Taken today' : 'Pending'}) - ${r.notes || ''}\n`;
          });
        }
        pushAssistantMessage(resp, `Your personal EHR (MRN: ${activePatient.mrn})`);
      }, 500);
      return;
    }

    if (lower.includes('vital') || lower.includes('blood pressure') || lower.includes('weight') || lower.includes('bmi') || lower.includes('bp')) {
      setTimeout(() => {
        if (!isSignedIn) return pushAssistantMessage(signInRequiredResponse(), 'Authentication Required');
        const v = activePatient.recentVitals;
        const hasVitals = (v && (v.hr > 0 || !v.bp.startsWith('—'))) || wellness.weightKg > 0 || (activePatient.vitalsHistory || []).length > 0;
        if (!hasVitals) {
          return pushAssistantMessage(
            `No vitals have been recorded on YOUR record yet, ${firstName}. Once you log blood pressure, weight or other readings from your Health Dashboard, I can summarize your trends here.\n\nFor general reference: normal resting blood pressure is around 120/80 mmHg, normal resting heart rate is 60–100 BPM, and SpO2 is typically 95% or above. Ask me about any of these in general terms anytime!`,
            `Your personal EHR (MRN: ${activePatient.mrn})`
          );
        }
        const resp = `Here are the latest vitals on YOUR record:\n\n• **Blood Pressure:** ${v.bp} (Resting)\n• **Heart Rate:** ${v.hr} BPM\n• **Blood Oxygen (SpO2):** ${v.spo2}%\n• **Body Weight:** ${wellness.weightKg} kg (Target: ${wellness.targetWeightKg} kg)\n• **Height:** ${wellness.heightCm} cm\n• **Calculated BMI:** ${+(wellness.weightKg / Math.pow((wellness.heightCm || 175) / 100, 2)).toFixed(1)} kg/m²\n\n*Recorded by you and your authorized care team.*`;
        pushAssistantMessage(resp, `Your personal EHR (MRN: ${activePatient.mrn})`);
      }, 500);
      return;
    }

    if (lower.includes('appointment') || lower.includes('doctor') || lower.includes('consult')) {
      setTimeout(() => {
        if (!isSignedIn) return pushAssistantMessage(signInRequiredResponse(), 'Authentication Required');
        let resp = `Here are the appointments on YOUR schedule:\n\n`;
        if (appointments.length > 0) {
          appointments.forEach(a => {
            resp += `📅 **${a.doctorName || 'Attending Physician'}** (${a.type})\n- **Date & Time:** ${a.date} at ${a.time}\n- **Status:** ${a.status}\n- **Location:** ${a.roomOrDesk || 'Clinic Room 302'}\n\n`;
          });
        } else {
          resp += `No appointments are scheduled on your record yet. You can book one from the Appointments section — it will then be saved to your own private schedule.`;
        }
        pushAssistantMessage(resp, 'GlobalHealth Appointment Service');
      }, 500);
      return;
    }

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          language: currentLanguage,
          // Only the signed-in caller's OWN basic identity is shared — never
          // any other account's or the demo patient's data.
          userContext: isSignedIn
            ? { displayName: user!.fullName, mrn: activePatient.mrn, authenticated: true }
            : { authenticated: false },
        }),
      });

      const data = await res.json();

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.response || 'I am sorry, I could not generate a response at this moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'An error occurred while communicating with the AI server. Please check your network connection and try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 lg:px-8 space-y-6">
        {/* Header Title */}
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 text-teal-700 font-semibold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="h-4 w-4" /> Connected Patient Health & Wellness Assistant
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                AI Health Assistant & EHR Navigator
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                {isSignedIn
                  ? `Answering for ${displayName} — using your own record and general medical knowledge only.`
                  : 'Answering general health questions for guests. Sign in to link your own private health record.'}
              </p>
            </div>
            {isSignedIn ? (
              <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>EHR Linked: {activePatient.mrn}</span>
              </div>
            ) : (
              <button
                onClick={() => requireAuth({ feature: 'link your personal health record to the AI assistant' }, 'login')}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-semibold hover:bg-slate-800 transition"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign in to link your EHR</span>
              </button>
            )}
          </div>
        </div>

        {/* Medical Disclaimer Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Educational AI Tool:</strong> {isSignedIn
              ? 'Answers are grounded in medical literature and your own authorized EHR record for educational reference only. Do not rely on AI for acute emergency diagnosis or medication changes.'
              : 'Answers are general educational information. Personal records are only available to the signed-in account owner — the assistant never displays anyone else’s health details.'}
          </p>
        </div>

        {/* Chat Window */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-md flex flex-col h-[520px] overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-teal-100 text-teal-700">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isAssistant
                        ? 'bg-slate-100 text-slate-800 rounded-tl-xs'
                        : 'bg-teal-700 text-white rounded-tr-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    
                    {msg.sourceContext && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[10px] font-mono text-teal-700 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        Source: {msg.sourceContext}
                      </div>
                    )}

                    <span
                      className={`block text-[10px] mt-2 font-medium ${
                        isAssistant ? 'text-slate-400' : 'text-teal-200'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {!isAssistant && (
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-slate-900 text-white">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-teal-100 text-teal-700">
                  <Bot className="h-4 w-4 animate-spin" />
                </div>
                <div className="rounded-2xl bg-slate-100 p-3 text-xs text-slate-500 font-medium">
                  {isSignedIn ? 'Analyzing health query and checking your EHR repository...' : 'Researching your general health question...'}
                </div>
              </div>
            )}
          </div>

          {/* Suggested Prompts Pill Bar */}
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Quick Queries:
            </span>
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="whitespace-nowrap rounded-xl bg-white border border-slate-200 px-3 py-1 text-[11px] text-slate-700 font-medium hover:border-teal-400 hover:text-teal-700 transition"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder={isSignedIn
                  ? `Ask a question or query your own EHR, ${firstName} (e.g. 'Show my lab reports')...`
                  : "Ask a general health question (sign in to query a personal EHR)..."}
                className="flex-1 bg-slate-50 rounded-xl border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-teal-500"
              />
              <button
                type="submit"
                disabled={!inputPrompt.trim() || isLoading}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-700 text-white hover:bg-teal-800 disabled:opacity-50 transition"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
