
import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  Copy,
  Play,
  X
} from 'lucide-react';
import { toast } from 'sonner';

const AI_RESPONSES = {
  'why is my mac non-compliant': {
    response: "Your MacBook (MACBOOK-001) is showing as non-compliant because it's missing two key security controls:\n\n1. **FileVault encryption is disabled** - This means your data isn't encrypted if the laptop is lost or stolen\n2. **OS is outdated** - You're running macOS 14.2, but 14.3.1 is available with important security patches\n\nThese issues put your business data at risk if the device is compromised.",
    quickActions: [
      { label: "Enable FileVault Now", action: "enable_filevault", canAuto: true },
      { label: "Update macOS", action: "update_macos", canAuto: false },
      { label: "View Full Device Report", action: "view_device", canAuto: false }
    ],
    category: "endpoints"
  },
  'how do i secure my salesforce login': {
    response: "Great question! Salesforce security can be improved in several ways:\n\n**Immediate fixes:**\n1. Enable Multi-Factor Authentication (MFA) for all users\n2. Set up IP restrictions to only allow office/home IPs\n3. Enable session timeout after 2 hours of inactivity\n\n**Advanced protection:**\n- Single Sign-On (SSO) through your Google Workspace\n- Regular access reviews to remove unused accounts\n\nI can help you enable these step-by-step!",
    quickActions: [
      { label: "Enable Salesforce MFA", action: "setup_mfa", canAuto: false },
      { label: "Configure SSO", action: "setup_sso", canAuto: false },
      { label: "Review User Access", action: "review_access", canAuto: false }
    ],
    category: "apps"
  },
  'what is ce+ and how do i get certified': {
    response: "**Cyber Essentials Plus (CE+)** is a UK government-backed cybersecurity certification that proves your business has strong cyber defenses.\n\n**Why get certified?**\n- Required for many government contracts\n- Reduces cyber insurance premiums\n- Shows customers you take security seriously\n- Protects against 80% of common cyber attacks\n\n**Your current progress: 65% ready**\n\nTo get certified, you need to:\n1. Fix the remaining security gaps (I can help!)\n2. Book an assessment with a certified body\n3. Pass the technical verification\n\n**Next steps:** Let's focus on your quick wins to boost your score!",
    quickActions: [
      { label: "Show CE+ Progress", action: "show_ce_progress", canAuto: false },
      { label: "View Missing Controls", action: "view_controls", canAuto: false },
      { label: "Find Certified Assessors", action: "find_assessors", canAuto: false }
    ],
    category: "compliance"
  }
};

const SUGGESTED_QUESTIONS = [
  "Why is my Mac non-compliant?",
  "How do I secure my Salesforce login?", 
  "What is CE+ and how do I get certified?",
  "What's my biggest security risk?",
];

const CopilotContent = ({ onClose, isPanel }) => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm your AI Security Copilot. I can help you understand and fix security issues in plain English. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (message = input.trim()) => {
    if (!message) return;

    const userMessage = { id: Date.now().toString(), type: 'user', content: message, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const normalizedMessage = message.toLowerCase();
    let aiResponse = Object.entries(AI_RESPONSES).find(([key]) => normalizedMessage.includes(key) || key.includes(normalizedMessage.substring(0, 10)))?.[1];

    if (!aiResponse) {
      aiResponse = {
        response: "I can help with questions about device compliance, app security, and compliance frameworks like CE+. Try asking me one of the suggested questions!",
        quickActions: [],
        category: "general"
      };
    }

    const aiMessage = { id: (Date.now() + 1).toString(), type: 'ai', content: aiResponse.response, quickActions: aiResponse.quickActions, timestamp: new Date() };
    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };
  
  const handleQuickAction = (action) => toast.info(`Executing: ${action.label}`);
  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); toast.success('Copied to clipboard'); };

  return (
    <>
      <div className="relative border-b border-slate-700 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <Bot className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">AI Security Copilot</h3>
            <p className="text-sm text-slate-400">Your personal cybersecurity expert</p>
          </div>
        </div>
        {isPanel && (
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-slate-400" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] ${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-100'} rounded-lg p-3 shadow-md`}>
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{message.content}</pre>
                {message.quickActions?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.quickActions.map((action, index) => (
                      <Button key={index} size="sm" variant="outline" className="mr-2 mb-1 border-purple-500/50 text-purple-300 hover:bg-purple-900/30" onClick={() => handleQuickAction(action)}>
                        {action.canAuto ? <Play className="w-3 h-3 mr-1" /> : <ExternalLink className="w-3 h-3 mr-1" />}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex items-center justify-end">
                  <span className="text-xs opacity-60">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-700 text-slate-100 rounded-lg p-4 shadow-lg">
                <div className="flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-slate-700 p-4 space-y-3">
        <div className="space-y-2">
           <h4 className="text-sm font-medium text-slate-300">Suggested Questions</h4>
           {SUGGESTED_QUESTIONS.map((q, i) => (
              <button key={i} className="w-full text-left p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors text-xs text-slate-300" onClick={() => handleSendMessage(q)}>
                <Lightbulb className="w-3 h-3 inline mr-2 text-yellow-400" />
                {q}
              </button>
           ))}
        </div>
        <div className="flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your security..." className="flex-1 bg-slate-700 border-slate-600" onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} disabled={isTyping} />
          <Button onClick={() => handleSendMessage()} disabled={!input.trim() || isTyping} className="bg-purple-600 hover:bg-purple-700"><Send className="w-4 h-4" /></Button>
        </div>
      </div>
    </>
  );
};

export default function AiSecurityCopilot({ onClose, dashboardData, isPanel = false }) {
  if (isPanel) {
    return <CopilotContent onClose={onClose} isPanel={isPanel} />;
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg h-[700px] flex flex-col p-0">
        <CopilotContent onClose={onClose} isPanel={isPanel} />
      </DialogContent>
    </Dialog>
  );
}
