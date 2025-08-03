# Workflow Pro - White-Label Employment Management System

## 🚀 Quick Start for New Companies

Workflow Pro is designed to be easily forked and customized for different companies. Here's how to set up a new company deployment:

### 1. Fork & Clone
```bash
# Fork this repository on Replit
# Clone to your new company workspace
```

### 2. Configure Your Company
Edit `config/company-config.json`:
```json
{
  "company": {
    "name": "Your Company Name",
    "slug": "your-company-slug", 
    "description": "Your company description",
    "website": "https://yourcompany.com",
    "industry": "Your Industry",
    "logo": "/assets/your-logo.png"
  },
  "branding": {
    "primary": "hsl(210, 80%, 50%)",
    "secondary": "hsl(120, 60%, 40%)", 
    "accent": "hsl(45, 100%, 85%)"
  }
}
```

### 3. Customize Content
- **Handbook**: Edit sections in `data/handbook-templates/`
- **SOPs**: Modify procedures in `data/sop-templates/`
- **Branding**: Update colors in `client/src/index.css`

### 4. Deploy
```bash
npm run db:push    # Set up database
npm run seed       # Add your company data
npm run dev        # Start development
```

## 🏢 Industry-Specific Templates

### RV Resort/Campground
- Guest check-in/out procedures
- Pool & recreation maintenance
- Grounds keeping standards
- Emergency protocols

### Restaurant/Food Service  
- Food safety & sanitation
- Kitchen procedures
- Customer service standards
- Health department compliance

### Retail Store
- Point of sale operations
- Inventory management
- Customer service protocols
- Loss prevention procedures

## 🎨 Customization Guide

### Branding
1. Update `config/company-config.json` with your colors
2. Replace logo in `client/src/assets/`
3. Modify CSS variables in `client/src/index.css`

### Content
1. Edit handbook sections for your industry
2. Customize SOP templates
3. Update onboarding workflow
4. Modify dashboard content

### Features
Toggle features in company config:
```json
"features": {
  "handbook": true,
  "sops": true, 
  "tasks": true,
  "incidents": true,
  "analytics": true
}
```

## 🔧 Development vs Production

### Development Mode
- Dev bypass login buttons
- Sample data seeding
- Debug features enabled

### Production Mode  
- Authentication required
- Dev features hidden
- Company-specific branding only

## 📋 Deployment Checklist

- [ ] Company information configured
- [ ] Branding colors updated
- [ ] Logo uploaded
- [ ] Handbook content customized
- [ ] SOP procedures defined
- [ ] Database seeded with company data
- [ ] Dev mode disabled for production
- [ ] SSL certificate configured
- [ ] Custom domain set up (optional)

## 🛠 Technical Architecture

Built on modern tech stack:
- **Frontend**: React + TypeScript + Tailwind
- **Backend**: Express.js + PostgreSQL
- **Database**: Drizzle ORM
- **Deployment**: Replit (with easy fork workflow)

## 📞 Support

For customization help or technical support:
- Check the documentation in `/docs`
- Review example configurations
- Submit issues on the main repository

---

**Workflow Pro** - Powering employee management for companies worldwide 🌟