import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Camera, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";

const onboardingSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  ssn: z.string().min(9, "SSN is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  position: z.string().min(1, "Position is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  terms: z.boolean().refine(val => val === true, "You must agree to the terms"),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const ONBOARDING_STEPS = [
  { id: 1, title: "Personal Information", description: "Basic details and contact information" },
  { id: 2, title: "Employment Details", description: "Position and work information" },
  { id: 3, title: "Security & Access", description: "Password and account setup" },
  { id: 4, title: "Profile Photo", description: "Take your employee identification photo" },
  { id: 5, title: "Review & Submit", description: "Review information and submit for approval" }
];

export default function EmployeeOnboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCamera, setIsCamera] = useState(false);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      ssn: "",
      dateOfBirth: "",
      position: "",
      password: "",
      terms: false,
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: OnboardingFormData & { profilePhotoUrl?: string }) => {
      const response = await apiRequest("POST", "/api/auth/register", {
        ...data,
        companyId: "default-company-id",
        role: "employee",
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Onboarding Complete!",
        description: "Your information has been submitted for manager approval. You'll receive access to the handbook once approved.",
      });
      setLocation('/role-selector');
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    },
  });

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCamera(true);
      }
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to take your profile photo.",
        variant: "destructive",
      });
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPhotoDataUrl(dataUrl);
        setPhotoTaken(true);
        
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        setIsCamera(false);
      }
    }
  };

  const retakePhoto = () => {
    setPhotoTaken(false);
    setPhotoDataUrl(null);
    startCamera();
  };

  const onSubmit = async (data: OnboardingFormData) => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      return;
    }
    
    registerMutation.mutate({
      ...data,
      profilePhotoUrl: photoDataUrl || undefined
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-first-name">First Name</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-first-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-last-name">Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-last-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-email">Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} data-testid="input-email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-phone">Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-phone" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-position">Position</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-position">
                        <SelectValue placeholder="Select a position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="front-desk">Front Desk Associate</SelectItem>
                      <SelectItem value="maintenance">Maintenance Technician</SelectItem>
                      <SelectItem value="housekeeping">Housekeeping</SelectItem>
                      <SelectItem value="groundskeeper">Groundskeeper</SelectItem>
                      <SelectItem value="activities">Activities Coordinator</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ssn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-ssn">Social Security Number</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} data-testid="input-ssn" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-dob">Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} data-testid="input-dob" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-password">Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} data-testid="input-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-terms"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel data-testid="label-terms">
                      I agree to the terms and conditions and company policies
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 text-center">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" data-testid="text-photo-title">Take Your Profile Photo</h3>
              <p className="text-sm text-muted-foreground" data-testid="text-photo-description">
                This photo will be used for your employee identification and security purposes.
              </p>
            </div>

            {!photoTaken && !isCamera && (
              <div className="space-y-4">
                <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                  <Camera className="w-12 h-12 text-gray-400" />
                </div>
                <Button 
                  onClick={startCamera} 
                  className="w-full"
                  data-testid="button-start-camera"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Start Camera
                </Button>
              </div>
            )}

            {isCamera && !photoTaken && (
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    className="w-48 h-48 mx-auto rounded-lg"
                    data-testid="video-camera"
                  />
                </div>
                <Button 
                  onClick={takePhoto} 
                  className="w-full"
                  data-testid="button-take-photo"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            )}

            {photoTaken && photoDataUrl && (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={photoDataUrl}
                    alt="Profile"
                    className="w-48 h-48 mx-auto rounded-lg object-cover border-2 border-green-200"
                    data-testid="img-profile-photo"
                  />
                  <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
                <Button 
                  onClick={retakePhoto} 
                  variant="outline" 
                  className="w-full"
                  data-testid="button-retake-photo"
                >
                  Retake Photo
                </Button>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold" data-testid="text-review-title">Review Your Information</h3>
              <p className="text-sm text-muted-foreground">
                Please review your information before submitting for manager approval.
              </p>
            </div>
            
            <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Name:</strong> {form.getValues('firstName')} {form.getValues('lastName')}</div>
                <div><strong>Email:</strong> {form.getValues('email')}</div>
                <div><strong>Phone:</strong> {form.getValues('phoneNumber')}</div>
                <div><strong>Position:</strong> {form.getValues('position')}</div>
              </div>
              
              {photoDataUrl && (
                <div className="text-center">
                  <img
                    src={photoDataUrl}
                    alt="Profile"
                    className="w-24 h-24 mx-auto rounded-lg object-cover border"
                    data-testid="img-review-photo"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Profile Photo</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => setLocation('/')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          data-testid="button-back-home"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900" data-testid="text-onboarding-title">
            Employee Onboarding
          </h2>
          <p className="mt-2 text-sm text-gray-600" data-testid="text-onboarding-description">
            Complete your registration to join Douglas Forest RV Resort
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between" data-testid="progress-steps">
            {ONBOARDING_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                  data-testid={`step-${step.id}`}
                >
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                </div>
                {index < ONBOARDING_STEPS.length - 1 && (
                  <div
                    className={`w-20 h-1 mx-2 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <h3 className="font-medium text-gray-900" data-testid="text-current-step-title">
              {ONBOARDING_STEPS[currentStep - 1]?.title}
            </h3>
            <p className="text-sm text-gray-600" data-testid="text-current-step-description">
              {ONBOARDING_STEPS[currentStep - 1]?.description}
            </p>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>

                <div className="flex gap-4">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="flex-1"
                      data-testid="button-previous-step"
                    >
                      Previous
                    </Button>
                  )}
                  
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={registerMutation.isPending || (currentStep === 4 && !photoTaken)}
                    data-testid="button-next-step"
                  >
                    {registerMutation.isPending 
                      ? 'Submitting...' 
                      : currentStep === 5 
                        ? 'Complete Onboarding' 
                        : 'Next Step'
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}