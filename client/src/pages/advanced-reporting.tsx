import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  Download,
  Settings,
  Link,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ApiConnection {
  id: string;
  name: string;
  type: 'payroll' | 'booking' | 'pos' | 'hr';
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  apiKey: string;
}

const CHART_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export default function AdvancedReporting() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDateRange, setSelectedDateRange] = useState("30");
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for demonstration
  const revenueData = [
    { month: 'Jan', revenue: 45000, expenses: 32000 },
    { month: 'Feb', revenue: 52000, expenses: 35000 },
    { month: 'Mar', revenue: 48000, expenses: 33000 },
    { month: 'Apr', revenue: 61000, expenses: 38000 },
    { month: 'May', revenue: 55000, expenses: 36000 },
    { month: 'Jun', revenue: 67000, expenses: 41000 },
  ];

  const occupancyData = [
    { week: 'Week 1', occupancy: 78 },
    { week: 'Week 2', occupancy: 85 },
    { week: 'Week 3', occupancy: 92 },
    { week: 'Week 4', occupancy: 88 },
  ];

  const complianceData = [
    { name: 'Completed', value: 85, color: '#10b981' },
    { name: 'Pending', value: 12, color: '#f59e0b' },
    { name: 'Overdue', value: 3, color: '#ef4444' },
  ];

  const { data: stats = {} } = useQuery({
    queryKey: ['/api/stats'],
    enabled: !!user && (user.role === 'manager' || user.role === 'owner'),
  });

  const { data: apiConnections = [] } = useQuery({
    queryKey: ['/api/integrations'],
    enabled: !!user && user.role === 'owner',
    queryFn: () => [
      { id: '1', name: 'QuickBooks Payroll', type: 'payroll', status: 'connected', lastSync: '2025-01-04T10:30:00Z', apiKey: '***configured***' },
      { id: '2', name: 'CampSpot Booking', type: 'booking', status: 'disconnected', lastSync: '', apiKey: '' },
      { id: '3', name: 'Square POS', type: 'pos', status: 'connected', lastSync: '2025-01-04T09:15:00Z', apiKey: '***configured***' },
      { id: '4', name: 'BambooHR', type: 'hr', status: 'error', lastSync: '2025-01-03T14:20:00Z', apiKey: '***configured***' },
    ] as ApiConnection[]
  });

  const testConnectionMutation = useMutation({
    mutationFn: (connectionId: string) => apiRequest(`/api/integrations/${connectionId}/test`, {
      method: 'POST',
      body: {}
    }),
    onSuccess: () => {
      toast({
        title: "Connection Test",
        description: "API connection tested successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Error",
        description: error.message || "Failed to test connection",
        variant: "destructive"
      });
    }
  });

  const exportReportMutation = useMutation({
    mutationFn: (reportType: string) => apiRequest('/api/reports/export', {
      method: 'POST',
      body: { type: reportType, dateRange: selectedDateRange }
    }),
    onSuccess: () => {
      toast({
        title: "Export Started",
        description: "Your report will be emailed to you shortly",
      });
    }
  });

  if (!user || (user.role !== 'manager' && user.role !== 'owner')) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">You need manager or owner permissions to view reports.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Reporting</h1>
          <p className="text-gray-600">Comprehensive analytics and system integrations</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
            <SelectTrigger className="w-40" data-testid="select-date-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={() => exportReportMutation.mutate('comprehensive')}
            disabled={exportReportMutation.isPending}
            data-testid="button-export-report"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="financial" data-testid="tab-financial">Financial</TabsTrigger>
          <TabsTrigger value="compliance" data-testid="tab-compliance">Compliance</TabsTrigger>
          <TabsTrigger value="integrations" data-testid="tab-integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(stats as any)?.monthlyRevenue?.toLocaleString() || '48,900'}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stats as any)?.activeEmployees || 6}</div>
                <p className="text-xs text-muted-foreground">+2 this quarter</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stats as any)?.complianceRate || 85}%</div>
                <p className="text-xs text-muted-foreground">+5% improvement</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Occupancy</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stats as any)?.currentOccupancy || 23}</div>
                <p className="text-xs text-muted-foreground">sites occupied</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                    <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Occupancy Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={occupancyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="occupancy" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Average Daily Revenue</Label>
                  <p className="text-2xl font-bold">${(stats as any)?.dailyRevenue || '1,850'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Average Daily Expenses</Label>
                  <p className="text-2xl font-bold">${(stats as any)?.dailyExpenses || '320'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Profit Margin</Label>
                  <p className="text-2xl font-bold">82.7%</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Revenue per Site</Label>
                  <p className="text-2xl font-bold">$80.43</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={complianceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {complianceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Safety Training Overdue</h4>
                    <p className="text-sm text-red-700">3 employees need updated safety certifications</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Insurance Review Due</h4>
                    <p className="text-sm text-yellow-700">Annual insurance review scheduled for next week</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">OSHA Compliance</h4>
                    <p className="text-sm text-green-700">All OSHA requirements up to date</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="grid gap-6">
            {apiConnections.map((connection) => (
              <Card key={connection.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Link className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{connection.name}</CardTitle>
                        <p className="text-sm text-gray-600 capitalize">{connection.type} System</p>
                      </div>
                    </div>
                    <Badge 
                      variant={connection.status === 'connected' ? 'default' : 
                               connection.status === 'error' ? 'destructive' : 'secondary'}
                    >
                      {connection.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="grid grid-cols-2 gap-4 flex-1">
                      <div>
                        <Label className="text-sm font-medium">API Status</Label>
                        <p className="text-sm text-gray-600">
                          {connection.status === 'connected' ? '✓ Active' : 
                           connection.status === 'error' ? '✗ Error' : '○ Not Connected'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Last Sync</Label>
                        <p className="text-sm text-gray-600">
                          {connection.lastSync ? new Date(connection.lastSync).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testConnectionMutation.mutate(connection.id)}
                        disabled={testConnectionMutation.isPending}
                        data-testid={`button-test-${connection.type}`}
                      >
                        Test Connection
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid={`button-configure-${connection.type}`}
                      >
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Add New Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'Sage Payroll', type: 'payroll' },
                  { name: 'Reserve America', type: 'booking' },
                  { name: 'Clover POS', type: 'pos' },
                  { name: 'Workday HR', type: 'hr' },
                ].map((integration) => (
                  <Button 
                    key={integration.name}
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center"
                    data-testid={`button-add-${integration.type}`}
                  >
                    <Settings className="w-6 h-6 mb-2" />
                    <span className="text-sm">{integration.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}