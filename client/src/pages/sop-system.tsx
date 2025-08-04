import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Lock, ChevronDown, ChevronRight, CheckCircle, Clock, FileText, AlertTriangle, Shield, Users, Clipboard, Play, Pause, RotateCcw, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface SOPStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  estimatedTime: number; // in minutes
  required: boolean;
  safetyNotes?: string;
}

interface SOP {
  id: string;
  title: string;
  description: string;
  category: "daily_tasks" | "maintenance" | "safety" | "guest_services" | "emergency";
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: number;
  steps: SOPStep[];
  lastUpdated: string;
}

interface SOPExecution {
  sopId: string;
  startedAt?: string;
  completedAt?: string;
  currentStep: number;
  completedSteps: string[];
  elapsedTime: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
}

const SOP_DATA: SOP[] = [
  {
    id: "cabin-cleaning",
    title: "Cabin Deep Clean Procedure",
    description: "Complete procedure for thorough cabin cleaning and preparation",
    category: "daily_tasks",
    difficulty: "beginner",
    estimatedTime: 45,
    lastUpdated: "2024-01-15",
    steps: [
      {
        id: "gather-supplies",
        stepNumber: 1,
        title: "Gather Cleaning Supplies",
        description: "Collect all necessary cleaning supplies including vacuum, cleaning chemicals, fresh linens, and trash bags",
        estimatedTime: 5,
        required: true,
        safetyNotes: "Ensure proper ventilation when using cleaning chemicals"
      },
      {
        id: "strip-beds",
        stepNumber: 2,
        title: "Strip and Inspect Beds",
        description: "Remove all linens, check mattresses for damage, and inspect bed frames",
        estimatedTime: 8,
        required: true
      },
      {
        id: "bathroom-deep-clean",
        stepNumber: 3,
        title: "Deep Clean Bathroom",
        description: "Scrub shower, toilet, sink, and floor. Replace toiletries and towels",
        estimatedTime: 15,
        required: true,
        safetyNotes: "Use gloves when handling cleaning chemicals"
      },
      {
        id: "kitchen-sanitize",
        stepNumber: 4,
        title: "Kitchen Sanitization",
        description: "Clean appliances, sanitize counters, stock supplies, and check for maintenance issues",
        estimatedTime: 12,
        required: true
      },
      {
        id: "vacuum-mop",
        stepNumber: 5,
        title: "Vacuum and Mop Floors",
        description: "Vacuum all carpeted areas and mop hard floors with appropriate cleaner",
        estimatedTime: 5,
        required: true
      }
    ]
  },
  {
    id: "pool-maintenance",
    title: "Daily Pool Maintenance",
    description: "Essential daily checks and maintenance for pool safety and cleanliness",
    category: "maintenance",
    difficulty: "intermediate",
    estimatedTime: 30,
    lastUpdated: "2024-01-10",
    steps: [
      {
        id: "chemical-testing",
        stepNumber: 1,
        title: "Test Water Chemistry",
        description: "Test pH, chlorine, and alkalinity levels using test kit",
        estimatedTime: 5,
        required: true,
        safetyNotes: "Never mix different chemicals. Store test kit safely"
      },
      {
        id: "skim-debris",
        stepNumber: 2,
        title: "Skim Surface Debris",
        description: "Remove leaves, insects, and floating debris with net",
        estimatedTime: 8,
        required: true
      },
      {
        id: "check-equipment",
        stepNumber: 3,
        title: "Inspect Pool Equipment",
        description: "Check pump, filter, and heater operation. Note any unusual sounds or leaks",
        estimatedTime: 10,
        required: true,
        safetyNotes: "Turn off electrical equipment before inspection"
      },
      {
        id: "add-chemicals",
        stepNumber: 4,
        title: "Adjust Chemicals if Needed",
        description: "Add chlorine or pH adjusters based on test results",
        estimatedTime: 7,
        required: true,
        safetyNotes: "Add chemicals to water, never water to chemicals"
      }
    ]
  },
  {
    id: "guest-check-in",
    title: "Guest Check-in Process",
    description: "Complete procedure for welcoming and checking in guests",
    category: "guest_services",
    difficulty: "beginner",
    estimatedTime: 20,
    lastUpdated: "2024-01-12",
    steps: [
      {
        id: "verify-reservation",
        stepNumber: 1,
        title: "Verify Reservation Details",
        description: "Confirm guest identity, reservation dates, and cabin assignment",
        estimatedTime: 3,
        required: true
      },
      {
        id: "collect-payment",
        stepNumber: 2,
        title: "Process Payment and Deposits",
        description: "Collect any outstanding balances and security deposits",
        estimatedTime: 5,
        required: true
      },
      {
        id: "property-orientation",
        stepNumber: 3,
        title: "Provide Property Orientation",
        description: "Explain amenities, rules, emergency procedures, and Wi-Fi access",
        estimatedTime: 8,
        required: true
      },
      {
        id: "key-handover",
        stepNumber: 4,
        title: "Key Handover and Final Check",
        description: "Provide keys, review checkout procedures, and answer any questions",
        estimatedTime: 4,
        required: true
      }
    ]
  }
];

export default function SOPSystem() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [executions, setExecutions] = useState<Record<string, SOPExecution>>({});
  const [timers, setTimers] = useState<Record<string, number>>({});

  // Check if user has access to SOPs (must have completed handbook)
  const canAccessSOPs = user?.status === 'approved' && user?.handbookCompleted;

  const { data: sops = SOP_DATA as SOP[] } = useQuery({
    queryKey: ['/api/sops'],
    enabled: canAccessSOPs,
  });

  const sopExecutionMutation = useMutation({
    mutationFn: async ({ sopId, stepId, action, data }: {
      sopId: string;
      stepId?: string;
      action: 'start' | 'complete_step' | 'complete' | 'pause' | 'reset';
      data?: any;
    }) => {
      const response = await apiRequest("POST", "/api/sops/execution", {
        sopId,
        stepId,
        action,
        data,
        timestamp: new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sops'] });
      toast({
        title: "Progress Saved",
        description: "Your SOP progress has been recorded.",
      });
    }
  });

  const toggleSection = (sopId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sopId]: !prev[sopId]
    }));
  };

  const startSOP = (sopId: string) => {
    const now = new Date();
    const execution: SOPExecution = {
      sopId,
      startedAt: now.toISOString(),
      currentStep: 1,
      completedSteps: [],
      elapsedTime: 0,
      status: 'in_progress'
    };

    setExecutions(prev => ({
      ...prev,
      [sopId]: execution
    }));

    // Start timer
    const interval = setInterval(() => {
      setTimers(prev => ({
        ...prev,
        [sopId]: (prev[sopId] || 0) + 1
      }));
    }, 1000);

    sopExecutionMutation.mutate({
      sopId,
      action: 'start',
      data: execution
    });
  };

  const completeStep = (sopId: string, stepId: string) => {
    const execution = executions[sopId];
    if (!execution) return;

    const updatedExecution = {
      ...execution,
      completedSteps: [...execution.completedSteps, stepId],
      currentStep: execution.currentStep + 1
    };

    setExecutions(prev => ({
      ...prev,
      [sopId]: updatedExecution
    }));

    sopExecutionMutation.mutate({
      sopId,
      stepId,
      action: 'complete_step',
      data: updatedExecution
    });
  };

  const completeSOP = (sopId: string) => {
    const execution = executions[sopId];
    if (!execution) return;

    const updatedExecution = {
      ...execution,
      completedAt: new Date().toISOString(),
      status: 'completed' as const
    };

    setExecutions(prev => ({
      ...prev,
      [sopId]: updatedExecution
    }));

    // Clear timer
    setTimers(prev => {
      const newTimers = { ...prev };
      delete newTimers[sopId];
      return newTimers;
    });

    sopExecutionMutation.mutate({
      sopId,
      action: 'complete',
      data: updatedExecution
    });
  };

  const pauseSOP = (sopId: string) => {
    const execution = executions[sopId];
    if (!execution) return;

    const updatedExecution = {
      ...execution,
      status: 'paused' as const
    };

    setExecutions(prev => ({
      ...prev,
      [sopId]: updatedExecution
    }));
  };

  const resetSOP = (sopId: string) => {
    setExecutions(prev => {
      const newExecutions = { ...prev };
      delete newExecutions[sopId];
      return newExecutions;
    });

    setTimers(prev => {
      const newTimers = { ...prev };
      delete newTimers[sopId];
      return newTimers;
    });

    sopExecutionMutation.mutate({
      sopId,
      action: 'reset'
    });
  };

  const getSOPProgress = (sop: SOP): { completed: number; total: number; percentage: number } => {
    const execution = executions[sop.id];
    const completed = execution ? execution.completedSteps.length : 0;
    const total = sop.steps.filter(step => step.required).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'daily_tasks': return <Clipboard className="w-5 h-5" />;
      case 'maintenance': return <Shield className="w-5 h-5" />;
      case 'safety': return <AlertTriangle className="w-5 h-5" />;
      case 'guest_services': return <Users className="w-5 h-5" />;
      case 'emergency': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!canAccessSOPs) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4" data-testid="text-sop-locked">
              SOPs Access Restricted
            </h2>
            <p className="text-gray-600 mb-6">
              {!user?.handbookCompleted 
                ? "Please complete the employee handbook first to access Standard Operating Procedures."
                : "Your account needs to be approved and handbook completed to access SOPs."
              }
            </p>
            <Button 
              onClick={() => setLocation('/role-selector')} 
              variant="outline"
              data-testid="button-back-dashboard"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/role-selector')}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-sop-title">
              Standard Operating Procedures
            </h1>
            <p className="text-gray-600" data-testid="text-sop-description">
              Step-by-step procedures for daily tasks and operations
            </p>
          </div>
        </div>

        {/* SOPs List */}
        <div className="space-y-4">
          {sops.map((sop) => {
            const isOpen = openSections[sop.id];
            const execution = executions[sop.id];
            const progress = getSOPProgress(sop);
            const timer = timers[sop.id] || 0;

            return (
              <motion.div
                key={sop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className={`${execution?.status === 'completed' ? 'ring-2 ring-green-200 bg-green-50/30' : 
                  execution?.status === 'in_progress' ? 'ring-2 ring-blue-200 bg-blue-50/30' : ''}`}>
                  <Collapsible open={isOpen} onOpenChange={() => toggleSection(sop.id)}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                              {getCategoryIcon(sop.category)}
                            </div>
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2" data-testid={`sop-title-${sop.id}`}>
                                {sop.title}
                                {execution?.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                                {execution?.status === 'in_progress' && <Clock className="w-5 h-5 text-blue-600" />}
                              </CardTitle>
                              <p className="text-sm text-gray-600">{sop.description}</p>
                              <div className="flex items-center gap-4 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {sop.category.replace('_', ' ')}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  ~{sop.estimatedTime} min
                                </Badge>
                                <Badge variant="outline" className={`text-xs ${
                                  sop.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                                  sop.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {sop.difficulty}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            {execution?.status === 'in_progress' && (
                              <div className="text-center">
                                <div className="text-sm font-medium text-blue-600">
                                  <Timer className="w-4 h-4 inline mr-1" />
                                  {formatTime(timer)}
                                </div>
                              </div>
                            )}
                            <div className="text-right">
                              <div className="text-sm font-medium" data-testid={`sop-progress-${sop.id}`}>
                                {progress.completed}/{progress.total} steps
                              </div>
                              <Progress value={progress.percentage} className="w-24 h-2" />
                            </div>
                            <Badge variant={execution?.status === 'completed' ? "default" : "secondary"} data-testid={`sop-badge-${sop.id}`}>
                              {progress.percentage}%
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {/* SOP Controls */}
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-4">
                              {!execution ? (
                                <Button
                                  onClick={() => startSOP(sop.id)}
                                  className="flex items-center gap-2"
                                  data-testid={`button-start-${sop.id}`}
                                >
                                  <Play className="w-4 h-4" />
                                  Start SOP
                                </Button>
                              ) : execution.status === 'completed' ? (
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                  <span className="text-green-800 font-medium">Completed</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => resetSOP(sop.id)}
                                    data-testid={`button-reset-${sop.id}`}
                                  >
                                    <RotateCcw className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => pauseSOP(sop.id)}
                                    data-testid={`button-pause-${sop.id}`}
                                  >
                                    <Pause className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => resetSOP(sop.id)}
                                    data-testid={`button-reset-${sop.id}`}
                                  >
                                    <RotateCcw className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            
                            {execution && execution.status === 'in_progress' && (
                              <div className="text-sm text-gray-600">
                                Step {execution.currentStep} of {sop.steps.length}
                              </div>
                            )}
                          </div>

                          {/* Steps List */}
                          <div className="space-y-3">
                            {sop.steps.map((step) => {
                              const isCompleted = execution?.completedSteps.includes(step.id) || false;
                              const isCurrent = execution?.currentStep === step.stepNumber && execution.status === 'in_progress';
                              
                              return (
                                <div
                                  key={step.id}
                                  className={`p-4 border rounded-lg ${
                                    isCompleted ? 'bg-green-50 border-green-200' :
                                    isCurrent ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-300' :
                                    'bg-gray-50 border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                        isCompleted ? 'bg-green-600 text-white' :
                                        isCurrent ? 'bg-blue-600 text-white' :
                                        'bg-gray-300 text-gray-600'
                                      }`}>
                                        {isCompleted ? <CheckCircle className="w-4 h-4" /> : step.stepNumber}
                                      </div>
                                      {isCurrent && execution && (
                                        <Checkbox
                                          id={`step-${step.id}`}
                                          checked={false}
                                          onCheckedChange={(checked) => {
                                            if (checked) {
                                              completeStep(sop.id, step.id);
                                              if (step.stepNumber === sop.steps.length) {
                                                completeSOP(sop.id);
                                              }
                                            }
                                          }}
                                          className="ml-2"
                                          data-testid={`checkbox-step-${step.id}`}
                                        />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <label
                                          htmlFor={`step-${step.id}`}
                                          className={`text-sm font-medium cursor-pointer ${
                                            isCompleted ? 'text-green-800' : 
                                            isCurrent ? 'text-blue-800' : 'text-gray-900'
                                          }`}
                                          data-testid={`step-title-${step.id}`}
                                        >
                                          {step.title}
                                          {step.required && <span className="text-red-500 ml-1">*</span>}
                                        </label>
                                        <Badge variant="outline" className="text-xs">
                                          ~{step.estimatedTime} min
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                                      {step.safetyNotes && (
                                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                                          <div className="flex items-center gap-1 text-yellow-800">
                                            <AlertTriangle className="w-3 h-3" />
                                            <span className="font-medium">Safety Note:</span>
                                          </div>
                                          <p className="text-yellow-700 mt-1">{step.safetyNotes}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}