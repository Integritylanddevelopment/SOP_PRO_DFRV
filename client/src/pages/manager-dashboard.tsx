import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Users, Calendar, CheckCircle2, Clock, AlertTriangle, BarChart3, Eye, ChevronDown, ChevronRight, UserCheck, UserX, BookOpen, ClipboardList, Shield, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: 'pending' | 'approved' | 'active' | 'inactive';
  onboardingCompleted: boolean;
  handbookCompleted: boolean;
  lastActive?: string;
  profilePhoto?: string;
}

interface TaskSummary {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

interface Stats {
  totalEmployees: number;
  pendingApprovals: number;
  activeEmployees: number;
  openTasks: number;
  activeIncidents: number;
  complianceRate: number;
  trainingProgress: number;
}

export default function ManagerDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'team-overview': false,
    'pending-approvals': false,
    'active-today': false,
    'compliance-tracking': false,
    'task-management': false,
    'incident-reports': false
  });

  // Check authorization
  const canAccessManager = user?.role === 'manager' || user?.role === 'owner';

  const { data: stats = {} as Stats } = useQuery({
    queryKey: ['/api/stats'],
    enabled: canAccessManager,
  });

  const { data: employees = [] as Employee[] } = useQuery({
    queryKey: ['/api/users/company'],
    enabled: canAccessManager,
  });

  const { data: pendingUsers = [] as Employee[] } = useQuery({
    queryKey: ['/api/users/pending'],
    enabled: canAccessManager,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/tasks'],
    enabled: canAccessManager,
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['/api/incidents'],
    enabled: canAccessManager,
  });

  const approveUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("PATCH", `/api/users/${userId}`, {
        status: 'approved'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "User Approved",
        description: "Employee has been approved and can now access the handbook.",
      });
    }
  });

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const getActiveToday = () => {
    const today = new Date().toDateString();
    return employees.filter((emp: Employee) => 
      emp.lastActive && new Date(emp.lastActive).toDateString() === today
    );
  };

  const getComplianceStatus = (employee: Employee) => {
    if (!employee.onboardingCompleted) return { status: 'onboarding', color: 'bg-yellow-100 text-yellow-800' };
    if (employee.status === 'pending') return { status: 'pending approval', color: 'bg-orange-100 text-orange-800' };
    if (!employee.handbookCompleted) return { status: 'handbook pending', color: 'bg-blue-100 text-blue-800' };
    return { status: 'compliant', color: 'bg-green-100 text-green-800' };
  };

  const getSectionIcon = (sectionId: string) => {
    const icons = {
      'team-overview': <Users className="w-5 h-5" />,
      'pending-approvals': <UserCheck className="w-5 h-5" />,
      'active-today': <Calendar className="w-5 h-5" />,
      'compliance-tracking': <Shield className="w-5 h-5" />,
      'task-management': <ClipboardList className="w-5 h-5" />,
      'incident-reports': <AlertTriangle className="w-5 h-5" />
    };
    return icons[sectionId as keyof typeof icons] || <Users className="w-5 h-5" />;
  };

  if (!canAccessManager) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4" data-testid="text-access-denied">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              You need manager or owner privileges to access this dashboard.
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-manager-dashboard">
              Manager Dashboard
            </h1>
            <p className="text-gray-600" data-testid="text-manager-subtitle">
              Employee management and oversight center
            </p>
          </div>

          {/* Quick Stats Overview */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Employees</p>
                      <p className="text-2xl font-bold" data-testid="stat-total-employees">{stats.totalEmployees}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending Approvals</p>
                      <p className="text-2xl font-bold text-orange-600" data-testid="stat-pending-approvals">{stats.pendingApprovals}</p>
                    </div>
                    <UserCheck className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Compliance Rate</p>
                      <p className="text-2xl font-bold text-green-600" data-testid="stat-compliance-rate">{stats.complianceRate}%</p>
                    </div>
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Incidents</p>
                      <p className="text-2xl font-bold text-red-600" data-testid="stat-active-incidents">{stats.activeIncidents}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Dropdown-Style Management Sections */}
        <div className="space-y-4">
          {/* Pending Approvals Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className={pendingUsers.length > 0 ? 'ring-2 ring-orange-200 bg-orange-50/30' : ''}>
              <Collapsible open={openSections['pending-approvals']} onOpenChange={() => toggleSection('pending-approvals')}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {openSections['pending-approvals'] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          {getSectionIcon('pending-approvals')}
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2" data-testid="section-pending-approvals">
                            Pending Employee Approvals
                            {pendingUsers.length > 0 && (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                {pendingUsers.length} pending
                              </Badge>
                            )}
                          </CardTitle>
                          <p className="text-sm text-gray-600">Employees waiting for manager approval to access handbook</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {pendingUsers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                        <p>No pending approvals. All employees are approved!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pendingUsers.map((employee: Employee) => (
                          <div key={employee.id} className="flex items-center justify-between p-4 bg-white border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                {employee.profilePhoto ? (
                                  <img src={employee.profilePhoto} alt="" className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                  <span className="text-sm font-medium">
                                    {employee.firstName[0]}{employee.lastName[0]}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium" data-testid={`name-${employee.id}`}>
                                  {employee.firstName} {employee.lastName}
                                </p>
                                <p className="text-sm text-gray-600">{employee.email}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {employee.onboardingCompleted ? 'Onboarding Complete' : 'Onboarding Pending'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => approveUserMutation.mutate(employee.id)}
                                disabled={approveUserMutation.isPending || !employee.onboardingCompleted}
                                size="sm"
                                data-testid={`button-approve-${employee.id}`}
                              >
                                {approveUserMutation.isPending ? 'Approving...' : 'Approve'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setLocation(`/employee-details/${employee.id}`)}
                                data-testid={`button-view-${employee.id}`}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </motion.div>

          {/* Active Today Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <Collapsible open={openSections['active-today']} onOpenChange={() => toggleSection('active-today')}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {openSections['active-today'] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          {getSectionIcon('active-today')}
                        </div>
                        <div>
                          <CardTitle className="text-lg" data-testid="section-active-today">
                            Who's Working Today
                            <Badge variant="secondary" className="ml-2">
                              {getActiveToday().length} active
                            </Badge>
                          </CardTitle>
                          <p className="text-sm text-gray-600">Employees who have been active today</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {getActiveToday().length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-4" />
                        <p>No employees have been active today yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {getActiveToday().map((employee: Employee) => (
                          <div key={employee.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium">
                                  {employee.firstName[0]}{employee.lastName[0]}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium" data-testid={`active-${employee.id}`}>
                                  {employee.firstName} {employee.lastName}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Last seen: {employee.lastActive ? new Date(employee.lastActive).toLocaleTimeString() : 'Recently'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </motion.div>

          {/* Team Overview Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <Collapsible open={openSections['team-overview']} onOpenChange={() => toggleSection('team-overview')}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {openSections['team-overview'] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          {getSectionIcon('team-overview')}
                        </div>
                        <div>
                          <CardTitle className="text-lg" data-testid="section-team-overview">
                            All Team Members
                            <Badge variant="secondary" className="ml-2">
                              {employees.length} total
                            </Badge>
                          </CardTitle>
                          <p className="text-sm text-gray-600">Complete team overview and management</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {employees.map((employee: Employee) => {
                        const compliance = getComplianceStatus(employee);
                        return (
                          <div key={employee.id} className="flex items-center justify-between p-4 bg-white border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                {employee.profilePhoto ? (
                                  <img src={employee.profilePhoto} alt="" className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                  <span className="text-sm font-medium">
                                    {employee.firstName[0]}{employee.lastName[0]}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium" data-testid={`team-name-${employee.id}`}>
                                  {employee.firstName} {employee.lastName}
                                </p>
                                <p className="text-sm text-gray-600">{employee.email}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className={`text-xs ${compliance.color}`}>
                                    {compliance.status}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {employee.role}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setLocation(`/employee-details/${employee.id}`)}
                                data-testid={`button-details-${employee.id}`}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </motion.div>

          {/* Compliance Tracking Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <Collapsible open={openSections['compliance-tracking']} onOpenChange={() => toggleSection('compliance-tracking')}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {openSections['compliance-tracking'] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          {getSectionIcon('compliance-tracking')}
                        </div>
                        <div>
                          <CardTitle className="text-lg" data-testid="section-compliance">
                            Compliance Tracking
                            {stats && (
                              <Badge variant="secondary" className="ml-2">
                                {stats.complianceRate}% compliant
                              </Badge>
                            )}
                          </CardTitle>
                          <p className="text-sm text-gray-600">Track handbook completion and training progress</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Handbook Completion</h4>
                        <div className="space-y-2">
                          {employees.map((employee: Employee) => (
                            <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm" data-testid={`compliance-name-${employee.id}`}>
                                {employee.firstName} {employee.lastName}
                              </span>
                              <div className="flex items-center gap-2">
                                {employee.handbookCompleted ? (
                                  <Badge className="bg-green-100 text-green-800 text-xs">Complete</Badge>
                                ) : employee.onboardingCompleted ? (
                                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">In Progress</Badge>
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-800 text-xs">Not Started</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Training Progress</h4>
                        {stats && (
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Overall Progress</span>
                              <span className="text-sm text-blue-600">{stats.trainingProgress}%</span>
                            </div>
                            <Progress value={stats.trainingProgress} className="h-2" />
                            <p className="text-xs text-gray-600 mt-2">
                              Based on handbook signatures and SOP completions
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}