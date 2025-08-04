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
  currentOccupancy: number;
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  dailyExpenses: number;
  weeklyExpenses: number;
  monthlyExpenses: number;
}

interface DutyAssignment {
  id: string;
  title: string;
  description: string;
  assignedBy: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
  createdAt: string;
}

interface Message {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
  type: 'duty_request' | 'budget_request' | 'support_request' | 'general';
}

interface RevenueExpense {
  id: string;
  date: string;
  type: 'revenue' | 'expense';
  category: string;
  description: string;
  amount: number;
  source?: string;
  createdBy: string;
  editedBy?: string;
  editHistory: Array<{
    editedBy: string;
    editedAt: string;
    previousAmount: number;
    newAmount: number;
    reason: string;
  }>;
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
    'incident-reports': false,
    'revenue-tracking': false,
    'duty-assignments': false,
    'messaging-center': false,
    'employee-schedule': false
  });

  const [newMessage, setNewMessage] = useState({
    to: '',
    subject: '',
    content: '',
    priority: 'medium' as const,
    type: 'general' as const
  });

  const [newExpense, setNewExpense] = useState({
    type: 'expense' as const,
    category: '',
    description: '',
    amount: 0,
    source: ''
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

  const { data: dutyAssignments = [] as DutyAssignment[] } = useQuery({
    queryKey: ['/api/duties'],
    enabled: canAccessManager,
  });

  const { data: messages = [] as Message[] } = useQuery({
    queryKey: ['/api/messages'],
    enabled: canAccessManager,
  });

  const { data: revenueExpenses = [] as RevenueExpense[] } = useQuery({
    queryKey: ['/api/revenue-expenses'],
    enabled: canAccessManager,
  });

  const { data: schedule = [] } = useQuery({
    queryKey: ['/api/schedule'],
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

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: typeof newMessage) => {
      const response = await apiRequest("POST", "/api/messages", {
        ...messageData,
        from: user?.id,
        createdAt: new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      setNewMessage({
        to: '',
        subject: '',
        content: '',
        priority: 'medium',
        type: 'general'
      });
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
    }
  });

  const addRevenueExpenseMutation = useMutation({
    mutationFn: async (data: typeof newExpense) => {
      const response = await apiRequest("POST", "/api/revenue-expenses", {
        ...data,
        date: new Date().toISOString(),
        createdBy: user?.id,
        editHistory: []
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/revenue-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      setNewExpense({
        type: 'expense',
        category: '',
        description: '',
        amount: 0,
        source: ''
      });
      toast({
        title: "Entry Added",
        description: "Revenue/expense entry has been recorded.",
      });
    }
  });

  const updateDutyStatusMutation = useMutation({
    mutationFn: async ({ dutyId, status }: { dutyId: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/duties/${dutyId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/duties'] });
      toast({
        title: "Duty Updated",
        description: "Duty status has been updated.",
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
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Current Occupancy</p>
                      <p className="text-2xl font-bold" data-testid="stat-occupancy">{stats.currentOccupancy}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Daily Revenue</p>
                      <p className="text-2xl font-bold text-green-600" data-testid="stat-daily-revenue">${stats.dailyRevenue}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Daily Expenses</p>
                      <p className="text-2xl font-bold text-red-600" data-testid="stat-daily-expenses">${stats.dailyExpenses}</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-red-600" />
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
                      <p className="text-sm text-gray-600">Open Messages</p>
                      <p className="text-2xl font-bold text-purple-600" data-testid="stat-messages">{messages.filter(m => m.status === 'unread').length}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Duties</p>
                      <p className="text-2xl font-bold text-blue-600" data-testid="stat-duties">{dutyAssignments.filter(d => d.status !== 'completed').length}</p>
                    </div>
                    <ClipboardList className="w-8 h-8 text-blue-600" />
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

          {/* Revenue & Expense Tracking Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <Collapsible open={openSections['revenue-tracking']} onOpenChange={() => toggleSection('revenue-tracking')}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {openSections['revenue-tracking'] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg" data-testid="section-revenue">
                            Revenue & Expense Tracking
                            <Badge variant="secondary" className="ml-2">
                              Auditable
                            </Badge>
                          </CardTitle>
                          <p className="text-sm text-gray-600">Daily, weekly, and monthly financial tracking with audit trail</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Financial Summary</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-green-50 rounded-lg">
                            <div className="text-xs text-green-600 mb-1">Weekly Revenue</div>
                            <div className="text-lg font-bold text-green-800">${stats?.weeklyRevenue || 0}</div>
                          </div>
                          <div className="p-3 bg-red-50 rounded-lg">
                            <div className="text-xs text-red-600 mb-1">Weekly Expenses</div>
                            <div className="text-lg font-bold text-red-800">${stats?.weeklyExpenses || 0}</div>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="text-xs text-blue-600 mb-1">Monthly Revenue</div>
                            <div className="text-lg font-bold text-blue-800">${stats?.monthlyRevenue || 0}</div>
                          </div>
                          <div className="p-3 bg-orange-50 rounded-lg">
                            <div className="text-xs text-orange-600 mb-1">Monthly Expenses</div>
                            <div className="text-lg font-bold text-orange-800">${stats?.monthlyExpenses || 0}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Add New Entry</h4>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <select 
                              value={newExpense.type}
                              onChange={(e) => setNewExpense({...newExpense, type: e.target.value as 'revenue' | 'expense'})}
                              className="px-3 py-2 border rounded-md text-sm"
                            >
                              <option value="revenue">Revenue</option>
                              <option value="expense">Expense</option>
                            </select>
                            <input
                              type="text"
                              placeholder="Category"
                              value={newExpense.category}
                              onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                              className="px-3 py-2 border rounded-md text-sm"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Description"
                            value={newExpense.description}
                            onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                            className="w-full px-3 py-2 border rounded-md text-sm"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              placeholder="Amount"
                              value={newExpense.amount}
                              onChange={(e) => setNewExpense({...newExpense, amount: parseFloat(e.target.value) || 0})}
                              className="px-3 py-2 border rounded-md text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Source (optional)"
                              value={newExpense.source}
                              onChange={(e) => setNewExpense({...newExpense, source: e.target.value})}
                              className="px-3 py-2 border rounded-md text-sm"
                            />
                          </div>
                          <Button
                            onClick={() => addRevenueExpenseMutation.mutate(newExpense)}
                            disabled={!newExpense.category || !newExpense.description || newExpense.amount <= 0}
                            className="w-full"
                            data-testid="button-add-expense"
                          >
                            Add Entry
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </motion.div>

          {/* Duty Assignments Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className={dutyAssignments.filter(d => d.priority === 'urgent' && d.status !== 'completed').length > 0 ? 'ring-2 ring-red-200 bg-red-50/30' : ''}>
              <Collapsible open={openSections['duty-assignments']} onOpenChange={() => toggleSection('duty-assignments')}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {openSections['duty-assignments'] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg" data-testid="section-duties">
                            Duty Assignments from Owners
                            <Badge variant="secondary" className="ml-2">
                              {dutyAssignments.filter(d => d.status !== 'completed').length} active
                            </Badge>
                          </CardTitle>
                          <p className="text-sm text-gray-600">Tasks and responsibilities assigned by property owners</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {dutyAssignments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <ClipboardList className="w-12 h-12 mx-auto mb-4" />
                        <p>No duty assignments yet. Owners can assign tasks through their dashboard.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dutyAssignments.map((duty) => (
                          <div key={duty.id} className={`p-4 border rounded-lg ${
                            duty.priority === 'urgent' ? 'border-red-200 bg-red-50' :
                            duty.priority === 'high' ? 'border-orange-200 bg-orange-50' :
                            duty.status === 'completed' ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                          }`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h5 className="font-medium" data-testid={`duty-title-${duty.id}`}>{duty.title}</h5>
                                  <Badge variant={
                                    duty.priority === 'urgent' ? 'destructive' :
                                    duty.priority === 'high' ? 'default' : 'secondary'
                                  } className="text-xs">
                                    {duty.priority}
                                  </Badge>
                                  <Badge variant={
                                    duty.status === 'completed' ? 'default' :
                                    duty.status === 'in_progress' ? 'secondary' : 'outline'
                                  } className="text-xs">
                                    {duty.status.replace('_', ' ')}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{duty.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span>Due: {new Date(duty.dueDate).toLocaleDateString()}</span>
                                  <span>Assigned: {new Date(duty.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {duty.status !== 'completed' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateDutyStatusMutation.mutate({
                                        dutyId: duty.id,
                                        status: duty.status === 'pending' ? 'in_progress' : 'completed'
                                      })}
                                      data-testid={`button-update-duty-${duty.id}`}
                                    >
                                      {duty.status === 'pending' ? 'Start' : 'Complete'}
                                    </Button>
                                  </>
                                )}
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

          {/* Messaging Center Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className={messages.filter(m => m.status === 'unread').length > 0 ? 'ring-2 ring-blue-200 bg-blue-50/30' : ''}>
              <Collapsible open={openSections['messaging-center']} onOpenChange={() => toggleSection('messaging-center')}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {openSections['messaging-center'] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg" data-testid="section-messaging">
                            Owner Communications
                            {messages.filter(m => m.status === 'unread').length > 0 && (
                              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                                {messages.filter(m => m.status === 'unread').length} unread
                              </Badge>
                            )}
                          </CardTitle>
                          <p className="text-sm text-gray-600">Communication channel with property owners for support requests</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Send Message to Owners</h4>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <select 
                              value={newMessage.type}
                              onChange={(e) => setNewMessage({...newMessage, type: e.target.value as any})}
                              className="px-3 py-2 border rounded-md text-sm"
                            >
                              <option value="general">General</option>
                              <option value="budget_request">Budget Request</option>
                              <option value="support_request">Support Request</option>
                              <option value="duty_request">Duty Assignment</option>
                            </select>
                            <select 
                              value={newMessage.priority}
                              onChange={(e) => setNewMessage({...newMessage, priority: e.target.value as any})}
                              className="px-3 py-2 border rounded-md text-sm"
                            >
                              <option value="low">Low Priority</option>
                              <option value="medium">Medium Priority</option>
                              <option value="high">High Priority</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          </div>
                          <input
                            type="text"
                            placeholder="Subject"
                            value={newMessage.subject}
                            onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                            className="w-full px-3 py-2 border rounded-md text-sm"
                          />
                          <textarea
                            placeholder="Message content..."
                            value={newMessage.content}
                            onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                            className="w-full px-3 py-2 border rounded-md text-sm h-24"
                          />
                          <Button
                            onClick={() => sendMessageMutation.mutate(newMessage)}
                            disabled={!newMessage.subject || !newMessage.content}
                            className="w-full"
                            data-testid="button-send-message"
                          >
                            Send Message
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Recent Messages</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {messages.slice(0, 5).map((message) => (
                            <div key={message.id} className={`p-3 border rounded-lg text-sm ${
                              message.status === 'unread' ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                            }`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{message.subject}</span>
                                <Badge variant={
                                  message.priority === 'urgent' ? 'destructive' :
                                  message.priority === 'high' ? 'default' : 'secondary'
                                } className="text-xs">
                                  {message.priority}
                                </Badge>
                              </div>
                              <p className="text-gray-600 text-xs mb-1">{message.content.substring(0, 100)}...</p>
                              <div className="text-xs text-gray-500">
                                {new Date(message.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </motion.div>

          {/* Employee Schedule Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <Collapsible open={openSections['employee-schedule']} onOpenChange={() => toggleSection('employee-schedule')}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {openSections['employee-schedule'] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg" data-testid="section-schedule">
                            Employee Schedule Management
                            <Badge variant="secondary" className="ml-2">
                              Quick Actions
                            </Badge>
                          </CardTitle>
                          <p className="text-sm text-gray-600">Manage employee schedules and track who's working today</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Today's Schedule</h4>
                        <div className="space-y-2">
                          {getActiveToday().length === 0 ? (
                            <div className="text-center py-4 text-gray-500">
                              <Clock className="w-8 h-8 mx-auto mb-2" />
                              <p className="text-sm">No employees scheduled for today</p>
                            </div>
                          ) : (
                            getActiveToday().map((employee: Employee) => (
                              <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-medium">
                                      {employee.firstName[0]}{employee.lastName[0]}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{employee.firstName} {employee.lastName}</p>
                                    <p className="text-xs text-gray-600">{employee.role}</p>
                                  </div>
                                </div>
                                <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Schedule Actions</h4>
                        <div className="space-y-3">
                          <Button variant="outline" className="w-full justify-start" data-testid="button-view-schedule">
                            <Calendar className="w-4 h-4 mr-2" />
                            View Full Schedule
                          </Button>
                          <Button variant="outline" className="w-full justify-start" data-testid="button-add-shift">
                            <Clock className="w-4 h-4 mr-2" />
                            Add New Shift
                          </Button>
                          <Button variant="outline" className="w-full justify-start" data-testid="button-time-off">
                            <Users className="w-4 h-4 mr-2" />
                            Manage Time Off Requests
                          </Button>
                        </div>
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