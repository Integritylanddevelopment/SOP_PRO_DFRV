# Workflow Pro - Deployment Guide

This guide will help you deploy Workflow Pro as a white-label solution for your specific industry or clients.

## Prerequisites

### Required Services
1. **Firebase Project** (Free tier available)
   - Authentication
   - Firestore Database
   - Hosting
   
2. **OpenAI API Key** (Pay-per-use)
   - Required for AI features
   - Get from: https://platform.openai.com/api-keys

### Optional Integrations
- HR System APIs (BambooHR, ADP, etc.)
- Payroll System APIs (QuickBooks, Gusto, etc.)
- Booking System APIs (CampSpot, Reserve America, etc.)
- POS System APIs (Square, Clover, etc.)

## Step 1: Firebase Setup

### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "workflow-pro-yourcompany")
4. Enable Google Analytics (optional)

### Enable Authentication
1. Go to Authentication > Sign-in method
2. Enable Google sign-in provider
3. Add your domain to authorized domains:
   - For development: `localhost`
   - For production: Your custom domain

### Setup Firestore Database
1. Go to Firestore Database
2. Click "Create database"
3. Choose "Start in production mode"
4. Select your preferred location

### Get Configuration
1. Go to Project Settings > General
2. Scroll to "Your apps" section
3. Click "Web app" icon
4. Register your app
5. Copy the configuration values:
   - `apiKey`
   - `projectId`
   - `appId`

## Step 2: Environment Configuration

### Replit Deployment
If deploying on Replit:
1. Add these secrets in Replit:
   ```
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   OPENAI_API_KEY=sk-your_openai_api_key
   ```

### Local Development
Create `.env` file:
```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
OPENAI_API_KEY=sk-your_openai_api_key
```

## Step 3: Application Setup

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## Step 4: Onboarding Configuration

### Access Onboarding Wizard
1. Navigate to `/onboarding` in your browser
2. Choose setup type:
   - **Quick Start**: 3-minute essential setup
   - **Detailed Setup**: Comprehensive configuration

### Quick Start Configuration
1. **Company Information**
   - Company name
   - Industry selection
   - State/location
   - Number of employees

2. **AI Integration**
   - OpenAI API key
   - Enable AI features

### Detailed Setup Configuration
1. **Company Information** (same as Quick Start)

2. **Custom Branding**
   - Primary and secondary colors
   - Logo upload
   - Preview changes

3. **API Integrations**
   - OpenAI API key (required)
   - Optional: Payroll, booking, POS APIs

4. **Compliance & Insurance**
   - AI-generated compliance requirements
   - Insurance provider information
   - Coverage types selection
   - Premium reduction documentation

5. **System Integrations**
   - HR management system
   - Payroll system
   - Booking/reservation system
   - Point of sale system

## Step 5: Industry-Specific Customization

### Supported Industries
The AI system automatically configures for:
- RV Parks & Campgrounds
- Hotels & Hospitality
- Restaurants & Food Service
- Healthcare
- Construction
- Transportation & Logistics
- Oil & Gas
- Trucking
- Manufacturing
- Professional Services

### Custom Industry Setup
For industries not listed:
1. Select "Other" during onboarding
2. The AI will analyze your specific needs
3. Custom compliance requirements will be generated
4. Industry-specific SOPs will be created

## Step 6: Firebase Hosting Deployment

### Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### Initialize Hosting
```bash
firebase init hosting
```
Configuration:
- Select your Firebase project
- Public directory: `dist`
- Single-page app: `Yes`
- Overwrite index.html: `No`

### Deploy to Firebase
```bash
npm run build
firebase deploy
```

Your app will be available at: `https://your-project-id.web.app`

## Step 7: Custom Domain Setup (Optional)

### Configure Custom Domain
1. Go to Firebase Console > Hosting
2. Click "Add custom domain"
3. Enter your domain (e.g., `workflow.yourcompany.com`)
4. Follow DNS configuration instructions
5. SSL certificates are automatically provisioned

## Step 8: White-Label Customization

### Forking for Clients
1. Fork the repository for each client
2. Customize branding during onboarding
3. Deploy to client-specific Firebase projects
4. Configure custom domains

### Industry Templates
1. Create industry-specific branches
2. Pre-configure SOPs and handbooks
3. Set default compliance requirements
4. Customize AI prompts for industry needs

## Step 9: Ongoing Management

### Owner Dashboard Access
Navigate to `/owner-dashboard` for:
- AI feature management
- Advanced reporting
- System integration monitoring
- Employee and manager oversight

### Manager Dashboard Access
Navigate to `/manager-dashboard` for:
- Daily operations management
- Financial tracking
- Employee scheduling
- Duty assignments

### Regular Maintenance
1. **Monthly**: Review compliance status
2. **Quarterly**: Update insurance documentation
3. **Annually**: Renew API keys and certificates
4. **As needed**: Update integration configurations

## Step 10: Mobile App Considerations

### Progressive Web App (PWA)
The current deployment is PWA-ready:
- Works on mobile browsers
- Can be "installed" on mobile devices
- Offline capabilities for essential features

### Native Mobile Apps
For iOS and Android native apps:
1. Use React Native or similar framework
2. Leverage existing API endpoints
3. Maintain consistent branding and features
4. Deploy through app stores

## Security Considerations

### API Key Management
- Store API keys securely in environment variables
- Use Firebase Security Rules for database access
- Implement proper authentication flows
- Regular key rotation for production systems

### Data Protection
- Enable Firebase Security Rules
- Implement proper role-based access control
- Regular security audits
- GDPR/privacy compliance as needed

## Troubleshooting

### Common Issues
1. **Firebase Authentication Errors**
   - Check authorized domains
   - Verify API keys
   - Ensure proper redirect URLs

2. **OpenAI API Issues**
   - Verify API key format (starts with sk-)
   - Check usage limits and billing
   - Monitor rate limiting

3. **Integration Failures**
   - Test API connections individually
   - Verify third-party system credentials
   - Check firewall and CORS settings

### Support Resources
- Firebase Documentation: https://firebase.google.com/docs
- OpenAI API Documentation: https://platform.openai.com/docs
- React/Vite Documentation: https://vitejs.dev/guide/

## Cost Optimization

### Firebase Costs
- Firestore: Pay per read/write operation
- Authentication: Free for most use cases
- Hosting: Free tier covers most small businesses

### OpenAI Costs
- Pay per API call
- Implement caching for common queries
- Set usage limits for cost control

### Third-Party Integrations
- Most APIs charge per transaction
- Consider usage patterns when selecting plans
- Implement efficient sync strategies

## Scaling Considerations

### Multi-Tenant Architecture
The system supports multiple companies:
- Data isolation by company ID
- Shared infrastructure with isolated data
- Centralized management with distributed access

### Performance Optimization
- Enable Firebase caching
- Implement proper indexing
- Use CDN for static assets
- Monitor and optimize slow queries

## Success Metrics

### Key Performance Indicators
- User adoption rates
- Compliance improvement scores
- Time saved on administrative tasks
- Insurance premium reductions achieved
- Integration success rates

### Monitoring
- Firebase Analytics for user behavior
- Custom dashboards for business metrics
- Regular compliance audits
- Employee satisfaction surveys