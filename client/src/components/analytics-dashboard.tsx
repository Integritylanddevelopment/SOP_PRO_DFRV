import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Clock
} from "lucide-react";

interface AnalyticsData {
  employees: {
    total: number;
    active: number;
    onboarding: number;
    performance: number;
  };
  handbook: {
    completionRate: number;
    avgTimeToComplete: number;
    pendingSignatures: number;
  };
  sops: {
    totalExecutions: number;
    completionRate: number;
    avgExecutionTime: number;
    failureRate: number;
  };
  tasks: {
    completed: number;
    pending: number;
    overdue: number;
    avgCompletionTime: number;
  };
  incidents: {
    total: number;
    resolved: number;
    pending: number;
    severity: {
      low: number;
      medium: number;
      high: number;
    };
  };
  performance: {
    productivity: number;
    satisfaction: number;
    retention: number;
    growth: number;
  };
}

const mockAnalytics: AnalyticsData = {
  employees: {
    total: 24,
    active: 22,
    onboarding: 2,
    performance: 87
  },
  handbook: {
    completionRate: 85,
    avgTimeToComplete: 45,
    pendingSignatures: 4
  },
  sops: {
    totalExecutions: 156,
    completionRate: 92,
    avgExecutionTime: 18,
    failureRate: 8
  },
  tasks: {
    completed: 89,
    pending: 12,
    overdue: 3,
    avgCompletionTime: 2.3
  },
  incidents: {
    total: 7,
    resolved: 5,
    pending: 2,
    severity: {
      low: 4,
      medium: 2,
      high: 1
    }
  },
  performance: {
    productivity: 94,
    satisfaction: 88,
    retention: 96,
    growth: 12
  }
};

export function AnalyticsDashboard() {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('week');

  const MetricCard = ({ title, value, change, icon: Icon, color, onClick, description }: {
    title: string;
    value: string | number;
    change?: number;
    icon: any;
    color: string;
    onClick?: () => void;
    description?: string;
  }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className={`transition-all duration-300 hover:shadow-lg ${
        selectedMetric === title ? 'ring-2 ring-primary' : ''
      }`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className={`h-4 w-4 ${color}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {change !== undefined && (
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className={`mr-1 h-3 w-3 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              {change >= 0 ? '+' : ''}{change}% from last {timeRange}
            </div>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const generateNarrativeReport = () => {
    return `
      **Douglas Forest RV Resort - Weekly Performance Report**
      
      **Executive Summary:**
      Your resort is performing exceptionally well this week with a 94% overall productivity score. Employee engagement remains high at 88% satisfaction, well above industry average.
      
      **Key Highlights:**
      • 92% SOP completion rate demonstrates strong operational compliance
      • Only 3 overdue tasks showing excellent task management
      • 96% employee retention rate indicates strong workplace culture
      • 85% handbook completion rate - recommend gentle follow-up for remaining 15%
      
      **Areas of Excellence:**
      • Pool maintenance SOPs executed flawlessly (100% completion)
      • Guest check-in procedures consistently followed
      • Safety incidents remain low with quick resolution times
      
      **Recommendations:**
      • Consider recognizing top-performing employees publicly
      • Schedule refresher training for incomplete handbook sections
      • Implement predictive maintenance based on SOP data trends
      
      **Operational Metrics:**
      • Average task completion time: 2.3 days (15% improvement)
      • Guest satisfaction derived from employee performance: 88%
      • Incident resolution time: Average 1.2 days
      
      **Next Week Focus:**
      • Complete remaining handbook signatures
      • Address 2 pending incidents (both low severity)
      • Continue monitoring peak season preparation SOPs
    `;
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics & Performance</h2>
        <div className="flex gap-2">
          {['day', 'week', 'month', 'quarter'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="capitalize"
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Employees"
              value={mockAnalytics.employees.total}
              change={8}
              icon={Users}
              color="text-blue-500"
              onClick={() => setSelectedMetric('employees')}
              description={`${mockAnalytics.employees.active} active, ${mockAnalytics.employees.onboarding} onboarding`}
            />
            <MetricCard
              title="SOP Completion"
              value={`${mockAnalytics.sops.completionRate}%`}
              change={5}
              icon={CheckCircle}
              color="text-green-500"
              onClick={() => setSelectedMetric('sops')}
              description={`${mockAnalytics.sops.totalExecutions} total executions`}
            />
            <MetricCard
              title="Task Performance"
              value={`${mockAnalytics.tasks.completed}`}
              change={-2}
              icon={Target}
              color="text-purple-500"
              onClick={() => setSelectedMetric('tasks')}
              description={`${mockAnalytics.tasks.pending} pending, ${mockAnalytics.tasks.overdue} overdue`}
            />
            <MetricCard
              title="Overall Performance"
              value={`${mockAnalytics.performance.productivity}%`}
              change={3}
              icon={TrendingUp}
              color="text-orange-500"
              onClick={() => setSelectedMetric('performance')}
              description="Productivity score"
            />
          </div>

          {/* Performance Indicators */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Employee Satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {mockAnalytics.performance.satisfaction}%
                </div>
                <div className="flex items-center mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-green-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${mockAnalytics.performance.satisfaction}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Above industry average (75%)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Active Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {mockAnalytics.incidents.pending}
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {mockAnalytics.incidents.severity.high} High
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {mockAnalytics.incidents.severity.medium} Medium
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {mockAnalytics.incidents.severity.low} Low
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {mockAnalytics.incidents.resolved} resolved this {timeRange}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Avg. Task Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {mockAnalytics.tasks.avgCompletionTime}d
                </div>
                <motion.div
                  className="w-full bg-gray-200 rounded-full h-2 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.div
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "77%" }} // 2.3 days out of 3 target
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  />
                </motion.div>
                <p className="text-sm text-muted-foreground mt-2">
                  15% improvement from last {timeRange}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Employee Distribution</CardTitle>
                <CardDescription>Current workforce breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Active Employees</span>
                    <Badge variant="default">{mockAnalytics.employees.active}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>In Onboarding</span>
                    <Badge variant="secondary">{mockAnalytics.employees.onboarding}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Performance Score</span>
                    <Badge variant="outline">{mockAnalytics.employees.performance}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Handbook Progress</CardTitle>
                <CardDescription>Training completion status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Completion Rate</span>
                    <Badge variant="default">{mockAnalytics.handbook.completionRate}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Pending Signatures</span>
                    <Badge variant="secondary">{mockAnalytics.handbook.pendingSignatures}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Avg. Time (minutes)</span>
                    <Badge variant="outline">{mockAnalytics.handbook.avgTimeToComplete}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  SOP Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {mockAnalytics.sops.completionRate}%
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Pool Maintenance</span>
                    <span className="text-green-600">100%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guest Services</span>
                    <span className="text-green-600">95%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Grounds Keeping</span>
                    <span className="text-yellow-600">87%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Task Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completed</span>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-green-500 rounded"></div>
                      <span className="text-sm font-medium">{mockAnalytics.tasks.completed}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending</span>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-2 bg-yellow-500 rounded"></div>
                      <span className="text-sm font-medium">{mockAnalytics.tasks.pending}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Overdue</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded"></div>
                      <span className="text-sm font-medium">{mockAnalytics.tasks.overdue}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Uptime</span>
                    <Badge variant="default" className="bg-green-500">99.9%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Data Quality</span>
                    <Badge variant="default" className="bg-blue-500">98%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">User Satisfaction</span>
                    <Badge variant="default" className="bg-purple-500">4.8/5</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Executive Narrative Report</CardTitle>
              <CardDescription>
                AI-generated insights and recommendations for Douglas Forest RV Resort
              </CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="prose prose-sm max-w-none"
              >
                <pre className="whitespace-pre-wrap text-sm leading-relaxed bg-muted p-4 rounded-lg">
                  {generateNarrativeReport()}
                </pre>
              </motion.div>
              
              <div className="flex gap-2 mt-4">
                <Button variant="default" size="sm">
                  Download PDF
                </Button>
                <Button variant="outline" size="sm">
                  Email Report
                </Button>
                <Button variant="outline" size="sm">
                  Schedule Weekly
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}