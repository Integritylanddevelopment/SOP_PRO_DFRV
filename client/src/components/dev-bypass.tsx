import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

const DEV_ACCOUNTS = [
  {
    email: "owner@douglasforestrv.com",
    password: "owner123",
    role: "owner",
    name: "Resort Owner",
    description: "Full system access, analytics, white-label management"
  },
  {
    email: "manager@douglasforestrv.com", 
    password: "manager123",
    role: "manager",
    name: "Resort Manager",
    description: "Employee approval, task assignment, incident oversight"
  },
  {
    email: "employee@douglasforestrv.com",
    password: "employee123", 
    role: "employee",
    name: "Resort Employee",
    description: "Handbook access, SOP execution, task completion"
  }
];

export function DevBypass() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  const handleQuickLogin = async (account: typeof DEV_ACCOUNTS[0]) => {
    try {
      await login(account.email, account.password);
      // Navigate to appropriate dashboard based on role
      if (account.role === 'owner') {
        setLocation('/owner/dashboard');
      } else if (account.role === 'manager') {
        setLocation('/manager/dashboard');
      } else {
        setLocation('/employee/handbook');
      }
    } catch (error) {
      console.error('Dev login failed:', error);
    }
  };

  return (
    <Card className="border-2 border-dashed border-yellow-400 bg-yellow-50 dark:bg-yellow-950">
      <CardHeader>
        <CardTitle className="text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
          🚧 Development Bypass
        </CardTitle>
        <CardDescription className="text-yellow-700 dark:text-yellow-300">
          Quick login for testing different user roles and functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {DEV_ACCOUNTS.map((account) => (
          <div key={account.email} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{account.name}</span>
                <Badge 
                  variant={account.role === 'owner' ? 'destructive' : account.role === 'manager' ? 'default' : 'secondary'}
                  data-testid={`badge-role-${account.role}`}
                >
                  {account.role}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{account.description}</p>
              <p className="text-xs text-muted-foreground mt-1">{account.email}</p>
            </div>
            <Button 
              size="sm" 
              onClick={() => handleQuickLogin(account)}
              className="ml-4"
              data-testid={`button-quick-login-${account.role}`}
            >
              Quick Login
            </Button>
          </div>
        ))}
        <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-4 p-2 bg-yellow-100 dark:bg-yellow-900 rounded">
          <strong>Note:</strong> This bypass panel only appears in development mode and will be automatically hidden in production builds.
        </div>
      </CardContent>
    </Card>
  );
}