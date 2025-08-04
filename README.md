# Workflow Pro - White-Label Employment Management System

A comprehensive white-label employment management and onboarding system designed for easy customization and deployment across multiple companies. Features Firebase authentication, cloud database hosting, AI-powered assistance, compliance management, and advanced reporting capabilities.

## Quick Start

### Prerequisites

1. **Firebase Project Setup**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select existing one
   - Enable Authentication with Google sign-in
   - Add a web app and get configuration values

2. **OpenAI API Key** (Required for AI features)
   - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Required format: `sk-...`

### Installation

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd workflow-pro
   npm install
   ```

2. **Configure Environment Variables**
   Add these secrets to your Replit project:
   ```
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   OPENAI_API_KEY=sk-your_openai_api_key
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Complete Onboarding**
   - Navigate to `/onboarding` in your browser
   - Choose between Quick Start (3 minutes) or Detailed Setup
   - Follow the AI-guided setup process

## Features

### 🚀 Onboarding Wizard
- **Quick Start**: Essential setup in 3 minutes
- **Detailed Setup**: Comprehensive configuration with all features
- AI-guided industry and state-specific compliance generation
- Custom branding and color configuration
- System integrations setup

### 🤖 AI-Powered Features (Owner Controlled)
- **Employee Assistance**: Intelligent chatbot for employee questions
- **Document Generation**: AI-powered paperwork and agreement creation
- **Task Suggestions**: Smart recommendations based on context
- **Incident Analysis**: AI insights and recommendations
- **Compliance Automation**: Industry-specific requirement generation

### 📊 Advanced Reporting & Analytics
- Real-time dashboard with key metrics
- Revenue vs expenses tracking
- Occupancy trends and analytics
- Compliance status monitoring
- Export capabilities for external analysis

### 🔗 System Integrations
- **HR Systems**: BambooHR, ADP, Paychex, Gusto, Workday, Rippling
- **Payroll**: QuickBooks, ADP, Paychex, Gusto, Sage
- **Booking**: CampSpot, Reserve America, Newbook, Aspira, RMS Cloud
- **POS**: Square, Clover, Toast, Shopify, Lightspeed

### 🛡️ Compliance & Insurance
- Automated compliance requirement generation by industry/state
- Insurance coverage tracking and optimization
- Documentation for premium reductions (10-25% potential savings)
- Safety training and certification management
- Incident reporting and analysis

### 👥 Role-Based Access
- **Owner**: Full system control, AI management, advanced reporting
- **Manager**: Employee management, scheduling, financial tracking
- **Employee**: Handbook access, task completion, incident reporting
- **Volunteer**: Customizable onboarding with AI-generated agreements

## Deployment

### Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Firebase**
   ```bash
   firebase init hosting
   # Select your Firebase project
   # Set public directory to 'dist'
   # Configure as single-page app: Yes
   ```

3. **Build and Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

### Replit Deployment

1. Connect your GitHub repository to Replit
2. Configure environment variables in Replit Secrets
3. Use the "Deploy" button in Replit interface
4. Your app will be available at `your-repl-name.replit.app`

## Configuration

### Industry-Specific Setup

The AI system can automatically configure for various industries:
- **RV Parks & Campgrounds**: Reservation management, site maintenance
- **Hotels & Hospitality**: Guest services, housekeeping protocols
- **Restaurants**: Food safety, service standards
- **Healthcare**: HIPAA compliance, medical protocols
- **Construction**: Safety regulations, equipment management
- **Transportation/Trucking**: DOT compliance, vehicle maintenance
- **Oil & Gas**: Safety protocols, environmental regulations

### State-Specific Compliance

Automatic generation of compliance requirements based on your location:
- OSHA regulations by state
- Industry-specific certifications
- Safety training requirements
- Insurance considerations
- Local labor law compliance

### White-Label Customization

- **Branding**: Custom colors, logos, company information
- **Industry Templates**: Pre-configured SOPs and handbooks
- **Custom Features**: AI-powered additions for specific needs
- **Multi-tenant**: Support for multiple companies in one deployment

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### AI Endpoints (Owner Only)
- `GET /api/ai/status` - Check AI feature availability
- `POST /api/ai/generate-document` - Generate custom documents
- `POST /api/ai/generate-compliance` - Generate compliance requirements
- `POST /api/ai/task-suggestions` - Get smart task recommendations
- `POST /api/ai/analyze-incident` - Analyze incidents with AI

### Onboarding
- `POST /api/onboarding/complete` - Complete setup process

### Reporting
- `GET /api/stats` - Get dashboard statistics
- `POST /api/reports/export` - Export comprehensive reports
- `GET /api/integrations` - List API connections

## Support & Customization

### Getting Help
1. Check the in-app AI assistant for immediate help
2. Review compliance documentation generated during setup
3. Use the advanced reporting system for operational insights

### Custom Development
The system is designed for easy white-label customization:
- Fork the repository for your specific industry
- Use AI features to generate custom documentation
- Modify branding and workflows through the onboarding wizard
- Add industry-specific integrations as needed

### Insurance Benefits
Proper implementation can qualify your business for insurance premium reductions:
- Comprehensive safety training documentation
- Incident tracking and analysis
- Employee certification management
- Compliance audit trails

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

For white-label implementations, consider contributing generic improvements back to the main repository while keeping industry-specific customizations in your fork.