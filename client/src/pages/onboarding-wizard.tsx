import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Rocket, 
  Settings, 
  Palette, 
  Key, 
  Building, 
  Shield, 
  FileText, 
  Users, 
  CreditCard,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Bot,
  MapPin,
  FileCheck,
  DollarSign
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface OnboardingData {
  setupType: 'quick' | 'detailed' | '';
  companyInfo: {
    name: string;
    industry: string;
    state: string;
    website: string;
    employees: string;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logo: string;
  };
  apiKeys: {
    openai: string;
    payroll: string;
    booking: string;
    pos: string;
  };
  compliance: {
    requiredCertifications: string[];
    insuranceProvider: string;
    insuranceCoverage: string[];
    complianceAreas: string[];
  };
  integrations: {
    hrSystem: string;
    payrollSystem: string;
    bookingSystem: string;
    posSystem: string;
  };
}

const INDUSTRIES = [
  'RV Parks & Campgrounds',
  'Hotels & Hospitality',
  'Restaurants & Food Service',
  'Retail & Commerce',
  'Healthcare',
  'Construction',
  'Manufacturing',
  'Transportation & Logistics',
  'Oil & Gas',
  'Trucking',
  'Agriculture',
  'Technology',
  'Professional Services',
  'Other'
];

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

export default function OnboardingWizard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    setupType: '',
    companyInfo: {
      name: '',
      industry: '',
      state: '',
      website: '',
      employees: ''
    },
    branding: {
      primaryColor: '#3b82f6',
      secondaryColor: '#1e40af',
      logo: ''
    },
    apiKeys: {
      openai: '',
      payroll: '',
      booking: '',
      pos: ''
    },
    compliance: {
      requiredCertifications: [],
      insuranceProvider: '',
      insuranceCoverage: [],
      complianceAreas: []
    },
    integrations: {
      hrSystem: '',
      payrollSystem: '',
      bookingSystem: '',
      posSystem: ''
    }
  });

  const saveOnboardingMutation = useMutation({
    mutationFn: (onboardingData: OnboardingData) => apiRequest('/api/onboarding/complete', {
      method: 'POST',
      body: onboardingData
    }),
    onSuccess: () => {
      toast({
        title: "Setup Complete!",
        description: "Your workspace has been configured successfully.",
      });
      setLocation('/');
    },
    onError: (error: any) => {
      toast({
        title: "Setup Error",
        description: error.message || "Failed to complete setup",
        variant: "destructive"
      });
    }
  });

  const generateComplianceMutation = useMutation({
    mutationFn: () => apiRequest('/api/ai/generate-compliance', {
      method: 'POST',
      body: {
        industry: data.companyInfo.industry,
        state: data.companyInfo.state
      }
    }),
    onSuccess: (response: any) => {
      setData(prev => ({
        ...prev,
        compliance: {
          ...prev.compliance,
          requiredCertifications: response.certifications || [],
          complianceAreas: response.areas || []
        }
      }));
      toast({
        title: "Compliance Requirements Generated",
        description: "AI has analyzed your industry and location requirements.",
      });
    }
  });

  const updateData = (section: keyof OnboardingData, updates: any) => {
    setData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
  };

  const nextStep = () => {
    if (data.setupType === 'quick' && currentStep >= 3) {
      handleComplete();
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => setCurrentStep(prev => Math.max(0, prev - 1));

  const handleComplete = () => {
    saveOnboardingMutation.mutate(data);
  };

  const getStepsForSetupType = () => {
    if (data.setupType === 'quick') {
      return [
        'Setup Type',
        'Company Info',
        'OpenAI API',
        'Complete'
      ];
    }
    return [
      'Setup Type',
      'Company Info',
      'Branding',
      'API Keys',
      'Compliance',
      'Integrations',
      'Complete'
    ];
  };

  const steps = getStepsForSetupType();
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="p-3 rounded-full bg-blue-600 text-white">
              <Rocket className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Workflow Pro Setup
            </h1>
          </motion.div>
          <p className="text-gray-600 mb-6">
            Let's get your employment management system configured
          </p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-600 mt-2">{steps[currentStep]}</p>
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-lg">
              <CardContent className="p-8">
                {/* Step 0: Setup Type Selection */}
                {currentStep === 0 && (
                  <div className="text-center space-y-6">
                    <div>
                      <h2 className="text-2xl font-semibold mb-2">Choose Your Setup</h2>
                      <p className="text-gray-600">How would you like to configure your system?</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className={`cursor-pointer border-2 transition-colors ${
                            data.setupType === 'quick' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => updateData('setupType', 'quick')}
                        >
                          <CardHeader className="text-center">
                            <Rocket className="w-12 h-12 mx-auto text-blue-600 mb-2" />
                            <CardTitle>Quick Start</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600 mb-4">
                              Get up and running quickly with essential features
                            </p>
                            <ul className="text-sm text-left space-y-1">
                              <li>✓ Basic company info</li>
                              <li>✓ OpenAI integration</li>
                              <li>✓ Default settings</li>
                              <li>✓ Ready in 3 minutes</li>
                            </ul>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className={`cursor-pointer border-2 transition-colors ${
                            data.setupType === 'detailed' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => updateData('setupType', 'detailed')}
                        >
                          <CardHeader className="text-center">
                            <Settings className="w-12 h-12 mx-auto text-blue-600 mb-2" />
                            <CardTitle>Detailed Setup</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600 mb-4">
                              Full configuration with all features and integrations
                            </p>
                            <ul className="text-sm text-left space-y-1">
                              <li>✓ Custom branding</li>
                              <li>✓ Compliance automation</li>
                              <li>✓ System integrations</li>
                              <li>✓ Insurance optimization</li>
                            </ul>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  </div>
                )}

                {/* Step 1: Company Information */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Building className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                      <h2 className="text-2xl font-semibold mb-2">Company Information</h2>
                      <p className="text-gray-600">Tell us about your business</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="companyName">Company Name *</Label>
                        <Input
                          id="companyName"
                          value={data.companyInfo.name}
                          onChange={(e) => updateData('companyInfo', { name: e.target.value })}
                          placeholder="Your Company Name"
                          data-testid="input-company-name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="industry">Industry *</Label>
                        <Select value={data.companyInfo.industry} onValueChange={(value) => updateData('companyInfo', { industry: value })}>
                          <SelectTrigger data-testid="select-industry">
                            <SelectValue placeholder="Select your industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {INDUSTRIES.map((industry) => (
                              <SelectItem key={industry} value={industry}>
                                {industry}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="state">State/Province *</Label>
                        <Select value={data.companyInfo.state} onValueChange={(value) => updateData('companyInfo', { state: value })}>
                          <SelectTrigger data-testid="select-state">
                            <SelectValue placeholder="Select your state" />
                          </SelectTrigger>
                          <SelectContent>
                            {US_STATES.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="employees">Number of Employees</Label>
                        <Select value={data.companyInfo.employees} onValueChange={(value) => updateData('companyInfo', { employees: value })}>
                          <SelectTrigger data-testid="select-employees">
                            <SelectValue placeholder="Select employee count" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-10">1-10 employees</SelectItem>
                            <SelectItem value="11-50">11-50 employees</SelectItem>
                            <SelectItem value="51-100">51-100 employees</SelectItem>
                            <SelectItem value="101-500">101-500 employees</SelectItem>
                            <SelectItem value="500+">500+ employees</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="website">Website (Optional)</Label>
                        <Input
                          id="website"
                          value={data.companyInfo.website}
                          onChange={(e) => updateData('companyInfo', { website: e.target.value })}
                          placeholder="https://yourcompany.com"
                          data-testid="input-website"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: OpenAI API (Quick) or Branding (Detailed) */}
                {currentStep === 2 && data.setupType === 'quick' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Bot className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                      <h2 className="text-2xl font-semibold mb-2">AI Integration</h2>
                      <p className="text-gray-600">Connect OpenAI for intelligent features</p>
                    </div>

                    <div className="max-w-md mx-auto space-y-4">
                      <div>
                        <Label htmlFor="openaiKey">OpenAI API Key *</Label>
                        <Input
                          id="openaiKey"
                          type="password"
                          value={data.apiKeys.openai}
                          onChange={(e) => updateData('apiKeys', { openai: e.target.value })}
                          placeholder="sk-..."
                          data-testid="input-openai-key"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Platform</a>
                        </p>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">AI Features Include:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Employee assistance chatbot</li>
                          <li>• Smart task suggestions</li>
                          <li>• Incident analysis</li>
                          <li>• Document generation</li>
                          <li>• Compliance automation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: API Keys (Detailed) */}
                {currentStep === 3 && data.setupType === 'detailed' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Key className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                      <h2 className="text-2xl font-semibold mb-2">API Integrations</h2>
                      <p className="text-gray-600">Connect your existing systems</p>
                    </div>

                    <div className="grid gap-6">
                      <div>
                        <Label htmlFor="openaiKey">OpenAI API Key *</Label>
                        <Input
                          id="openaiKey"
                          type="password"
                          value={data.apiKeys.openai}
                          onChange={(e) => updateData('apiKeys', { openai: e.target.value })}
                          placeholder="sk-..."
                          data-testid="input-openai-key-detailed"
                        />
                        <p className="text-sm text-gray-500 mt-1">Required for AI features</p>
                      </div>

                      <Separator />

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="payrollApi">Payroll System API</Label>
                          <Input
                            id="payrollApi"
                            type="password"
                            value={data.apiKeys.payroll}
                            onChange={(e) => updateData('apiKeys', { payroll: e.target.value })}
                            placeholder="Optional - for payroll integration"
                            data-testid="input-payroll-api"
                          />
                        </div>

                        <div>
                          <Label htmlFor="bookingApi">Booking System API</Label>
                          <Input
                            id="bookingApi"
                            type="password"
                            value={data.apiKeys.booking}
                            onChange={(e) => updateData('apiKeys', { booking: e.target.value })}
                            placeholder="Optional - for booking integration"
                            data-testid="input-booking-api"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="posApi">POS System API</Label>
                        <Input
                          id="posApi"
                          type="password"
                          value={data.apiKeys.pos}
                          onChange={(e) => updateData('apiKeys', { pos: e.target.value })}
                          placeholder="Optional - for point of sale integration"
                          data-testid="input-pos-api"
                        />
                      </div>

                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <h4 className="font-medium text-yellow-900 mb-2">Optional Integrations</h4>
                        <p className="text-sm text-yellow-800">
                          These integrations can be configured later. You can skip them now and add them from your dashboard settings.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Compliance & Insurance (Detailed) */}
                {currentStep === 4 && data.setupType === 'detailed' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Shield className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                      <h2 className="text-2xl font-semibold mb-2">Compliance & Insurance</h2>
                      <p className="text-gray-600">Automate compliance and optimize insurance costs</p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-green-900">AI Compliance Analysis</h4>
                          <p className="text-sm text-green-800">
                            Generate industry-specific compliance requirements for {data.companyInfo.industry} in {data.companyInfo.state}
                          </p>
                        </div>
                        <Button
                          onClick={() => generateComplianceMutation.mutate()}
                          disabled={generateComplianceMutation.isPending || !data.companyInfo.industry || !data.companyInfo.state}
                          data-testid="button-generate-compliance"
                        >
                          {generateComplianceMutation.isPending ? 'Analyzing...' : 'Generate Requirements'}
                        </Button>
                      </div>

                      <div>
                        <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                        <Input
                          id="insuranceProvider"
                          value={data.compliance.insuranceProvider}
                          onChange={(e) => updateData('compliance', { insuranceProvider: e.target.value })}
                          placeholder="e.g., State Farm, Allstate, Progressive"
                          data-testid="input-insurance-provider"
                        />
                      </div>

                      <div>
                        <Label>Insurance Coverage Types</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {[
                            'General Liability',
                            'Workers Compensation',
                            'Property Insurance',
                            'Professional Liability',
                            'Cyber Liability',
                            'Commercial Auto'
                          ].map((coverage) => (
                            <label key={coverage} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={data.compliance.insuranceCoverage.includes(coverage)}
                                onChange={(e) => {
                                  const current = data.compliance.insuranceCoverage;
                                  if (e.target.checked) {
                                    updateData('compliance', { insuranceCoverage: [...current, coverage] });
                                  } else {
                                    updateData('compliance', { insuranceCoverage: current.filter(c => c !== coverage) });
                                  }
                                }}
                                className="rounded"
                              />
                              <span className="text-sm">{coverage}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {data.compliance.requiredCertifications.length > 0 && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Generated Compliance Requirements</h4>
                          <div className="space-y-1">
                            {data.compliance.requiredCertifications.map((cert, index) => (
                              <Badge key={index} variant="secondary" className="mr-2 mb-1">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="p-4 bg-amber-50 rounded-lg">
                        <h4 className="font-medium text-amber-900 mb-2">Insurance Benefits</h4>
                        <p className="text-sm text-amber-800">
                          Our compliance documentation and employee training records can help you qualify for insurance discounts. 
                          Many insurers offer 10-25% premium reductions for businesses with comprehensive safety and training programs.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: System Integrations (Detailed) */}
                {currentStep === 5 && data.setupType === 'detailed' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Users className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                      <h2 className="text-2xl font-semibold mb-2">System Integrations</h2>
                      <p className="text-gray-600">Connect HR, payroll, and business systems</p>
                    </div>

                    <div className="grid gap-6">
                      <div>
                        <Label htmlFor="hrSystem">HR Management System</Label>
                        <Select value={data.integrations.hrSystem} onValueChange={(value) => updateData('integrations', { hrSystem: value })}>
                          <SelectTrigger data-testid="select-hr-system">
                            <SelectValue placeholder="Select your HR system" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bamboohr">BambooHR</SelectItem>
                            <SelectItem value="adp">ADP Workforce Now</SelectItem>
                            <SelectItem value="paychex">Paychex</SelectItem>
                            <SelectItem value="gusto">Gusto</SelectItem>
                            <SelectItem value="workday">Workday</SelectItem>
                            <SelectItem value="rippling">Rippling</SelectItem>
                            <SelectItem value="none">No HR System</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="payrollSystem">Payroll System</Label>
                        <Select value={data.integrations.payrollSystem} onValueChange={(value) => updateData('integrations', { payrollSystem: value })}>
                          <SelectTrigger data-testid="select-payroll-system">
                            <SelectValue placeholder="Select your payroll system" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quickbooks">QuickBooks Payroll</SelectItem>
                            <SelectItem value="adp">ADP</SelectItem>
                            <SelectItem value="paychex">Paychex</SelectItem>
                            <SelectItem value="gusto">Gusto</SelectItem>
                            <SelectItem value="sage">Sage Payroll</SelectItem>
                            <SelectItem value="none">Manual Payroll</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="bookingSystem">Booking/Reservation System</Label>
                        <Select value={data.integrations.bookingSystem} onValueChange={(value) => updateData('integrations', { bookingSystem: value })}>
                          <SelectTrigger data-testid="select-booking-system">
                            <SelectValue placeholder="Select your booking system" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="campspot">CampSpot</SelectItem>
                            <SelectItem value="reserveamerica">Reserve America</SelectItem>
                            <SelectItem value="newbook">Newbook</SelectItem>
                            <SelectItem value="aspira">Aspira PMS</SelectItem>
                            <SelectItem value="rms">RMS Cloud</SelectItem>
                            <SelectItem value="none">No Booking System</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="posSystem">Point of Sale System</Label>
                        <Select value={data.integrations.posSystem} onValueChange={(value) => updateData('integrations', { posSystem: value })}>
                          <SelectTrigger data-testid="select-pos-system">
                            <SelectValue placeholder="Select your POS system" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="square">Square</SelectItem>
                            <SelectItem value="clover">Clover</SelectItem>
                            <SelectItem value="toast">Toast POS</SelectItem>
                            <SelectItem value="shopify">Shopify POS</SelectItem>
                            <SelectItem value="lightspeed">Lightspeed</SelectItem>
                            <SelectItem value="none">No POS System</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Integration Benefits</h4>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• Automatic employee data sync</li>
                          <li>• Simplified payroll processing</li>
                          <li>• Real-time occupancy updates</li>
                          <li>• Unified reporting dashboard</li>
                          <li>• Reduced manual data entry</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && data.setupType === 'detailed' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Palette className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                      <h2 className="text-2xl font-semibold mb-2">Branding</h2>
                      <p className="text-gray-600">Customize your app's appearance</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <div className="flex gap-3 items-center">
                          <Input
                            id="primaryColor"
                            type="color"
                            value={data.branding.primaryColor}
                            onChange={(e) => updateData('branding', { primaryColor: e.target.value })}
                            className="w-16 h-10"
                            data-testid="input-primary-color"
                          />
                          <Input
                            value={data.branding.primaryColor}
                            onChange={(e) => updateData('branding', { primaryColor: e.target.value })}
                            placeholder="#3b82f6"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="secondaryColor">Secondary Color</Label>
                        <div className="flex gap-3 items-center">
                          <Input
                            id="secondaryColor"
                            type="color"
                            value={data.branding.secondaryColor}
                            onChange={(e) => updateData('branding', { secondaryColor: e.target.value })}
                            className="w-16 h-10"
                            data-testid="input-secondary-color"
                          />
                          <Input
                            value={data.branding.secondaryColor}
                            onChange={(e) => updateData('branding', { secondaryColor: e.target.value })}
                            placeholder="#1e40af"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Preview</h4>
                      <div className="flex gap-3">
                        <div 
                          className="w-12 h-12 rounded"
                          style={{ backgroundColor: data.branding.primaryColor }}
                        />
                        <div 
                          className="w-12 h-12 rounded"
                          style={{ backgroundColor: data.branding.secondaryColor }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-8 border-t">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    data-testid="button-previous"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <Button
                    onClick={nextStep}
                    disabled={!data.setupType || 
                      (currentStep === 1 && (!data.companyInfo.name || !data.companyInfo.industry || !data.companyInfo.state)) ||
                      (data.setupType === 'quick' && currentStep === 2 && !data.apiKeys.openai) ||
                      (data.setupType === 'detailed' && currentStep === 3 && !data.apiKeys.openai)
                    }
                    data-testid="button-next"
                  >
                    {(data.setupType === 'quick' && currentStep >= 2) || (data.setupType === 'detailed' && currentStep >= 5) ? 'Complete Setup' : 'Next'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}