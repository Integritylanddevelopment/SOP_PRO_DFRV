import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Users, TriangleAlert, Building, Settings, Plus, BarChart, Eye, Download, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { AnimatedBackground } from "@/components/animated-background";
import { AIAssistant } from "@/components/ai-assistant";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { getCompanyConfig } from "@/lib/company-config";

export default function OwnerDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedProperty, setSelectedProperty] = useState("douglas-forest");
  const companyConfig = getCompanyConfig();

  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    enabled: !!user && user.role === 'owner',
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['/api/incidents'],
    enabled: !!user && user.role === 'owner',
  });

  const recentIncidents = incidents.slice(0, 3);

  // Multi-tenant properties data
  const properties = [
    { id: "douglas-forest", name: "Douglas Forest RV Resort", status: "active", employees: 24 },
    { id: "mountain-view", name: "Mountain View Resort", status: "active", employees: 18 },
    { id: "lakeside-camping", name: "Lakeside Camping", status: "active", employees: 15 },
    { id: "pine-valley", name: "Pine Valley RV Park", status: "pending", employees: 8 }
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Enhanced Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/95 backdrop-blur-sm shadow-sm border-b relative z-10"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  data-testid="button-back"
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setLocation('/')}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </motion.div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  Owner Dashboard
                </h1>
                <p className="text-sm text-slate-600">{companyConfig.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Multi-Property Selector */}
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger data-testid="select-property" className="w-64">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{property.name}</span>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                            {property.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {property.employees} employees
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Action Buttons */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm" data-testid="button-add-property">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm" data-testid="button-settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </motion.div>

              <div className="text-sm text-slate-600">
                <span data-testid="text-username" className="font-medium">{user?.firstName} {user?.lastName}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Analytics  
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Quick Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Card className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                      <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">4</div>
                      <p className="text-xs text-muted-foreground">
                        3 active, 1 pending
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }}>
                  <Card className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.totalEmployees || 65}</div>
                      <p className="text-xs text-muted-foreground">
                        Across all properties
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }}>
                  <Card className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
                      <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">94%</div>
                      <p className="text-xs text-muted-foreground">
                        +5% from last month
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }}>
                  <Card className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
                      <TriangleAlert className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">3</div>
                      <p className="text-xs text-muted-foreground">
                        Requires attention
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Narrative Reports - Clickable */}
              <div className="grid gap-6 md:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Executive Summary Report
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        <strong>Douglas Forest RV Resort</strong> - Q4 Performance Analysis
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Pool Maintenance SOPs</span>
                          <Badge variant="default">100% Complete</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Guest Services Rating</span>
                          <Badge variant="default">4.8/5.0</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Employee Satisfaction</span>
                          <Badge variant="secondary">89%</Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Generate Full Report
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TriangleAlert className="h-5 w-5" />
                        Operational Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <div>
                            <p className="text-sm font-medium">Peak Season Preparation</p>
                            <p className="text-xs text-muted-foreground">87% Complete</p>
                          </div>
                          <Badge variant="secondary">In Progress</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <div>
                            <p className="text-sm font-medium">Staff Training Module</p>
                            <p className="text-xs text-muted-foreground">2 employees pending</p>
                          </div>
                          <Badge variant="secondary">Action Needed</Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Detailed Analysis
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="cursor-pointer" onClick={() => setSelectedProperty(property.id)}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{property.name}</span>
                        <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                          {property.status}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Employees</span>
                          <span className="font-medium">{property.employees}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Performance</span>
                          <span className="font-medium text-green-600">
                            {property.status === 'active' ? '92%' : 'Setting up...'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Configure global settings for all properties and company-wide preferences.
                </p>
                <Button>Configure Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Assistant */}
      <AIAssistant userRole="owner" />
    </div>
  );
}