import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import RoleSelector from "@/pages/role-selector";
import EmployeeOnboarding from "@/pages/employee-onboarding";
import VolunteerOnboarding from "@/pages/volunteer-onboarding";
import EmployeeHandbook from "@/pages/employee-handbook";
import SopSystem from "@/pages/sop-system";
import ManagerDashboard from "@/pages/manager-dashboard";
import OwnerDashboard from "@/pages/owner-dashboard";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={RoleSelector} />
      <Route path="/employee/onboarding" component={EmployeeOnboarding} />
      <Route path="/volunteer/onboarding" component={VolunteerOnboarding} />
      <Route path="/employee/handbook" component={EmployeeHandbook} />
      <Route path="/employee/sops" component={SopSystem} />
      <Route path="/manager/dashboard" component={ManagerDashboard} />
      <Route path="/owner/dashboard" component={OwnerDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
