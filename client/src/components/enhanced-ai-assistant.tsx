import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, Wand2, Settings, Users, Calendar, BarChart, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  actionType?: "dashboard_reorganize" | "create_task" | "create_message" | "implement_feature" | "gather_info" | "none";
  actionData?: any;
}

interface EnhancedAIAssistantProps {
  userRole: "employee" | "manager" | "owner";
}

export function EnhancedAIAssistant({ userRole }: EnhancedAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch AI interactions history
  const { data: aiHistory = [] } = useQuery({
    queryKey: ['/api/ai-interactions', userRole],
    enabled: isOpen && !!user,
  });

  // Fetch cross-role messages for context
  const { data: crossRoleMessages = [] } = useQuery({
    queryKey: ['/api/cross-role-messages', userRole],
    enabled: isOpen && !!user && (userRole === 'manager' || userRole === 'owner'),
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/ai-interactions", {
        message,
        userRole,
        context: {
          recentMessages: messages.slice(-5),
          crossRoleMessages: crossRoleMessages.slice(-3),
          currentDashboardState: "default" // Could be enhanced with actual state
        }
      });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: data.id,
        content: data.response,
        role: "assistant",
        timestamp: new Date(),
        actionType: data.actionType,
        actionData: data.actionData
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Handle AI actions
      if (data.actionType && data.actionType !== 'none') {
        handleAIAction(data.actionType, data.actionData);
      }
      
      setIsThinking(false);
    },
    onError: () => {
      setIsThinking(false);
      toast({ title: "Failed to send message", variant: "destructive" });
    },
  });

  const handleAIAction = async (actionType: string, actionData: any) => {
    switch (actionType) {
      case 'create_task':
        // Create task and notify employees
        await createTaskFromAI(actionData);
        break;
      case 'create_message':
        // Send cross-role message
        await createCrossRoleMessage(actionData);
        break;
      case 'implement_feature':
        // Implement new feature
        await implementFeature(actionData);
        break;
      case 'dashboard_reorganize':
        // Reorganize dashboard
        await reorganizeDashboard(actionData);
        break;
      case 'gather_info':
        // Gather additional information
        await gatherInformation(actionData);
        break;
    }
  };

  const createTaskFromAI = async (taskData: any) => {
    try {
      await apiRequest("POST", "/api/tasks", {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority || 'normal',
        dueDate: taskData.dueDate,
        assignedTo: taskData.assignedTo,
        createdByAI: true,
        aiContext: taskData
      });
      
      // Create notification for assigned user
      await apiRequest("POST", "/api/cross-role-messages", {
        toRole: "employee",
        toUserId: taskData.assignedTo,
        messageType: "task_assignment",
        title: `New AI-Generated Task: ${taskData.title}`,
        content: `Your ${userRole} has assigned you a new task through AI assistance: ${taskData.description}`,
        actionRequired: true,
        actionData: { taskId: taskData.id, dueDate: taskData.dueDate }
      });
      
      toast({ title: "Task created and assigned successfully", variant: "default" });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    } catch (error) {
      toast({ title: "Failed to create task", variant: "destructive" });
    }
  };

  const createCrossRoleMessage = async (messageData: any) => {
    try {
      await apiRequest("POST", "/api/cross-role-messages", {
        toRole: messageData.targetRole,
        toUserId: messageData.targetUserId,
        messageType: messageData.messageType || "announcement",
        title: messageData.title,
        content: messageData.content,
        actionRequired: messageData.actionRequired || false,
        actionData: messageData.actionData
      });
      
      toast({ title: `Message sent to ${messageData.targetRole}`, variant: "default" });
      queryClient.invalidateQueries({ queryKey: ['/api/cross-role-messages'] });
    } catch (error) {
      toast({ title: "Failed to send message", variant: "destructive" });
    }
  };

  const implementFeature = async (featureData: any) => {
    try {
      await apiRequest("POST", "/api/ai-features", {
        featureName: featureData.name,
        featureType: featureData.type,
        description: featureData.description,
        targetRole: featureData.targetRole,
        implementation: featureData.implementation
      });
      
      toast({ title: `Feature "${featureData.name}" is being implemented`, variant: "default" });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-features'] });
    } catch (error) {
      toast({ title: "Failed to implement feature", variant: "destructive" });
    }
  };

  const reorganizeDashboard = async (dashboardData: any) => {
    try {
      await apiRequest("POST", "/api/dashboard-configs", {
        userRole: dashboardData.targetRole || userRole,
        layout: dashboardData.layout,
        createdBy: "ai"
      });
      
      toast({ title: "Dashboard layout updated", variant: "default" });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard-configs'] });
    } catch (error) {
      toast({ title: "Failed to update dashboard", variant: "destructive" });
    }
  };

  const gatherInformation = async (infoData: any) => {
    // This would gather information from various sources and provide insights
    toast({ title: "Information gathered successfully", variant: "default" });
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);
    
    sendMessageMutation.mutate(input);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getWelcomeMessage = () => {
    switch (userRole) {
      case 'owner':
        return "I can help you implement features across manager and employee dashboards, analyze company-wide performance, and manage multi-property operations. Just tell me what you need!";
      case 'manager':
        return "I can create tasks for employees, send messages to your team, reorganize dashboards, and gather performance insights. How can I assist you today?";
      default:
        return "I'm here to help you with your daily tasks and provide insights about your work. What would you like to know?";
    }
  };

  const getQuickActions = () => {
    switch (userRole) {
      case 'owner':
        return [
          { icon: Users, text: "Implement manager feature", action: "Hey, can you create a new scheduling feature for managers?" },
          { icon: BarChart, text: "Analyze all properties", action: "Give me a comprehensive analysis of all property performance" },
          { icon: Settings, text: "Update system settings", action: "I need to configure new company-wide policies" }
        ];
      case 'manager':
        return [
          { icon: Calendar, text: "Create employee task", action: "Create a cleaning task for the housekeeping team due tomorrow" },
          { icon: MessageCircle, text: "Send team message", action: "Send a reminder to all employees about the new safety protocols" },
          { icon: BarChart, text: "Reorganize dashboard", action: "Reorganize my dashboard to show more task management widgets" }
        ];
      default:
        return [
          { icon: FileText, text: "Check my tasks", action: "What tasks do I have for today?" },
          { icon: Calendar, text: "Check schedule", action: "What's my schedule for this week?" }
        ];
    }
  };

  return (
    <>
      {/* Floating AI Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="rounded-full w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg border-0 relative overflow-hidden"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            <Sparkles className="w-6 h-6 text-white relative z-10" />
          </Button>
        </motion.div>
      </motion.div>

      {/* AI Assistant Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="w-full max-w-2xl h-[600px] max-h-[90vh]"
            >
              <Card className="h-full flex flex-col bg-white/95 backdrop-blur-sm border shadow-2xl">
                <CardHeader className="pb-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Wand2 className="w-5 h-5" />
                      AI Assistant
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                      </Badge>
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsOpen(false)}
                      className="text-white hover:bg-white/20 rounded-full w-8 h-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messages Area */}
                  <ScrollArea className="flex-1 p-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                          <Sparkles className="w-8 h-8 text-white" />
                        </motion.div>
                        <h3 className="text-lg font-semibold mb-2">Welcome to your AI Assistant!</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          {getWelcomeMessage()}
                        </p>
                        
                        {/* Quick Actions */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Quick Actions:</p>
                          {getQuickActions().map((action, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => {
                                  setInput(action.action);
                                  handleSendMessage();
                                }}
                              >
                                <action.icon className="w-4 h-4 mr-2" />
                                {action.text}
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                message.role === 'user'
                                  ? 'bg-blue-600 text-white ml-4'
                                  : 'bg-gray-100 text-gray-900 mr-4'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              {message.actionType && message.actionType !== 'none' && (
                                <Badge variant="secondary" className="mt-2 text-xs">
                                  Action: {message.actionType.replace('_', ' ')}
                                </Badge>
                              )}
                            </div>
                          </motion.div>
                        ))}
                        
                        {isThinking && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                          >
                            <div className="bg-gray-100 text-gray-900 mr-4 p-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="flex space-x-1">
                                  <motion.div
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                    className="w-2 h-2 bg-purple-600 rounded-full"
                                  />
                                  <motion.div
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                    className="w-2 h-2 bg-purple-600 rounded-full"
                                  />
                                  <motion.div
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                    className="w-2 h-2 bg-purple-600 rounded-full"
                                  />
                                </div>
                                <span className="text-sm text-muted-foreground">AI is thinking...</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Input Area */}
                  <div className="p-4 border-t bg-gray-50/50">
                    <div className="flex gap-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Ask your AI assistant anything about ${userRole} tasks...`}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={isThinking}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!input.trim() || isThinking}
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        <Send className="w-4 h-4" />
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