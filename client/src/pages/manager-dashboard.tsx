import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Bell, Clock, Users, ListTodo, TriangleAlert, UserPlus, BarChart, Check, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TaskAssignment from "@/components/task-assignment";

export default function ManagerDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showTaskAssignment, setShowTaskAssignment] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    enabled: !!user && (user.role === 'manager' || user.role === 'owner'),
  });

  const { data: pendingUsers = [] } = useQuery({
    queryKey: ['/api/users/pending'],
    enabled: !!user && (user.role === 'manager' || user.role === 'owner'),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/tasks'],
    enabled: !!user && (user.role === 'manager' || user.role === 'owner'),
  });

  const approveUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("POST", `/api/users/${userId}/approve`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({ title: "User approved successfully", variant: "default" });
    },
    onError: () => {
      toast({ title: "Failed to approve user", variant: "destructive" });
    },
  });

  const rejectUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("POST", `/api/users/${userId}/reject`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({ title: "User rejected", variant: "default" });
    },
    onError: () => {
      toast({ title: "Failed to reject user", variant: "destructive" });
    },
  });

  const activeTasks = tasks.filter((task: any) => task.status !== 'completed' && task.status !== 'cancelled');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
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
              <h1 className="text-xl font-semibold text-slate-900">Manager Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  {stats?.pendingApprovals > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {stats.pendingApprovals}
                    </span>
                  )}
                </Button>
              </div>
              <div className="text-sm text-slate-600">
                <span data-testid="text-username" className="font-medium">{user?.firstName} {user?.lastName}</span>
                <div className="text-xs text-slate-500">Manager</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Quick Stats */}
          <div className="lg:col-span-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Pending Approvals</p>
                      <p data-testid="stat-pending" className="text-3xl font-bold text-slate-900">
                        {stats?.pendingApprovals || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-warning rounded-full flex items-center justify-center">
                      <Clock className="text-white text-xl" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Active Employees</p>
                      <p data-testid="stat-employees" className="text-3xl font-bold text-slate-900">
                        {stats?.activeEmployees || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center">
                      <Users className="text-white text-xl" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Open ListTodo</p>
                      <p data-testid="stat-tasks" className="text-3xl font-bold text-slate-900">
                        {stats?.openTasks || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <ListTodo className="text-white text-xl" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Incidents Today</p>
                      <p data-testid="stat-incidents" className="text-3xl font-bold text-slate-900">
                        {stats?.activeIncidents || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                      <TriangleAlert className="text-white text-xl" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg sticky top-8">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button 
                    data-testid="button-add-employee"
                    className="w-full bg-primary hover:bg-blue-700 text-white py-3 px-4 font-medium text-sm h-auto justify-start"
                  >
                    <UserPlus className="mr-2" size={16} />
                    Add Employee
                  </Button>
                  <Button 
                    data-testid="button-assign-task"
                    onClick={() => setShowTaskAssignment(true)}
                    className="w-full bg-secondary hover:bg-green-700 text-white py-3 px-4 font-medium text-sm h-auto justify-start"
                  >
                    <ListTodo className="mr-2" size={16} />
                    Assign Task
                  </Button>
                  <Button 
                    data-testid="button-reports"
                    className="w-full bg-slate-600 hover:bg-slate-700 text-white py-3 px-4 font-medium text-sm h-auto justify-start"
                  >
                    <BarChart className="mr-2" size={16} />
                    View Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Pending Approvals */}
            <Card className="shadow-lg">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Pending Employee Approvals</h3>
                  <Badge className="bg-warning text-white">
                    {pendingUsers.length} Pending
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                {pendingUsers.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No pending approvals
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingUsers.map((employee: any) => (
                      <div key={employee.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                            <Users className="text-slate-600" size={20} />
                          </div>
                          <div>
                            <h4 data-testid={`text-employee-${employee.id}`} className="font-semibold text-slate-900">
                              {employee.firstName} {employee.lastName}
                            </h4>
                            <p className="text-sm text-slate-600">{employee.position}</p>
                            <p className="text-xs text-slate-500">
                              Submitted: {new Date(employee.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            data-testid={`button-approve-${employee.id}`}
                            onClick={() => approveUserMutation.mutate(employee.id)}
                            disabled={approveUserMutation.isPending}
                            className="bg-success hover:bg-green-700 text-white px-4 py-2 font-medium text-sm"
                          >
                            <Check className="mr-1" size={16} />
                            Approve
                          </Button>
                          <Button 
                            data-testid={`button-reject-${employee.id}`}
                            onClick={() => rejectUserMutation.mutate(employee.id)}
                            disabled={rejectUserMutation.isPending}
                            className="bg-accent hover:bg-red-700 text-white px-4 py-2 font-medium text-sm"
                          >
                            <X className="mr-1" size={16} />
                            Reject
                          </Button>
                          <Button 
                            data-testid={`button-view-${employee.id}`}
                            variant="ghost" 
                            size="sm"
                          >
                            <Eye size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active ListTodo Overview */}
            <Card className="shadow-lg">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Active ListTodo</h3>
              </div>
              <CardContent className="p-6">
                {activeTasks.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No active tasks
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeTasks.slice(0, 5).map((task: any) => (
                      <div key={task.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <ListTodo className="text-white" size={20} />
                          </div>
                          <div>
                            <h4 data-testid={`text-task-${task.id}`} className="font-semibold text-slate-900">
                              {task.title}
                            </h4>
                            <p className="text-sm text-slate-600">
                              Assigned to: <span className="font-medium">{task.assignedToUser?.firstName} {task.assignedToUser?.lastName}</span>
                            </p>
                            <p className="text-xs text-slate-500">
                              Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            className={
                              task.status === 'in_progress' ? 'bg-warning text-white' :
                              task.status === 'completed' ? 'bg-success text-white' :
                              'bg-slate-500 text-white'
                            }
                          >
                            {task.status.replace('_', ' ')}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Eye size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Task Assignment Modal */}
      {showTaskAssignment && (
        <TaskAssignment onClose={() => setShowTaskAssignment(false)} />
      )}
    </div>
  );
}
