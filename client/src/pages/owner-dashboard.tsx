import { useLocation } from "wouter";
import { ArrowLeft, Users, TriangleAlert, Shield, GraduationCap, Server, Eye, Download, Plus, Settings, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export default function OwnerDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    enabled: !!user && user.role === 'owner',
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['/api/incidents'],
    enabled: !!user && user.role === 'owner',
  });

  const recentIncidents = incidents.slice(0, 3);

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
              <h1 className="text-xl font-semibold text-slate-900">Owner Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Select defaultValue="rv-park-solutions">
                <SelectTrigger data-testid="select-company" className="w-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rv-park-solutions">RV Park Solutions</SelectItem>
                  <SelectItem value="mountain-view">Mountain View Resort</SelectItem>
                  <SelectItem value="lakeside">Lakeside Camping</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-slate-600">
                <span data-testid="text-username" className="font-medium">{user?.firstName} {user?.lastName}</span>
                <div className="text-xs text-slate-500">Owner</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Employees</p>
                  <p data-testid="metric-employees" className="text-2xl font-bold text-slate-900">
                    {stats?.totalEmployees || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Users className="text-white" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Incidents</p>
                  <p data-testid="metric-incidents" className="text-2xl font-bold text-slate-900">
                    {stats?.activeIncidents || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                  <TriangleAlert className="text-white" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Compliance Rate</p>
                  <p data-testid="metric-compliance" className="text-2xl font-bold text-slate-900">
                    {stats?.complianceRate || 0}%
                  </p>
                </div>
                <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                  <Shield className="text-white" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Training Progress</p>
                  <p data-testid="metric-training" className="text-2xl font-bold text-slate-900">
                    {stats?.trainingProgress || 0}%
                  </p>
                </div>
                <div className="w-10 h-10 bg-warning rounded-full flex items-center justify-center">
                  <GraduationCap className="text-white" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">System Health</p>
                  <p data-testid="metric-health" className="text-2xl font-bold text-success">
                    {stats?.systemHealth || 0}%
                  </p>
                </div>
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                  <Server className="text-white" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Incidents */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Recent Incidents & Reports</h3>
                  <Button variant="ghost" className="text-primary hover:text-blue-700 text-sm font-medium">
                    View All
                  </Button>
                </div>
              </div>
              <CardContent className="p-6">
                {recentIncidents.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No recent incidents
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentIncidents.map((incident: any) => (
                      <div key={incident.id} className="flex items-start space-x-4 p-4 border border-slate-200 rounded-lg">
                        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                          <TriangleAlert className="text-white" size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 data-testid={`text-incident-${incident.id}`} className="font-semibold text-slate-900">
                              {incident.title}
                            </h4>
                            <span className="text-xs text-slate-500">
                              {new Date(incident.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">
                            {incident.description}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-4">
                              <span className="text-xs text-slate-500">
                                Reporter: <span className="font-medium">{incident.reporter?.firstName} {incident.reporter?.lastName}</span>
                              </span>
                              <Badge 
                                className={
                                  incident.status === 'open' ? 'bg-warning text-white' :
                                  incident.status === 'resolved' ? 'bg-success text-white' :
                                  'bg-slate-500 text-white'
                                }
                              >
                                {incident.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button data-testid={`button-view-incident-${incident.id}`} variant="ghost" size="sm" className="text-primary hover:text-blue-700">
                                <Eye className="mr-1" size={16} />
                                Details
                              </Button>
                              <Button data-testid={`button-export-incident-${incident.id}`} variant="ghost" size="sm" className="text-secondary hover:text-green-700">
                                <Download className="mr-1" size={16} />
                                Export
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* System Overview */}
          <div className="lg:col-span-1 space-y-6">
            {/* White Label Management */}
            <Card className="shadow-lg">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">White Label Properties</h3>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">RV Park Solutions</p>
                      <p className="text-sm text-slate-600">23 employees</p>
                    </div>
                    <div className="w-3 h-3 bg-success rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Mountain View Resort</p>
                      <p className="text-sm text-slate-600">15 employees</p>
                    </div>
                    <div className="w-3 h-3 bg-success rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Lakeside Camping</p>
                      <p className="text-sm text-slate-600">9 employees</p>
                    </div>
                    <div className="w-3 h-3 bg-warning rounded-full"></div>
                  </div>
                </div>
                <Button 
                  data-testid="button-add-property"
                  className="w-full mt-4 bg-primary hover:bg-blue-700 text-white py-2 px-4 font-medium text-sm"
                >
                  <Plus className="mr-2" size={16} />
                  Add Property
                </Button>
              </CardContent>
            </Card>

            {/* System Monitoring */}
            <Card className="shadow-lg">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">System Monitoring</h3>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Database Security</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="text-sm font-medium text-success">Secure</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Data Backup</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="text-sm font-medium text-success">Up to Date</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">API Status</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="text-sm font-medium text-success">Operational</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Notifications</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-warning rounded-full"></div>
                      <span className="text-sm font-medium text-warning">3 Pending</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
              </div>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button 
                    data-testid="button-analytics"
                    className="w-full bg-primary hover:bg-blue-700 text-white py-2 px-4 font-medium text-sm justify-start"
                  >
                    <BarChart className="mr-2" size={16} />
                    Analytics Report
                  </Button>
                  <Button 
                    data-testid="button-export"
                    className="w-full bg-secondary hover:bg-green-700 text-white py-2 px-4 font-medium text-sm justify-start"
                  >
                    <Download className="mr-2" size={16} />
                    Export Data
                  </Button>
                  <Button 
                    data-testid="button-settings"
                    className="w-full bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 font-medium text-sm justify-start"
                  >
                    <Settings className="mr-2" size={16} />
                    System Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
