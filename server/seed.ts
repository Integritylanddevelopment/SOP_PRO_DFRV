import { storage } from "./storage";
import bcrypt from "bcryptjs";

export async function seedDouglasForestRV() {
  console.log("🌲 Seeding Douglas Forest RV Resort data...");

  try {
    // Check if company already exists
    const existingCompany = await storage.getCompanyBySlug("douglas-forest-rv");
    if (existingCompany) {
      console.log("Douglas Forest RV Resort already exists, skipping seed");
      return existingCompany;
    }

    // Create Douglas Forest RV Resort company
    const company = await storage.createCompany({
      name: "Douglas Forest RV Resort",
      slug: "douglas-forest-rv",
      settings: {
        logo: "/public-objects/douglas-forest-logo.svg",
        primaryColor: "#8B7355", // Tan color from their website
        secondaryColor: "#2D5016", // Forest green
        customBranding: {
          tagline: "Embrace the Great Outdoors",
          address: "106 Douglas Rd, Webster, MA 01570",
          phone: "+1 508-943-1895",
          email: "info@douglasforestrv.com",
          amenities: [
            "Showers", "Restrooms", "Laundry Room", "30 & 50 amp sites",
            "Propane Refill Station", "Heated Pool", "Camp store",
            "Playground", "Wifi"
          ]
        }
      }
    });

    // Create owner account
    const ownerPassword = await bcrypt.hash("owner123", 10);
    const owner = await storage.createUser({
      companyId: company.id,
      email: "owner@douglasforestrv.com",
      password: ownerPassword,
      firstName: "Resort",
      lastName: "Owner",
      position: "Owner/General Manager",
      role: "owner",
      status: "active",
      phoneNumber: "+1 508-943-1895"
    });

    // Create manager account
    const managerPassword = await bcrypt.hash("manager123", 10);
    const manager = await storage.createUser({
      companyId: company.id,
      email: "manager@douglasforestrv.com",
      password: managerPassword,
      firstName: "Resort",
      lastName: "Manager",
      position: "Operations Manager",
      role: "manager",
      status: "active",
      approvedBy: owner.id,
      approvedAt: new Date(),
      phoneNumber: "+1 508-943-1895"
    });

    // Create sample employee
    const employeePassword = await bcrypt.hash("employee123", 10);
    const employee = await storage.createUser({
      companyId: company.id,
      email: "employee@douglasforestrv.com",
      password: employeePassword,
      firstName: "Resort",
      lastName: "Employee",
      position: "Maintenance Staff",
      role: "employee",
      status: "active",
      approvedBy: manager.id,
      approvedAt: new Date(),
      phoneNumber: "+1 508-943-1800"
    });

    // Create handbook sections for RV resort
    const handbookSections = [
      {
        companyId: company.id,
        title: "Welcome to Douglas Forest RV Resort",
        content: "Welcome to Douglas Forest RV Resort! This handbook contains important information about working at our beautiful resort located in the heart of Massachusetts' Douglas State Forest. Our mission is to provide exceptional outdoor experiences while maintaining the highest standards of service and safety.",
        sectionNumber: 1,
        category: "introduction",
        requiresSignature: true
      },
      {
        companyId: company.id,
        title: "Code of Conduct",
        content: "As a representative of Douglas Forest RV Resort, you are expected to maintain professional behavior at all times. This includes being courteous to guests, maintaining a clean appearance, and following all company policies. Discrimination, harassment, or unprofessional behavior will not be tolerated.",
        sectionNumber: 2,
        category: "conduct",
        requiresSignature: true
      },
      {
        companyId: company.id,
        title: "Safety Protocols",
        content: "Safety is our top priority. All employees must follow OSHA guidelines and resort-specific safety protocols. This includes proper use of personal protective equipment, reporting hazards immediately, and following emergency procedures. Regular safety training is mandatory.",
        sectionNumber: 3,
        category: "safety",
        requiresSignature: true
      },
      {
        companyId: company.id,
        title: "Guest Services Standards",
        content: "Our guests choose Douglas Forest RV Resort for a memorable outdoor experience. Always greet guests warmly, respond to requests promptly, and go above and beyond to ensure their stay is exceptional. Report any guest concerns to management immediately.",
        sectionNumber: 4,
        category: "service",
        requiresSignature: true
      },
      {
        companyId: company.id,
        title: "Maintenance and Cleanliness",
        content: "Maintaining clean, well-functioning facilities is essential to our operation. Follow all cleaning schedules, perform routine maintenance checks, and report any equipment issues immediately. All areas must meet our high cleanliness standards.",
        sectionNumber: 5,
        category: "maintenance",
        requiresSignature: true
      }
    ];

    for (const section of handbookSections) {
      await storage.createHandbookSection(section);
    }

    // Create SOPs for RV resort operations
    const sops = [
      {
        companyId: company.id,
        title: "Daily Pool Maintenance",
        description: "Daily cleaning and chemical testing procedures for the heated pool",
        category: "maintenance",
        priority: "high" as const,
        steps: [
          {
            id: "pool-1",
            title: "Test Water Chemistry",
            description: "Test chlorine, pH, and alkalinity levels using test kit",
            required: true,
            mediaRequired: true
          },
          {
            id: "pool-2", 
            title: "Skim Surface",
            description: "Remove leaves, debris, and insects from pool surface",
            required: true,
            mediaRequired: false
          },
          {
            id: "pool-3",
            title: "Empty Skimmer Baskets",
            description: "Clean out skimmer baskets and dispose of debris",
            required: true,
            mediaRequired: false
          },
          {
            id: "pool-4",
            title: "Add Chemicals if Needed",
            description: "Adjust chlorine and pH levels based on test results",
            required: true,
            mediaRequired: true
          },
          {
            id: "pool-5",
            title: "Document Results",
            description: "Record chemical levels and maintenance actions in pool log",
            required: true,
            mediaRequired: false
          }
        ]
      },
      {
        companyId: company.id,
        title: "Guest Check-In Process",
        description: "Standard procedure for welcoming and checking in RV guests",
        category: "guest-services",
        priority: "high" as const,
        steps: [
          {
            id: "checkin-1",
            title: "Greet Guest Warmly",
            description: "Welcome guest with friendly greeting and ask for reservation details",
            required: true,
            mediaRequired: false
          },
          {
            id: "checkin-2",
            title: "Verify Reservation",
            description: "Check reservation system and confirm dates, site type, and guest count",
            required: true,
            mediaRequired: false
          },
          {
            id: "checkin-3",
            title: "Collect Payment",
            description: "Process payment for stay including any additional fees",
            required: true,
            mediaRequired: false
          },
          {
            id: "checkin-4",
            title: "Assign Site",
            description: "Assign appropriate RV site based on reservation and availability",
            required: true,
            mediaRequired: false
          },
          {
            id: "checkin-5",
            title: "Provide Site Map and Information",
            description: "Give guest park map, wifi password, and resort information packet",
            required: true,
            mediaRequired: false
          },
          {
            id: "checkin-6",
            title: "Escort to Site if Needed",
            description: "Guide guest to their site if requested or if it's their first visit",
            required: false,
            mediaRequired: false
          }
        ]
      },
      {
        companyId: company.id,
        title: "Restroom Cleaning Protocol",
        description: "Daily deep cleaning procedures for restroom facilities",
        category: "maintenance",
        priority: "normal" as const,
        steps: [
          {
            id: "restroom-1",
            title: "Gather Cleaning Supplies",
            description: "Collect disinfectant, toilet paper, paper towels, mop, and cleaning cloths",
            required: true,
            mediaRequired: false
          },
          {
            id: "restroom-2",
            title: "Post Cleaning Sign",
            description: "Place 'Cleaning in Progress' sign outside restroom",
            required: true,
            mediaRequired: false
          },
          {
            id: "restroom-3",
            title: "Clean and Disinfect Toilets",
            description: "Thoroughly clean toilet bowls, seats, and handles with disinfectant",
            required: true,
            mediaRequired: false
          },
          {
            id: "restroom-4",
            title: "Clean Sinks and Mirrors",
            description: "Wipe down sinks, faucets, and mirrors with appropriate cleaner",
            required: true,
            mediaRequired: false
          },
          {
            id: "restroom-5",
            title: "Mop Floors",
            description: "Sweep and mop floors with disinfectant solution",
            required: true,
            mediaRequired: false
          },
          {
            id: "restroom-6",
            title: "Restock Supplies",
            description: "Refill toilet paper, paper towels, soap dispensers, and hand sanitizer",
            required: true,
            mediaRequired: false
          },
          {
            id: "restroom-7",
            title: "Final Inspection",
            description: "Check that all areas are clean and supplies are adequately stocked",
            required: true,
            mediaRequired: true
          }
        ]
      }
    ];

    for (const sop of sops) {
      await storage.createSop(sop);
    }

    console.log("✅ Douglas Forest RV Resort seed data created successfully!");
    console.log("Login credentials:");
    console.log("Owner: owner@douglasforestrv.com / owner123");
    console.log("Manager: manager@douglasforestrv.com / manager123");
    console.log("Employee: employee@douglasforestrv.com / employee123");
    
    return company;

  } catch (error) {
    console.error("❌ Error seeding Douglas Forest RV Resort:", error);
    throw error;
  }
}