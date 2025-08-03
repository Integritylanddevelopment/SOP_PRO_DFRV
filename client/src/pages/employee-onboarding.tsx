import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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

export default function EmployeeOnboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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
    mutationFn: async (data: OnboardingFormData) => {
      // For demo, use a default company ID
      const response = await apiRequest("POST", "/api/auth/register", {
        ...data,
        companyId: "default-company-id",
        role: "employee",
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "Your registration has been submitted for manager approval.",
        variant: "default",
      });
      setLocation('/employee/handbook');
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OnboardingFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                data-testid="button-back"
                variant="ghost" 
                size="sm" 
                onClick={() => setLocation('/')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-slate-900">Employee Onboarding</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
              <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 py-8">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to RV Park Solutions</h2>
              <p className="text-slate-600">Please complete your personal information to get started.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input 
                            data-testid="input-firstName"
                            placeholder="Enter your first name" 
                            {...field} 
                          />
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
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input 
                            data-testid="input-lastName"
                            placeholder="Enter your last name" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          data-testid="input-email"
                          type="email" 
                          placeholder="Enter your email address" 
                          {...field} 
                        />
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
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          data-testid="input-phoneNumber"
                          type="tel" 
                          placeholder="Enter your phone number" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          data-testid="input-password"
                          type="password" 
                          placeholder="Create a password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ssn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Social Security Number</FormLabel>
                      <FormControl>
                        <Input 
                          data-testid="input-ssn"
                          type="password" 
                          placeholder="Enter your SSN" 
                          {...field} 
                        />
                      </FormControl>
                      <p className="text-xs text-slate-500 mt-1 flex items-center">
                        <Lock className="h-3 w-3 mr-1" />
                        Your information is encrypted and secure
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input 
                          data-testid="input-dateOfBirth"
                          type="date" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-position">
                            <SelectValue placeholder="Select your position" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="park-maintenance">Park Maintenance</SelectItem>
                          <SelectItem value="guest-services">Guest Services</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="housekeeping">Housekeeping</SelectItem>
                          <SelectItem value="management">Management</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="bg-slate-50 p-4 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <FormControl>
                          <Checkbox
                            data-testid="checkbox-terms"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm text-slate-700 leading-relaxed">
                          I acknowledge that I have provided accurate information and understand that false information may result in termination of employment.
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  data-testid="button-submit"
                  type="submit" 
                  className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-4 px-6"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Submitting..." : "Complete Registration"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
