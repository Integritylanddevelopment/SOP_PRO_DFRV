// White-label company configuration
export interface CompanyConfig {
  name: string;
  slug: string;
  description: string;
  website: string;
  industry: string;
  logo: string;
  branding: {
    primary: string;
    secondary: string;
    accent: string;
    colors: Record<string, string>;
  };
  features: {
    handbook: boolean;
    sops: boolean;
    tasks: boolean;
    incidents: boolean;
    analytics: boolean;
    whiteLabel: boolean;
  };
  devMode: {
    enabled: boolean;
    bypassAuth: boolean;
    seedData: boolean;
  };
}

// Load company configuration  
export const getCompanyConfig = (): CompanyConfig => {
  // In production, this would be loaded from a config service or environment
  // This is the white-label default - customize for each client
  return {
    name: "Workflow Pro Organization",
    slug: "workflow-pro",
    description: "Comprehensive employment management system",
    website: "https://workflowpro.example.com",
    industry: "Multi-Purpose Management",
    logo: "/assets/company-logo.png",
    branding: {
      primary: "hsl(217, 91%, 60%)", // blue-500
      secondary: "hsl(217, 83%, 35%)", // blue-800  
      accent: "hsl(214, 95%, 93%)", // blue-100
      colors: {
        primary: "#3b82f6",
        secondary: "#1e40af", 
        accent: "#dbeafe"
      }
    },
    features: {
      handbook: true,
      sops: true,
      tasks: true,
      incidents: true,
      analytics: true,
      whiteLabel: true
    },
    devMode: {
      enabled: !import.meta.env.PROD,
      bypassAuth: !import.meta.env.PROD,
      seedData: true
    }
  };
};

// Generate industry-specific content templates
export const getIndustryTemplates = (industry: string) => {
  const templates = {
    "Multi-Purpose Management": {
      handbookSections: [
        "Welcome & Organization Culture",
        "Roles & Responsibilities", 
        "Safety & Emergency Procedures",
        "Communication Standards",
        "Performance Expectations"
      ],
      sopCategories: [
        "Standard Operations",
        "Communication Procedures", 
        "Safety & Compliance",
        "Quality Standards",
        "Administrative Tasks"
      ]
    },
    "Hospitality - RV Resort": {
      handbookSections: [
        "Welcome & Company Culture",
        "Guest Service Standards", 
        "Safety & Emergency Procedures",
        "Maintenance & Grounds Keeping",
        "Reservation Management"
      ],
      sopCategories: [
        "Guest Check-in/Check-out",
        "Pool & Recreation Maintenance", 
        "Grounds & Facility Care",
        "Emergency Response",
        "Equipment Operation"
      ]
    },
    "Non-Profit Organization": {
      handbookSections: [
        "Mission & Values",
        "Volunteer Guidelines",
        "Community Standards",
        "Safety & Procedures",
        "Service Expectations"
      ],
      sopCategories: [
        "Volunteer Onboarding",
        "Community Outreach",
        "Event Management",
        "Administrative Procedures",
        "Safety Protocols"
      ]
    },
    "Food Service": {
      handbookSections: [
        "Food Safety & Sanitation",
        "Customer Service Excellence",
        "Kitchen Safety Procedures", 
        "Inventory Management",
        "Health Department Compliance"
      ],
      sopCategories: [
        "Food Preparation",
        "Cleaning & Sanitization",
        "Customer Service",
        "Equipment Maintenance",
        "Safety Procedures"
      ]  
    },
    "Retail": {
      handbookSections: [
        "Customer Service Standards",
        "Sales Techniques & Procedures",
        "Inventory Management",
        "Loss Prevention",
        "Store Operations"
      ],
      sopCategories: [
        "Point of Sale Operations",
        "Inventory Control", 
        "Customer Relations",
        "Store Maintenance",
        "Security Procedures"
      ]
    }
  };
  
  return templates[industry as keyof typeof templates] || templates["Hospitality - RV Resort"];
};