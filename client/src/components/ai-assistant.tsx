import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  userRole: 'manager' | 'owner';
}

export function AIAssistant({ userRole }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hello! I'm your AI assistant for ${userRole} operations. I can help you with analytics insights, task management, employee reports, and system optimization. How can I assist you today?`,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestions = userRole === 'owner' ? [
    "📊 Show me this week's performance metrics",
    "👥 Which employees need attention?", 
    "💰 Revenue analysis for this quarter",
    "🎯 Suggest operational improvements",
    "📈 Generate executive summary report"
  ] : [
    "📋 Help me create a new task template",
    "⏰ Schedule recurring maintenance tasks",
    "👤 Show employee progress reports",
    "🎯 Suggest team productivity improvements",
    "📝 Generate team performance summary"
  ];

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = userRole === 'owner' ? [
        "Based on your recent data, employee productivity is up 15% this month. Your Douglas Forest RV Resort is performing exceptionally well in guest satisfaction scores.",
        "I've analyzed your operational metrics. Three key areas for improvement: 1) Pool maintenance scheduling could be optimized, 2) Guest check-in process could be streamlined, 3) Staff training completion rates need attention.",
        "Revenue analysis shows strong performance in premium site bookings. Consider implementing dynamic pricing for peak seasons to maximize profitability.",
        "Your employee handbook completion rate is 85%. I recommend sending gentle reminders to the remaining 15% and consider gamifying the completion process.",
      ] : [
        "I can help you create a recurring 'Pool Chemical Testing' task that runs daily at 8 AM and 6 PM. This will ensure consistent maintenance and compliance.",
        "Your team has completed 78% of assigned SOPs this week. Top performers are Sarah (95%) and Mike (89%). Consider recognizing their excellent work.",
        "I suggest creating a 'Guest Service Excellence' task template that includes: greeting standards, issue resolution steps, and follow-up procedures.",
        "Based on recent incident reports, I recommend scheduling additional safety training sessions for the maintenance team, particularly around equipment handling.",
      ];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating Assistant Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            size="lg"
            onClick={() => setIsOpen(true)}
            className="rounded-full h-14 w-14 shadow-lg bg-gradient-to-r from-primary to-secondary hover:shadow-xl relative overflow-hidden group"
            data-testid="button-ai-assistant"
          >
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="h-6 w-6" />
            </motion.div>
            <motion.div
              className="absolute inset-0 bg-white/20 rounded-full"
              animate={{
                scale: [0, 2, 0],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          </Button>
        </motion.div>
      </motion.div>

      {/* Assistant Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card className="shadow-2xl border-0">
                <CardHeader className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      <CardTitle className="text-lg">AI Assistant</CardTitle>
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        {userRole}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="text-primary-foreground hover:bg-white/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <ScrollArea className="h-96 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.type === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <span className="text-xs opacity-70 mt-1 block">
                              {message.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                      
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-start"
                        >
                          <div className="bg-muted p-3 rounded-lg">
                            <div className="flex space-x-1">
                              <motion.div
                                className="w-2 h-2 bg-current rounded-full"
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                              />
                              <motion.div
                                className="w-2 h-2 bg-current rounded-full"
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                              />
                              <motion.div
                                className="w-2 h-2 bg-current rounded-full"
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </ScrollArea>
                  
                  {/* Quick Suggestions */}
                  <div className="p-4 border-t bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-2">Quick suggestions:</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {suggestions.slice(0, 3).map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => handleSendMessage(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Input Area */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask me anything..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSendMessage(inputValue);
                          }
                        }}
                        className="flex-1"
                        data-testid="input-ai-message"
                      />
                      <Button
                        onClick={() => handleSendMessage(inputValue)}
                        disabled={!inputValue.trim() || isTyping}
                        data-testid="button-send-message"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}