import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Heart, FileText, PenTool, CheckCircle, ArrowRight, Users, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { getCompanyConfig } from "@/lib/company-config";

interface VolunteerOnboardingData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  emergencyContact: string;
  emergencyPhone: string;
  skills: string;
  availability: string;
  motivation: string;
}

export default function VolunteerOnboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const companyConfig = getCompanyConfig();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<VolunteerOnboardingData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    emergencyContact: "",
    emergencyPhone: "",
    skills: "",
    availability: "",
    motivation: "",
  });

  const [agreementSigned, setAgreementSigned] = useState(false);

  const submitVolunteerMutation = useMutation({
    mutationFn: async (data: VolunteerOnboardingData) => {
      const response = await apiRequest("POST", "/api/volunteers/register", {
        ...data,
        role: "volunteer",
        agreementSigned,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "Thank you for volunteering! Your application is being reviewed.",
      });
      setLocation("/volunteer/agreement");
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof VolunteerOnboardingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!agreementSigned) {
      toast({
        title: "Agreement Required",
        description: "Please sign the charitable occupancy agreement to continue.",
        variant: "destructive",
      });
      return;
    }
    submitVolunteerMutation.mutate(formData);
  };

  const isStep1Valid = formData.firstName && formData.lastName && formData.email && formData.phoneNumber;
  const isStep2Valid = formData.dateOfBirth && formData.emergencyContact && formData.emergencyPhone;
  const isStep3Valid = formData.skills && formData.availability && formData.motivation && agreementSigned;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Volunteer Registration</h1>
          </div>
          <p className="text-gray-600 text-lg">{companyConfig.name}</p>
          <p className="text-sm text-gray-500">Help make a difference in our community</p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step < currentStep ? "bg-green-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form Steps */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {currentStep === 1 && <Users className="w-5 h-5" />}
                {currentStep === 2 && <Calendar className="w-5 h-5" />}
                {currentStep === 3 && <FileText className="w-5 h-5" />}
                
                {currentStep === 1 && "Personal Information"}
                {currentStep === 2 && "Contact & Emergency Information"}
                {currentStep === 3 && "Volunteer Details & Agreement"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      data-testid="input-firstname"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      data-testid="input-lastname"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      data-testid="input-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      data-testid="input-phone"
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      data-testid="input-dob"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact Name *</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                      data-testid="input-emergency-contact"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="emergencyPhone">Emergency Contact Phone *</Label>
                    <Input
                      id="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                      data-testid="input-emergency-phone"
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="skills">Skills & Experience *</Label>
                    <Textarea
                      id="skills"
                      placeholder="Describe your relevant skills, experience, or interests..."
                      value={formData.skills}
                      onChange={(e) => handleInputChange("skills", e.target.value)}
                      data-testid="input-skills"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="availability">Availability *</Label>
                    <Textarea
                      id="availability"
                      placeholder="When are you available to volunteer? (days, times, frequency)"
                      value={formData.availability}
                      onChange={(e) => handleInputChange("availability", e.target.value)}
                      data-testid="input-availability"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="motivation">Why do you want to volunteer? *</Label>
                    <Textarea
                      id="motivation"
                      placeholder="Tell us about your motivation to volunteer with us..."
                      value={formData.motivation}
                      onChange={(e) => handleInputChange("motivation", e.target.value)}
                      data-testid="input-motivation"
                      rows={3}
                    />
                  </div>

                  {/* Charitable Occupancy Agreement */}
                  <div className="border rounded-lg p-6 bg-green-50">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Charitable Occupancy Agreement
                    </h3>
                    <div className="prose text-sm mb-4">
                      <p className="mb-3">
                        By signing this agreement, you acknowledge that you are volunteering your time and services 
                        to {companyConfig.name} on a charitable basis. This agreement outlines the terms of your 
                        volunteer service.
                      </p>
                      <div className="bg-white p-4 rounded border">
                        <h4 className="font-medium mb-2">Key Terms:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Volunteer service is provided without expectation of monetary compensation</li>
                          <li>All volunteer activities must comply with organization policies and procedures</li>
                          <li>Volunteers are expected to maintain confidentiality and professional conduct</li>
                          <li>This agreement may be terminated by either party with reasonable notice</li>
                          <li>Volunteers must follow all safety guidelines and report incidents immediately</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="agreement"
                        checked={agreementSigned}
                        onChange={(e) => setAgreementSigned(e.target.checked)}
                        className="w-4 h-4 text-green-600"
                        data-testid="checkbox-agreement"
                      />
                      <Label htmlFor="agreement" className="text-sm">
                        I have read and agree to the terms of the Charitable Occupancy Agreement *
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={currentStep === 1}
                  data-testid="button-previous"
                >
                  Previous
                </Button>

                {currentStep < 3 ? (
                  <Button
                    onClick={handleNextStep}
                    disabled={
                      (currentStep === 1 && !isStep1Valid) ||
                      (currentStep === 2 && !isStep2Valid)
                    }
                    data-testid="button-next"
                  >
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!isStep3Valid || submitVolunteerMutation.isPending}
                    data-testid="button-submit"
                  >
                    {submitVolunteerMutation.isPending ? "Submitting..." : "Complete Registration"}
                    <PenTool className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-blue-700 text-sm">
                If you have questions about volunteering or need assistance with registration, 
                please contact our volunteer coordinator at volunteer@{companyConfig.slug}.com
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}