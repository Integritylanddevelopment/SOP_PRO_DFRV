#!/usr/bin/env node

/**
 * Workflow Pro - New Company Setup Script
 * 
 * This script helps configure a new company deployment:
 * 1. Updates company configuration
 * 2. Customizes branding and colors
 * 3. Sets up industry-specific content
 * 4. Generates seed data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function setupNewCompany(companyData) {
  console.log(`🚀 Setting up Workflow Pro for: ${companyData.name}`);
  
  // Update company configuration
  const configPath = path.join(__dirname, '../config/company-config.json');
  fs.writeFileSync(configPath, JSON.stringify(companyData, null, 2));
  console.log('✅ Company configuration updated');
  
  // Generate CSS variables for branding
  generateBrandingCSS(companyData.branding);
  console.log('✅ Branding CSS generated');
  
  // Generate industry-specific seed data
  generateSeedData(companyData);
  console.log('✅ Seed data templates created');
  
  console.log(`\n🎉 ${companyData.name} is ready!`);
  console.log('Next steps:');
  console.log('1. Run: npm run db:push');
  console.log('2. Run: npm run seed');
  console.log('3. Run: npm run dev');
}

function generateBrandingCSS(branding) {
  const cssContent = `/* Auto-generated branding for ${Date.now()} */
:root {
  --brand-primary: ${branding.primary};
  --brand-secondary: ${branding.secondary};
  --brand-accent: ${branding.accent};
}`;
  
  fs.writeFileSync(
    path.join(__dirname, '../client/src/styles/brand-overrides.css'), 
    cssContent
  );
}

function generateSeedData(companyData) {
  // Create company-specific seed templates
  const seedTemplate = {
    company: companyData.company,
    industry: companyData.company.industry,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(
    path.join(__dirname, '../data/company-seed.json'),
    JSON.stringify(seedTemplate, null, 2)
  );
}

// Example usage for different industries
const exampleConfigs = {
  rvResort: {
    name: "Pine Valley RV Resort",
    slug: "pine-valley-rv",
    industry: "Hospitality - RV Resort",
    branding: {
      primary: "hsl(120, 40%, 30%)",
      secondary: "hsl(35, 60%, 50%)",
      accent: "hsl(200, 20%, 85%)"
    }
  },
  restaurant: {
    name: "Bella Vista Restaurant", 
    slug: "bella-vista",
    industry: "Food Service",
    branding: {
      primary: "hsl(15, 70%, 45%)",
      secondary: "hsl(45, 80%, 40%)",
      accent: "hsl(0, 0%, 95%)"
    }
  },
  retail: {
    name: "Mountain Gear Outfitters",
    slug: "mountain-gear", 
    industry: "Retail",
    branding: {
      primary: "hsl(210, 60%, 40%)",
      secondary: "hsl(25, 70%, 50%)",
      accent: "hsl(0, 0%, 90%)"
    }
  }
};

export { setupNewCompany, exampleConfigs };