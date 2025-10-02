# CyberNeural IDS - Professional LAN Security Analyzer Dashboard

## 🚀 Overview
A comprehensive, industry-standard LAN security analyzer dashboard built with React, TypeScript, and Material-UI. This professional-grade application provides real-time network monitoring, threat detection, alert management, and detailed analytics for enterprise network security.

## ✨ Key Features

### 🎯 **Multi-Tab Dashboard Interface**
- **Overview Tab**: Real-time network statistics and key metrics
- **Devices Tab**: Complete network device inventory and monitoring
- **Threats Tab**: Advanced threat analysis with severity filtering
- **Alerts Tab**: Comprehensive alert management system
- **Analysis Tab**: CSV file analysis with ML-powered threat detection

### 📊 **Real-Time Monitoring**
- Live network bandwidth monitoring
- Device status tracking (Online/Offline/Suspicious)
- Active connection monitoring
- Threat count tracking with real-time updates
- Network uptime monitoring

### 🔍 **Advanced Threat Detection**
- Multi-level threat severity classification (Critical/High/Medium/Low)
- Real-time threat status tracking (Active/Mitigated/Investigating)
- Source and target IP tracking
- Detailed threat descriptions and timestamps
- Automated threat categorization

### 🚨 **Professional Alert System**
- Multi-category alert classification (Security/Performance/Network)
- Alert status management (New/Acknowledged/Resolved)
- Interactive alert actions and responses
- Priority-based alert filtering
- Comprehensive alert history

### 📈 **Interactive Data Visualization**
- Real-time bandwidth usage charts
- Threat analysis pie charts
- Device performance metrics
- Network topology visualization
- Historical trend analysis

### 🎨 **Modern UI/UX Design**
- Dark/Light theme toggle
- Responsive design for all screen sizes
- Professional color schemes and typography
- Smooth animations and transitions
- Industry-standard iconography

### 🔧 **Device Management**
- Complete device inventory (Routers/Switches/Computers/Servers/Mobile)
- Device type classification and icons
- IP address tracking
- Last seen timestamps
- Individual device threat monitoring

## 🛠️ Technical Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Material-UI v7** - Professional component library
- **MUI X Components** - Advanced data grid and charts
- **Vite** - Fast build tool and dev server

### Data Processing
- **Papa Parse** - CSV file processing
- **Python Flask Backend** - ML-powered analysis API
- **TensorFlow Models** - AI-based threat detection

### Styling & Design
- **Emotion** - CSS-in-JS styling
- **Inter Font** - Modern typography
- **Custom Material-UI Theme** - Professional design system
- **Responsive Grid System** - Mobile-first design

## 🚀 Getting Started

### Prerequisites
```bash
Node.js 18+ 
npm or yarn
Python 3.8+ (for backend ML models)
```

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd CyberNeural-IDS

# Install frontend dependencies
cd my-dashboard
npm install

# Start the development server
npm run dev
```

### Backend Setup
```bash
# Navigate to the main directory
cd ..

# Activate Python virtual environment
python -m venv venv
source venv/Scripts/activate  # Windows
source venv/bin/activate      # Linux/Mac

# Install Python dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py
```

## 📋 Feature Breakdown

### 1. Dashboard Overview
- **Network Statistics Cards**: Total devices, active connections, threats, bandwidth
- **Real-time Charts**: Bandwidth usage, threat analysis results
- **Recent Alerts**: Latest security notifications
- **System Status**: Network uptime and health indicators

### 2. Device Management
- **Device Grid**: Sortable and filterable device list
- **Device Types**: Router, Switch, Computer, Server, Mobile
- **Status Indicators**: Online (Green), Offline (Gray), Suspicious (Red)
- **Click-to-Detail**: Individual device information

### 3. Threat Analysis
- **Severity Filtering**: Filter by Critical/High/Medium/Low
- **Threat Types**: DDoS, Malware, Port Scan, Intrusion attempts
- **Status Tracking**: Active, Mitigated, Under Investigation
- **Source/Target Mapping**: IP address correlation

### 4. Alert Management
- **Interactive Actions**: Acknowledge and Resolve alerts
- **Multi-level Filtering**: By status and severity
- **Alert Categories**: Security, Performance, Network
- **Real-time Notifications**: Snackbar alerts for user actions

### 5. CSV Analysis Engine
- **File Upload**: Drag-and-drop CSV processing
- **Data Preview**: First 10 rows preview before analysis
- **ML Analysis**: TensorFlow-powered threat detection
- **Results Export**: Download analysis results as CSV
- **Visual Results**: Pie charts and data grids

## 🎨 Design Philosophy

### Professional UI Standards
- **Consistent Spacing**: 8px grid system
- **Color Harmony**: Semantic color usage for status indicators
- **Typography Hierarchy**: Clear information architecture
- **Interactive Feedback**: Hover states and loading indicators

### User Experience
- **Progressive Disclosure**: Information organized by complexity
- **Contextual Actions**: Relevant actions available when needed
- **Error Handling**: Comprehensive error messages and recovery
- **Performance**: Optimized rendering and data loading

## 🔧 Configuration Options

### Theme Customization
```typescript
const theme = createTheme({
  palette: {
    mode: 'dark', // or 'light'
    primary: { main: '#3b82f6' },
    secondary: { main: '#10b981' },
    // ... custom colors
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    // ... typography settings
  },
});
```

### Chart Configuration
- Customizable color schemes
- Responsive chart sizing
- Real-time data updates
- Export capabilities

## 📊 Data Models

### Network Device
```typescript
interface NetworkDevice {
  id: string;
  name: string;
  ip: string;
  type: 'router' | 'switch' | 'computer' | 'server' | 'mobile';
  status: 'online' | 'offline' | 'suspicious';
  lastSeen: string;
  threats: number;
  bandwidth: number;
}
```

### Threat Information
```typescript
interface Threat {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  target: string;
  timestamp: string;
  status: 'active' | 'mitigated' | 'investigating';
  description: string;
}
```

## 🚀 Performance Features

### Optimization Techniques
- **React.memo**: Component memoization for expensive renders
- **useMemo/useCallback**: Hook optimization for complex calculations
- **Virtual Scrolling**: Large dataset handling in data grids
- **Lazy Loading**: On-demand component loading
- **Debounced Search**: Optimized search functionality

### Real-time Updates
- **WebSocket Support**: Ready for real-time data streams
- **Polling Mechanism**: Configurable data refresh intervals
- **State Management**: Efficient React state handling
- **Caching Strategy**: Smart data caching for performance

## 🔐 Security Features

### Data Protection
- **Input Validation**: CSV file type and size validation
- **Error Boundaries**: Graceful error handling
- **XSS Prevention**: Sanitized data rendering
- **CSRF Protection**: Secure API communication

### Network Security
- **IP Validation**: Network address verification
- **Threat Classification**: AI-powered threat detection
- **Alert Prioritization**: Risk-based alert management
- **Audit Trail**: Action logging and history

## 📱 Responsive Design

### Breakpoint Strategy
- **Mobile First**: 320px+ baseline
- **Tablet**: 768px+ optimized layout
- **Desktop**: 1024px+ full feature set
- **Large Screens**: 1440px+ enhanced visuals

### Adaptive Features
- **Collapsible Sidebar**: Space-efficient navigation
- **Responsive Charts**: Auto-sizing visualizations
- **Touch-Friendly**: Mobile interaction optimized
- **Flexible Grids**: Content adaptation across devices

## 🎯 Future Enhancements

### Planned Features
- **Network Topology Visualization**: Interactive network maps
- **Historical Analytics**: Long-term trend analysis
- **Custom Dashboard**: User-configurable widgets
- **Email Notifications**: Alert email integration
- **API Documentation**: Swagger/OpenAPI integration
- **Multi-tenancy**: Enterprise user management

### Technical Improvements
- **WebSocket Integration**: Real-time data streaming
- **PWA Features**: Offline capability
- **Advanced Filtering**: Complex query builder
- **Export Options**: PDF reports, Excel exports
- **Internationalization**: Multi-language support

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details on:
- Code style and standards
- Pull request process
- Issue reporting
- Feature requests

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

---

**Built with ❤️ for enterprise network security**