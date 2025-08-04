import { Building, Heart } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DevBypass } from "@/components/dev-bypass";
import { getCompanyConfig } from "@/lib/company-config";

export default function RoleSelector() {
  const [, setLocation] = useLocation();
  const companyConfig = getCompanyConfig();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        <DevBypass />
        <Card className="w-full shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="text-white text-2xl" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Workflow Pro</h1>
            <p className="text-slate-600">{companyConfig.name}</p>
            <p className="text-sm text-slate-500">Select your role to continue</p>
          </div>
          
          <div className="space-y-4">
            <Button 
              data-testid="button-employee"
              onClick={() => setLocation('/employee/onboarding')} 
              className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-4 px-6 h-auto flex items-center justify-between"
            >
              <div className="flex items-center text-left">
                <div className="ml-3">
                  <div className="font-semibold">Employee</div>
                  <div className="text-sm opacity-90">Complete onboarding & access handbook</div>
                </div>
              </div>
            </Button>

            <Button 
              data-testid="button-volunteer"
              onClick={() => setLocation('/volunteer/onboarding')} 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 h-auto flex items-center justify-between"
            >
              <div className="flex items-center text-left">
                <div className="ml-3">
                  <div className="font-semibold">Volunteer</div>
                  <div className="text-sm opacity-90">Sign charitable agreements & contribute</div>
                </div>
              </div>
            </Button>
            
            <Button 
              data-testid="button-manager"
              onClick={() => setLocation('/manager/dashboard')} 
              className="w-full bg-secondary hover:bg-green-700 text-white font-semibold py-4 px-6 h-auto flex items-center justify-between"
            >
              <div className="flex items-center text-left">
                <div className="ml-3">
                  <div className="font-semibold">Manager</div>
                  <div className="text-sm opacity-90">Approve employees & assign tasks</div>
                </div>
              </div>
            </Button>
            
            <Button 
              data-testid="button-owner"
              onClick={() => setLocation('/owner/dashboard')} 
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-4 px-6 h-auto flex items-center justify-between"
            >
              <div className="flex items-center text-left">
                <div className="ml-3">
                  <div className="font-semibold">Owner</div>
                  <div className="text-sm opacity-90">Full system access & analytics</div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
