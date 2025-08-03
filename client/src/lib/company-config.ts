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
  // For now, we'll use the Douglas Forest RV Resort as the default
  return {
    name: "Douglas Forest RV Resort",
    slug: "douglas-forest-rv",
    description: "Premier RV resort in the heart of the Pacific Northwest",
    website: "https://douglasforestrv.com",
    industry: "Hospitality - RV Resort",
    logo: "/assets/company-logo.png",
    branding: {
      primary: "hsl(30, 25%, 54%)",
      secondary: "hsl(90, 50%, 20%)",
      accent: "hsl(35, 30%, 85%)",
      colors: {
        tan: "#8B7355",
        forestGreen: "#2D5016",
        lightTan: "#D4C4A0"
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
  
  return templates[industry] || templates["Hospitality - RV Resort"];
};