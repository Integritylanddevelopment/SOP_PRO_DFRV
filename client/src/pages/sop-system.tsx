import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Search, TriangleAlert, Save, Check, Plus, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import SopChecklist from "@/components/sop-checklist";

export default function SopSystem() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeSop, setActiveSop] = useState<string | null>(null);

  const { data: sops = [], isLoading } = useQuery({
    queryKey: ['/api/sops'],
    enabled: !!user,
  });

  const filteredSops = sops.filter((sop: any) => {
    const matchesSearch = sop.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || sop.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const emergencySops = sops.filter((sop: any) => sop.category === "Emergency");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading SOPs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                data-testid="button-back"
                variant="ghost" 
                size="sm" 
                onClick={() => setLocation('/employee/handbook')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-slate-900">Standard Operating Procedures</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-success px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white text-sm font-medium">Online</span>
              </div>
              <div className="text-sm text-slate-600">
                <span data-testid="text-username" className="font-medium">{user?.firstName} {user?.lastName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Emergency Quick Access */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                  <TriangleAlert className="text-accent mr-2" size={20} />
                  Emergency SOPs
                </h3>
                <div className="space-y-3">
                  {emergencySops.map((sop: any) => (
                    <Button
                      key={sop.id}
                      data-testid={`button-emergency-${sop.id}`}
                      onClick={() => setActiveSop(sop.id)}
                      className="w-full text-left p-3 bg-accent hover:bg-red-700 text-white rounded-lg text-sm h-auto justify-start"
                    >
                      {sop.title}
                    </Button>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h4 className="font-medium text-slate-900 mb-3">Active Incidents</h4>
                  <div className="text-sm text-slate-600 text-center py-4">
                    No active incidents
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main SOP Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Search and Filter */}
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                      <Input
                        data-testid="input-search"
                        type="text"
                        placeholder="Search SOPs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger data-testid="select-category" className="w-full md:w-auto">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="guest-services">Guest Services</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* SOPs List */}
              {filteredSops.map((sop: any) => {
                const isActive = activeSop === sop.id;
                
                return (
                  <Card key={sop.id} className={`shadow-lg ${isActive ? 'border-l-4 border-accent' : ''}`}>
                    <div className="p-6 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 ${sop.category === 'Emergency' ? 'bg-accent' : 'bg-orange-500'} rounded-full flex items-center justify-center`}>
                            <TriangleAlert className="text-white text-xl" size={24} />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-slate-900">{sop.title}</h3>
                            <p className="text-sm text-slate-600">
                              {sop.category} SOP • {sop.steps?.length || 0} steps
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isActive && (
                            <Badge className="bg-accent text-white">ACTIVE</Badge>
                          )}
                          <Button 
                            data-testid={`button-toggle-${sop.id}`}
                            variant="ghost" 
                            size="sm"
                            onClick={() => setActiveSop(isActive ? null : sop.id)}
                          >
                            {isActive ? "↑" : "→"}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {isActive && (
                      <CardContent className="p-6">
                        <SopChecklist sop={sop} />
                      </CardContent>
                    )}
                  </Card>
                );
              })}

              {filteredSops.length === 0 && (
                <Card className="shadow-lg">
                  <CardContent className="p-12 text-center">
                    <div className="text-slate-400 mb-4">
                      <Search size={48} className="mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No SOPs Found</h3>
                    <p className="text-slate-600">Try adjusting your search terms or category filter.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
