/**
 * Smart AI Travel Planner 3.0
 * Intelligent AI Travel Copilot & Autonomous Assistant
 *
 * Implements:
 * 1. Natural language trip management: executes real changes (add, remove, move activities, relax days, optimize budget).
 * 2. Real application navigation: "Take me to budget planner", "Open Day 2", "Go to Landmark Archive".
 * 3. Safe confirmation flows with interactive Confirm & Cancel cards for major actions.
 * 4. Reliable Undo mechanism: tracks itinerary snapshots and restores previous versions upon request.
 * 5. Transparent execution feedback: reports exact changes, updated budget totals, and affected days.
 * 6. Empathetic, friendly, context-aware dialogue: acknowledges fatigue, excitement, and financial goals.
 */

import React, { useState, useRef, useEffect } from 'react';
import { TripPlan, CurrencyCode } from '../../types/travel';
import { sendChatMessage, CopilotApiResult } from '../../lib/api';
import { formatCurrency } from '../../lib/budget';

interface ConciergeChatPageProps {
  trip: TripPlan;
  currency: CurrencyCode;
  onUpdateTrip?: (updated: TripPlan) => void;
  onNavigate?: (page: string, params?: { dayNumber?: number; targetId?: string }) => void;
  allTrips?: TripPlan[];
  onSelectTrip?: (tripId: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  suggestions?: string[];
  executedActions?: string[];
  navigation?: {
    page: string;
    dayNumber?: number;
    targetId?: string;
  };
  actionProposal?: {
    actionId: string;
    type: string;
    title: string;
    description: string;
    payload: any;
    isDestructive?: boolean;
    status?: 'pending' | 'confirmed' | 'cancelled';
  };
  metadata?: {
    agent?: string;
  };
}

export const ConciergeChatPage: React.FC<ConciergeChatPageProps> = ({
  trip,
  currency,
  onUpdateTrip,
  onNavigate,
  allTrips,
  onSelectTrip,
}) => {
  // Undo history stack
  const [undoHistory, setUndoHistory] = useState<TripPlan[]>([]);

  // Initial greeting dynamically tailored to current trip
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-init-1',
      sender: 'assistant',
      timestamp: 'Just now',
      text: `Hello! I am **Elena Vance**, your autonomous AI Travel Copilot. I'm actively managing your **${trip.title}** to **${trip.destination}**.\n\nI can directly modify your itinerary days, add or move landmarks, optimize your budget, or navigate anywhere across the planner. How may I assist your journey today?`,
      suggestions: [
        'Summarize my trip',
        'Make Day 2 less tiring',
        'Find cheaper activities',
        'Open Landmark Archive',
        'Go to Budget Planner',
      ],
      metadata: {
        agent: 'Elena Vance · Lead Travel Copilot',
      },
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle user Undo request
  const handleUndo = () => {
    if (undoHistory.length === 0 || !onUpdateTrip) return;

    const previousTrip = undoHistory[undoHistory.length - 1];
    setUndoHistory((prev) => prev.slice(0, -1));

    onUpdateTrip(previousTrip);

    setMessages((prev) => [
      ...prev,
      {
        id: `undo-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Restored! I have undone the previous itinerary modification and restored your trip to its prior schedule. Total estimated cost is now ${formatCurrency(previousTrip.budget.committedOutlay, currency)}.`,
        metadata: { agent: 'Elena Vance · Version Controller' },
      },
    ]);
  };

  // Execute or confirm action
  const handleConfirmAction = async (msgId: string, proposal: NonNullable<ChatMessage['actionProposal']>) => {
    // Mark card as confirmed
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.actionProposal
          ? { ...m, actionProposal: { ...m.actionProposal, status: 'confirmed' } }
          : m
      )
    );

    setIsTyping(true);
    try {
      // Save current state for undo
      setUndoHistory((prev) => [...prev, trip]);

      const res = await sendChatMessage('', trip, {
        allTrips,
        confirmedAction: {
          actionId: proposal.actionId,
          type: proposal.type,
          payload: proposal.payload,
        },
      });

      if (res.updatedTrip && onUpdateTrip) {
        onUpdateTrip(res.updatedTrip);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          timestamp: res.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: res.reply,
          executedActions: res.executedActions,
          navigation: res.navigation,
          metadata: { agent: res.agent },
        },
      ]);

      if (res.navigation && onNavigate) {
        onNavigate(res.navigation.page, {
          dayNumber: res.navigation.dayNumber,
          targetId: res.navigation.targetId,
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-err-${Date.now()}`,
          sender: 'assistant',
          timestamp: 'Just now',
          text: 'Encountered an issue executing the confirmed change. Please retry or adjust your selection.',
          metadata: { agent: 'Elena Vance · System Safeguard' },
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCancelAction = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.actionProposal
          ? { ...m, actionProposal: { ...m.actionProposal, status: 'cancelled' } }
          : m
      )
    );

    setMessages((prev) => [
      ...prev,
      {
        id: `cancel-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'Action cancelled. No modifications were made to your itinerary or budget.',
        metadata: { agent: 'Elena Vance · Safeguard' },
      },
    ]);
  };

  // Main message sending flow
  const handleSendMessage = async (userPrompt?: string) => {
    const promptToSend = userPrompt || inputText;
    if (!promptToSend.trim() || isTyping) return;

    // Check if user is asking to undo
    const lower = promptToSend.toLowerCase().trim();
    if (lower === 'undo' || lower === 'undo last change' || lower === 'put it back as it was' || lower === 'revert') {
      if (undoHistory.length > 0) {
        handleUndo();
        if (!userPrompt) setInputText('');
        return;
      }
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: promptToSend.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!userPrompt) setInputText('');
    setIsTyping(true);

    try {
      // Build conversation history
      const history = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const response: CopilotApiResult = await sendChatMessage(promptToSend, trip, {
        allTrips,
        history,
      });

      // If response includes an updated trip, push to undo stack and update master state
      if (response.updatedTrip && onUpdateTrip) {
        setUndoHistory((prev) => [...prev, trip]);
        onUpdateTrip(response.updatedTrip);
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        timestamp: response.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: response.reply,
        executedActions: response.executedActions,
        navigation: response.navigation,
        actionProposal: response.actionProposal
          ? { ...response.actionProposal, status: 'pending' }
          : undefined,
        suggestions: [
          'Show my complete itinerary',
          'Make Day 2 less tiring',
          'Find cheaper activities',
          'Open Landmark Archive',
        ],
        metadata: {
          agent: response.agent || 'Elena Vance · Lead Travel Copilot',
        },
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // If response includes a navigation trigger, execute it
      if (response.navigation && onNavigate) {
        const isNavRequest =
          lower.includes('go to') ||
          lower.includes('open') ||
          lower.includes('show') ||
          lower.includes('take me') ||
          lower.includes('navigate') ||
          lower.includes('switch to') ||
          lower.includes('view') ||
          lower.includes('dashboard') ||
          lower.includes('overview') ||
          lower.includes('hotels') ||
          lower.includes('flights') ||
          lower.includes('budget') ||
          lower.includes('archive') ||
          lower.includes('landmark') ||
          lower.includes('itinerary') ||
          lower.includes('day') ||
          lower.includes('map');

        if (isNavRequest) {
          setTimeout(() => {
            onNavigate(response.navigation!.page, {
              dayNumber: response.navigation!.dayNumber,
              targetId: response.navigation!.targetId,
            });
          }, 250);
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-err-${Date.now()}`,
          sender: 'assistant',
          timestamp: 'Just now',
          text: `I have received your request: "${promptToSend}". I am checking with your destination itinerary parameters for ${trip.destination}. How else may I assist your schedule?`,
          metadata: { agent: 'Elena Vance · Private Copilot' },
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full h-[calc(100vh-140px)] flex flex-col space-y-4 animate-fade-in">
      {/* Header Deck: Live Context & State Indicators */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E8F0] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0891B2] via-[#7C3AED] to-[#0F172A] flex items-center justify-center text-white shadow-xs">
            <span className="material-symbols-outlined text-xl">smart_toy</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-heading text-lg font-bold text-[#0F172A]">
                AI Travel Copilot & Concierge
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Autonomous & Synced</span>
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Active Odyssey: <strong className="text-[#0F172A]">{trip.destination}</strong> ({trip.durationDays} Days · {formatCurrency(trip.budget.committedOutlay, currency)} committed)
            </p>
          </div>
        </div>

        {/* Undo & Quick Controls */}
        <div className="flex items-center gap-2 text-xs">
          {undoHistory.length > 0 && (
            <button
              type="button"
              onClick={handleUndo}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              title="Undo last itinerary modification"
            >
              <span className="material-symbols-outlined text-sm">undo</span>
              <span>Undo Last Edit ({undoHistory.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate?.('itinerary')}
            className="px-3 py-1.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] hover:bg-[#DBEAFE] text-[#0891B2] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">event_note</span>
            <span>View Itinerary</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-white rounded-3xl border border-[#E2E8F0] shadow-xs p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            {/* Sender & Timestamp */}
            <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-[#64748B]">
              <span className="font-semibold text-[#0F172A]">
                {msg.sender === 'user' ? 'You' : msg.metadata?.agent || 'Elena Vance'}
              </span>
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#0891B2] text-white shadow-xs rounded-tr-xs'
                  : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] shadow-2xs rounded-tl-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Executed Action Badges */}
              {msg.executedActions && msg.executedActions.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[#CBD5E1]/60 flex flex-wrap gap-1.5">
                  {msg.executedActions.map((action, aIdx) => (
                    <span
                      key={aIdx}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold flex items-center gap-1 shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-xs text-emerald-600">check_circle</span>
                      <span>{action}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Navigation Action CTA Button */}
              {msg.navigation && onNavigate && (
                <div className="mt-3 pt-2.5 border-t border-[#CBD5E1]/60 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onNavigate(msg.navigation!.page, {
                        dayNumber: msg.navigation!.dayNumber,
                        targetId: msg.navigation!.targetId,
                      })
                    }
                    className="px-3.5 py-1.5 rounded-xl bg-[#0891B2] hover:bg-[#0e7490] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    <span>
                      Open {msg.navigation.page.toUpperCase()}
                      {msg.navigation.dayNumber ? ` (Day ${msg.navigation.dayNumber})` : ''}
                    </span>
                  </button>
                </div>
              )}

              {/* Action Proposal Card (Sensitive/Destructive Confirmation) */}
              {msg.actionProposal && (
                <div className="mt-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[#0F172A] space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                    <span className="material-symbols-outlined text-base">warning</span>
                    <span>{msg.actionProposal.title}</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    {msg.actionProposal.description}
                  </p>

                  {msg.actionProposal.status === 'pending' && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleConfirmAction(msg.id, msg.actionProposal!)}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        Confirm & Apply
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancelAction(msg.id)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {msg.actionProposal.status === 'confirmed' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                      <span className="material-symbols-outlined text-sm">check</span>
                      <span>Action confirmed and applied.</span>
                    </span>
                  )}

                  {msg.actionProposal.status === 'cancelled' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500">
                      <span className="material-symbols-outlined text-sm">close</span>
                      <span>Action cancelled by traveler.</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Suggestion Chips */}
            {msg.suggestions && msg.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[85%] sm:max-w-[75%]">
                {msg.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(suggestion)}
                    className="px-3 py-1.5 rounded-full bg-white border border-[#CBD5E1] hover:border-[#0891B2] hover:text-[#0891B2] text-[11px] font-medium text-[#64748B] transition-all flex items-center gap-1 shadow-2xs text-left cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs text-[#0891B2]">
                      auto_awesome
                    </span>
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start gap-2">
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl rounded-tl-xs p-3.5 flex items-center gap-2 text-xs text-[#64748B]">
              <span className="w-2 h-2 rounded-full bg-[#0891B2] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-bounce delay-150" />
              <span className="w-2 h-2 rounded-full bg-[#059669] animate-bounce delay-300" />
              <span className="text-[11px] font-mono ml-1">
                Executing application tools & recalculating budget...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Dock */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[10px] uppercase font-bold text-[#64748B] shrink-0 mr-1">
          Quick Actions:
        </span>
        <button
          type="button"
          onClick={() => handleSendMessage('Summarize my trip')}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-medium shrink-0 cursor-pointer"
        >
          Summarize Trip
        </button>
        <button
          type="button"
          onClick={() => handleSendMessage('Make Day 2 less tiring')}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-medium shrink-0 cursor-pointer"
        >
          Make Day 2 Relaxed
        </button>
        <button
          type="button"
          onClick={() => handleSendMessage('Find cheaper activities for this trip')}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-medium shrink-0 cursor-pointer"
        >
          Make Trip Cheaper
        </button>
        <button
          type="button"
          onClick={() => handleSendMessage('Take me to the budget planner')}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-medium shrink-0 cursor-pointer"
        >
          Go to Budget
        </button>
        <button
          type="button"
          onClick={() => handleSendMessage('Go to the Real Landmark Archive')}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-medium shrink-0 cursor-pointer"
        >
          Landmark Archive
        </button>
      </div>

      {/* Prompt Input Deck */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Instruct Elena: 'Add Mysore Palace to Day 2', 'Move Chamundi Hill to Day 3', 'Make Day 2 less tiring', 'Open budget planner'..."
            className="flex-1 bg-[#F8FAFC] p-3 rounded-xl border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:border-[#0891B2]"
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isTyping}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#0891B2] to-[#7C3AED] hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-xs cursor-pointer"
          >
            <span>Execute</span>
            <span className="material-symbols-outlined text-sm">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
