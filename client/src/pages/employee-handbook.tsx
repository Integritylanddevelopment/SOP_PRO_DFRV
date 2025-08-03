import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Handshake, TriangleAlert, Shield, Users, ChevronDown, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import DigitalSignature from "@/components/digital-signature";

export default function EmployeeHandbook() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState<string | null>(null);

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ['/api/handbook/sections'],
    enabled: !!user,
  });

  const signedSections = sections.filter((section: any) => section.signed).length;
  const totalSections = sections.length;
  const progressPercentage = totalSections > 0 ? (signedSections / totalSections) * 100 : 0;

  const handleSignature = (sectionId: string, signatureData: string) => {
    // This will be handled by the DigitalSignature component
    setShowSignatureModal(null);
  };

  const getSectionIcon = (sectionNumber: number) => {
    switch (sectionNumber) {
      case 1:
        return <TriangleAlert className="text-white" size={20} />;
      case 2:
        return <Shield className="text-white" size={20} />;
      case 3:
        return <Users className="text-white" size={20} />;
      default:
        return <Shield className="text-white" size={20} />;
    }
  };

  const getSectionColor = (sectionNumber: number) => {
    switch (sectionNumber) {
      case 1:
        return "bg-accent";
      case 2:
        return "bg-secondary";
      case 3:
        return "bg-blue-500";
      default:
        return "bg-slate-500";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading handbook...</p>
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
                onClick={() => setLocation('/employee/onboarding')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-slate-900">Employee Handbook</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                data-testid="button-sops"
                onClick={() => setLocation('/employee/sops')} 
                className="bg-secondary hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                SOPs
              </Button>
              <div className="text-sm text-slate-600">
                <span data-testid="text-username" className="font-medium">{user?.firstName} {user?.lastName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Progress</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Sections Completed</span>
                    <span data-testid="text-progress" className="font-semibold text-primary">
                      {signedSections}/{totalSections}
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="w-full" />
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h4 className="font-medium text-slate-900 mb-3">Quick Links</h4>
                  <div className="space-y-2">
                    <a href="#policies" className="block text-sm text-slate-600 hover:text-primary">Company Policies</a>
                    <a href="#safety" className="block text-sm text-slate-600 hover:text-primary">Safety Guidelines</a>
                    <a href="#procedures" className="block text-sm text-slate-600 hover:text-primary">Daily Procedures</a>
                    <a href="#emergency" className="block text-sm text-slate-600 hover:text-primary">Emergency Protocols</a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Welcome Section */}
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <Handshake className="text-white text-xl" size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Welcome to RV Park Solutions</h2>
                      <p className="text-slate-600">Your comprehensive employee handbook and guide</p>
                    </div>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    This handbook contains all the essential information you need to succeed in your role. 
                    Please review each section carefully and complete the acknowledgment signatures as required.
                  </p>
                </CardContent>
              </Card>

              {/* Handbook Sections */}
              {sections.map((section: any) => {
                const isExpanded = expandedSection === section.id;
                const isSigned = section.signed;
                
                return (
                  <Card key={section.id} className="shadow-lg">
                    <div className="p-6 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 ${getSectionColor(section.sectionNumber)} rounded-full flex items-center justify-center`}>
                            {getSectionIcon(section.sectionNumber)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">{section.title}</h3>
                            <p className="text-sm text-slate-600">
                              Section {section.sectionNumber} of {totalSections} • Required Reading
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isSigned ? (
                            <Badge className="bg-success text-white">
                              <Check className="h-3 w-3 mr-1" />
                              Signed
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-warning text-white">
                              Pending Signature
                            </Badge>
                          )}
                          <Button 
                            data-testid={`button-expand-${section.id}`}
                            variant="ghost" 
                            size="sm"
                            onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                          >
                            {isExpanded ? <ChevronDown /> : <ChevronRight />}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <CardContent className="p-6">
                        <div className="prose max-w-none text-slate-700 mb-6">
                          <div dangerouslySetInnerHTML={{ __html: section.content }} />
                        </div>
                        
                        {section.requiresSignature && !isSigned && (
                          <div className="bg-slate-50 rounded-lg p-6 border-2 border-dashed border-slate-300">
                            <div className="text-center">
                              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </div>
                              <h4 className="font-semibold text-slate-900 mb-2">Digital Signature Required</h4>
                              <p className="text-sm text-slate-600 mb-4">
                                By signing below, you acknowledge that you have read, understood, and agree to comply with this policy.
                              </p>
                              <Button 
                                data-testid={`button-sign-${section.id}`}
                                onClick={() => setShowSignatureModal(section.id)}
                                className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                              >
                                Sign Document
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}

              {/* Load More Button */}
              <div className="text-center py-8">
                <Button 
                  data-testid="button-load-more"
                  variant="outline" 
                  className="px-8 py-3"
                >
                  Load More Sections
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Digital Signature Modal */}
      {showSignatureModal && (
        <DigitalSignature
          sectionId={showSignatureModal}
          onSignature={handleSignature}
          onClose={() => setShowSignatureModal(null)}
        />
      )}
    </div>
  );
}
