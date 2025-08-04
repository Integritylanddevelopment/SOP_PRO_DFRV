import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Lock, ChevronDown, ChevronRight, CheckCircle, Clock, FileText, AlertTriangle, Shield, Users, Clipboard } from "lucide-react";
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

interface Policy {
  id: string;
  title: string;
  content: string;
  required: boolean;
}

interface HandbookSection {
  id: string;
  title: string;
  content: string;
  category: "company_policies" | "safety" | "daily_procedures" | "emergency_protocols";
  policies: Policy[];
  sectionNumber: number;
  requiresSignature: boolean;
}

interface PolicyCompletion {
  policyId: string;
  completed: boolean;
  completedAt?: string;
}

interface SectionCompletion {
  sectionId: string;
  completions: PolicyCompletion[];
  signed: boolean;
  signedAt?: string;
}

const HANDBOOK_SECTIONS_DATA: HandbookSection[] = [
  {
    id: "company-policies",
    title: "Company Policies",
    content: "Essential policies and guidelines for all employees",
    category: "company_policies",
    sectionNumber: 1,
    requiresSignature: true,
    policies: [
      {
        id: "code-of-conduct",
        title: "Code of Conduct",
        content: "Professional behavior standards and ethical guidelines for all employees",
        required: true
      },
      {
        id: "anti-harassment",
        title: "Anti-Harassment Policy",
        content: "Zero tolerance policy for harassment, discrimination, and inappropriate workplace behavior",
        required: true
      },
      {
        id: "confidentiality",
        title: "Confidentiality Agreement",
        content: "Protection of customer information, trade secrets, and proprietary business data",
        required: true
      },
      {
        id: "drug-policy",
        title: "Drug and Alcohol Policy",
        content: "Substance abuse prevention and workplace safety requirements",
        required: true
      },
      {
        id: "social-media",
        title: "Social Media Guidelines",
        content: "Appropriate use of social media and representation of the company online",
        required: false
      }
    ]
  },
  {
    id: "safety",
    title: "Safety Protocols",
    content: "Critical safety procedures and emergency protocols",
    category: "safety",
    sectionNumber: 2,
    requiresSignature: true,
    policies: [
      {
        id: "workplace-safety",
        title: "General Workplace Safety",
        content: "Basic safety procedures, hazard identification, and accident prevention",
        required: true
      },
      {
        id: "equipment-safety",
        title: "Equipment Safety",
        content: "Safe operation of maintenance equipment, tools, and recreational facility equipment",
        required: true
      },
      {
        id: "guest-safety",
        title: "Guest Safety Protocols",
        content: "Ensuring guest safety in all areas including pools, playgrounds, and common areas",
        required: true
      },
      {
        id: "incident-reporting",
        title: "Incident Reporting",
        content: "Immediate reporting procedures for accidents, injuries, and safety hazards",
        required: true
      },
      {
        id: "chemical-handling",
        title: "Chemical Handling and Storage",
        content: "Safe handling, storage, and disposal of cleaning chemicals and maintenance materials",
        required: true
      }
    ]
  },
  {
    id: "daily-procedures",
    title: "Daily Procedures",
    content: "Standard operating procedures for daily tasks",
    category: "daily_procedures",
    sectionNumber: 3,
    requiresSignature: true,
    policies: [
      {
        id: "check-in-process",
        title: "Guest Check-in Process",
        content: "Complete procedures for welcoming guests and processing reservations",
        required: true
      },
      {
        id: "housekeeping-standards",
        title: "Housekeeping Standards",
        content: "Quality standards for cabin cleaning, maintenance, and preparation",
        required: true
      },
      {
        id: "maintenance-rounds",
        title: "Daily Maintenance Rounds",
        content: "Inspection procedures for facilities, grounds, and equipment",
        required: true
      },
      {
        id: "customer-service",
        title: "Customer Service Excellence",
        content: "Standards for guest interactions, problem resolution, and service delivery",
        required: true
      }
    ]
  },
  {
    id: "emergency-protocols",
    title: "Emergency Protocols",
    content: "Critical emergency response procedures",
    category: "emergency_protocols",
    sectionNumber: 4,
    requiresSignature: true,
    policies: [
      {
        id: "fire-emergency",
        title: "Fire Emergency Response",
        content: "Evacuation procedures, fire suppression systems, and emergency contacts",
        required: true
      },
      {
        id: "medical-emergency",
        title: "Medical Emergency Response",
        content: "First aid procedures, emergency medical contacts, and incident documentation",
        required: true
      },
      {
        id: "severe-weather",
        title: "Severe Weather Protocols",
        content: "Response procedures for storms, flooding, and other weather emergencies",
        required: true
      },
      {
        id: "security-threats",
        title: "Security and Threat Response",
        content: "Procedures for handling security threats, suspicious activity, and law enforcement coordination",
        required: true
      }
    ]
  }
];

export default function EmployeeHandbook() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [completions, setCompletions] = useState<Record<string, SectionCompletion>>({});
  
  // Check if user has completed onboarding and been approved
  const canAccessHandbook = user?.status === 'approved' && user?.onboardingCompleted;

  const { data: sections = HANDBOOK_SECTIONS_DATA } = useQuery({
    queryKey: ['/api/handbook/sections'],
    enabled: canAccessHandbook,
  });

  const policyCompletionMutation = useMutation({
    mutationFn: async ({ sectionId, policyId, completed }: {
      sectionId: string;
      policyId: string;
      completed: boolean;
    }) => {
      const response = await apiRequest("POST", "/api/handbook/policy-completion", {
        sectionId,
        policyId,
        completed,
        completedAt: completed ? new Date().toISOString() : null
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/handbook'] });
      toast({
        title: "Progress Saved",
        description: "Your policy completion has been recorded.",
      });
    }
  });

  const sectionSignatureMutation = useMutation({
    mutationFn: async ({ sectionId }: { sectionId: string }) => {
      const response = await apiRequest("POST", "/api/handbook/signature", {
        sectionId,
        signedAt: new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/handbook'] });
      toast({
        title: "Section Completed",
        description: "Your digital signature has been recorded.",
      });
    }
  });

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handlePolicyToggle = (sectionId: string, policyId: string, completed: boolean) => {
    // Update local state immediately for better UX
    setCompletions(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        completions: [
          ...(prev[sectionId]?.completions?.filter(c => c.policyId !== policyId) || []),
          {
            policyId,
            completed,
            completedAt: completed ? new Date().toISOString() : undefined
          }
        ]
      }
    }));

    // Send to server
    policyCompletionMutation.mutate({
      sectionId,
      policyId,
      completed
    });
  };

  const handleSectionSignature = (sectionId: string) => {
    sectionSignatureMutation.mutate({ sectionId });
    
    // Update local state
    setCompletions(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        signed: true,
        signedAt: new Date().toISOString()
      }
    }));
  };

  const getSectionProgress = (section: HandbookSection): { completed: number; total: number; percentage: number } => {
    const sectionCompletion = completions[section.id];
    const requiredPolicies = section.policies.filter(p => p.required);
    const completedPolicies = requiredPolicies.filter(policy =>
      sectionCompletion?.completions?.find(c => c.policyId === policy.id)?.completed
    );
    
    const completed = completedPolicies.length;
    const total = requiredPolicies.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };

  const isSectionComplete = (section: HandbookSection): boolean => {
    const progress = getSectionProgress(section);
    const sectionCompletion = completions[section.id];
    return progress.percentage === 100 && (section.requiresSignature ? sectionCompletion?.signed : true);
  };

  const getSectionIcon = (category: string) => {
    switch (category) {
      case 'company_policies': return <FileText className="w-5 h-5" />;
      case 'safety': return <Shield className="w-5 h-5" />;
      case 'daily_procedures': return <Clipboard className="w-5 h-5" />;
      case 'emergency_protocols': return <AlertTriangle className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  if (!canAccessHandbook) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4" data-testid="text-handbook-locked">
              Handbook Access Restricted
            </h2>
            <p className="text-gray-600 mb-6">
              {!user?.onboardingCompleted 
                ? "Please complete your onboarding process first."
                : "Your account is pending manager approval to access the employee handbook."
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-handbook-title">
              Employee Handbook
            </h1>
            <p className="text-gray-600" data-testid="text-handbook-description">
              Complete all sections to gain access to Standard Operating Procedures
            </p>
          </div>

          {/* Overall Progress */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Overall Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sections.map((section) => {
                  const progress = getSectionProgress(section);
                  const isComplete = isSectionComplete(section);
                  
                  return (
                    <div key={section.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getSectionIcon(section.category)}
                        <span className="font-medium">{section.title}</span>
                        {isComplete && <CheckCircle className="w-4 h-4 text-green-600" />}
                      </div>
                      <div className="flex items-center gap-3 min-w-[100px]">
                        <span className="text-sm text-gray-600">
                          {progress.completed}/{progress.total}
                        </span>
                        <Badge variant={isComplete ? "default" : "secondary"}>
                          {progress.percentage}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Handbook Sections */}
        <div className="space-y-4">
          {sections.map((section) => {
            const isOpen = openSections[section.id];
            const progress = getSectionProgress(section);
            const isComplete = isSectionComplete(section);
            const sectionCompletion = completions[section.id];

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: section.sectionNumber * 0.1 }}
              >
                <Card className={`${isComplete ? 'ring-2 ring-green-200 bg-green-50/30' : ''}`}>
                  <Collapsible open={isOpen} onOpenChange={() => toggleSection(section.id)}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                              {getSectionIcon(section.category)}
                            </div>
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2" data-testid={`section-title-${section.id}`}>
                                {section.title}
                                {isComplete && <CheckCircle className="w-5 h-5 text-green-600" />}
                              </CardTitle>
                              <p className="text-sm text-gray-600">{section.content}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm font-medium" data-testid={`progress-${section.id}`}>
                                {progress.completed}/{progress.total} completed
                              </div>
                              <Progress value={progress.percentage} className="w-24 h-2" />
                            </div>
                            <Badge variant={isComplete ? "default" : "secondary"} data-testid={`badge-${section.id}`}>
                              {progress.percentage}%
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {/* Policies List */}
                          <div className="space-y-3">
                            {section.policies.map((policy) => {
                              const isCompleted = sectionCompletion?.completions?.find(c => c.policyId === policy.id)?.completed || false;
                              const completedAt = sectionCompletion?.completions?.find(c => c.policyId === policy.id)?.completedAt;
                              
                              return (
                                <div
                                  key={policy.id}
                                  className={`p-4 border rounded-lg ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                                >
                                  <div className="flex items-start gap-3">
                                    <Checkbox
                                      id={`policy-${policy.id}`}
                                      checked={isCompleted}
                                      onCheckedChange={(checked) => handlePolicyToggle(section.id, policy.id, !!checked)}
                                      className="mt-1"
                                      data-testid={`checkbox-${policy.id}`}
                                    />
                                    <div className="flex-1">
                                      <label
                                        htmlFor={`policy-${policy.id}`}
                                        className={`text-sm font-medium cursor-pointer ${isCompleted ? 'text-green-800' : 'text-gray-900'}`}
                                        data-testid={`label-${policy.id}`}
                                      >
                                        {policy.title}
                                        {policy.required && <span className="text-red-500 ml-1">*</span>}
                                      </label>
                                      <p className="text-xs text-gray-600 mt-1">{policy.content}</p>
                                      {isCompleted && completedAt && (
                                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                          <CheckCircle className="w-3 h-3" />
                                          Completed on {new Date(completedAt).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Section Signature */}
                          {section.requiresSignature && (
                            <div className="border-t pt-4">
                              {progress.percentage === 100 ? (
                                <div className="text-center space-y-4">
                                  {!sectionCompletion?.signed ? (
                                    <div>
                                      <p className="text-sm text-gray-600 mb-4">
                                        All policies completed. Please provide your digital signature to finalize this section.
                                      </p>
                                      <Button
                                        onClick={() => handleSectionSignature(section.id)}
                                        disabled={sectionSignatureMutation.isPending}
                                        className="w-full max-w-xs"
                                        data-testid={`button-sign-${section.id}`}
                                      >
                                        {sectionSignatureMutation.isPending ? 'Signing...' : 'Digital Signature'}
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="bg-green-100 p-4 rounded-lg">
                                      <div className="flex items-center justify-center gap-2 text-green-800">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-medium" data-testid={`signed-${section.id}`}>
                                          Section Completed & Signed
                                        </span>
                                      </div>
                                      {sectionCompletion.signedAt && (
                                        <p className="text-sm text-green-600 mt-2">
                                          Signed on {new Date(sectionCompletion.signedAt).toLocaleDateString()} at {new Date(sectionCompletion.signedAt).toLocaleTimeString()}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                  <p className="text-sm text-yellow-800">
                                    Complete all required policies above to unlock digital signature
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Handbook Completion Status */}
        <Card className="mt-8">
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-semibold mb-4" data-testid="text-completion-status">
              Handbook Completion Status
            </h3>
            {sections.every(section => isSectionComplete(section)) ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-green-800">
                  <CheckCircle className="w-8 h-8" />
                  <span className="text-xl font-bold">Handbook Complete!</span>
                </div>
                <p className="text-gray-600">
                  Congratulations! You have completed all handbook sections and can now access Standard Operating Procedures.
                </p>
                <Button
                  onClick={() => setLocation('/employee/sops')}
                  className="mt-4"
                  data-testid="button-access-sops"
                >
                  Access SOPs
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Complete all handbook sections to unlock access to Standard Operating Procedures.
                </p>
                <div className="text-sm text-gray-500">
                  {sections.filter(s => isSectionComplete(s)).length} of {sections.length} sections completed
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}