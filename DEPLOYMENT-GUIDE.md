# Workflow Pro - Deployment Guide

## 🚀 Setting Up for a New Company

### Step 1: Fork the Repository
1. Fork this Replit project to your account
2. Rename the fork to your company name (e.g., "pine-valley-rv-workflow")

### Step 2: Configure Company Settings
Edit `config/company-config.json`:

```json
{
  "company": {
    "name": "Pine Valley RV Resort",
    "slug": "pine-valley-rv",
    "description": "Family-friendly RV resort with lake access",
    "website": "https://pinevalleyrv.com",
    "industry": "Hospitality - RV Resort",
    "logo": "/assets/pine-valley-logo.png"
  },
  "branding": {
    "primary": "hsl(120, 40%, 30%)",  // Forest Green
    "secondary": "hsl(35, 60%, 50%)",  // Warm Orange  
    "accent": "hsl(200, 20%, 85%)"     // Light Blue
  }
}
```

### Step 3: Update Branding Colors
Update `client/src/index.css` root variables:

```css
:root {
  --primary: hsl(120, 40%, 30%);     /* Your primary brand color */
  --secondary: hsl(35, 60%, 50%);    /* Your secondary color */
  --accent: hsl(200, 20%, 85%);      /* Your accent color */
}
```

### Step 4: Customize Content

#### Handbook Content
Edit handbook sections in your seed data:
- Welcome message with your company culture
- Industry-specific policies and procedures  
- Safety and compliance requirements
- Employee benefits and policies

#### Standard Operating Procedures (SOPs)
Customize SOPs for your industry:
- **RV Resort**: Check-in/out, maintenance, guest services
- **Restaurant**: Food safety, service standards, cleaning
- **Retail**: POS operations, inventory, customer service

### Step 5: Add Your Logo
1. Upload your company logo to `client/src/assets/`
2. Update the logo path in your company config
3. Ensure logo is optimized for web (PNG/SVG recommended)

### Step 6: Database Setup
```bash
npm run db:push    # Create database tables
npm run seed       # Add your company data
```

### Step 7: Test Everything
```bash
npm run dev        # Start development server
```

Test all features:
- [ ] Company branding displays correctly
- [ ] Dev bypass works for all roles
- [ ] Handbook content is accurate
- [ ] SOPs match your processes
- [ ] All dashboards function properly

### Step 8: Production Deployment

#### Option A: Replit Deployment
1. Click "Deploy" in your Replit project
2. Choose your deployment tier
3. Configure custom domain (optional)

#### Option B: Export & Deploy Elsewhere
1. Download project files
2. Set up PostgreSQL database
3. Configure environment variables
4. Deploy to your preferred platform

### Step 9: Go Live Checklist
- [ ] Dev mode disabled (`devMode.enabled: false`)
- [ ] Real company data seeded
- [ ] Logo and branding finalized
- [ ] SSL certificate configured
- [ ] User accounts created for managers/owners
- [ ] Employee onboarding process tested
- [ ] Backup procedures established

## 🎨 Industry Examples

### RV Resort/Campground
- **Primary Color**: Forest/Nature greens
- **Content Focus**: Guest services, maintenance, safety
- **Key SOPs**: Check-in, pool maintenance, grounds keeping

### Restaurant Chain
- **Primary Color**: Food-inspired (red, orange, brown)
- **Content Focus**: Food safety, service excellence
- **Key SOPs**: Food prep, cleaning, customer service

### Retail Store
- **Primary Color**: Brand-specific colors
- **Content Focus**: Sales, inventory, customer relations
- **Key SOPs**: POS operations, stocking, security

## 🔧 Advanced Customization

### Custom Features
Enable/disable features in company config:
```json
"features": {
  "handbook": true,
  "sops": true,
  "tasks": true,
  "incidents": true,
  "analytics": true
}
```

### Multi-Location Support
For companies with multiple locations, consider:
- Location-specific SOPs
- Regional manager roles
- Location-based reporting

### Integration Options
- **HR Systems**: Export employee data
- **Payroll**: Time tracking integration
- **Communication**: Slack/Teams notifications
- **File Storage**: Cloud document storage

## 📞 Support & Maintenance

### Regular Updates
- Keep employee handbook current
- Update SOPs with process changes
- Review and archive completed tasks
- Monitor system performance

### Getting Help
- Check documentation in `/docs`
- Review example configurations
- Community forum for troubleshooting
- Professional services available

---

**Workflow Pro** - Your white-label employment management solution 🌟