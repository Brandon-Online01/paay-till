# 🚀 Orrbit POS - Mobile Point of Sale System

<p align="center">
  <a href="https://expo.dev" target="blank"><img src="https://expo.dev/icons/icon-512.png" width="120" alt="Expo Logo" /></a>
</p>

<p align="center">A modern, secure, and offline-capable Point of Sale system built with React Native, Expo, and SQLite for retail businesses.</p>

<p align="center">
  <a href="https://reactnative.dev/" target="_blank"><img src="https://img.shields.io/badge/React_Native-0.79.5-blue.svg" alt="React Native Version" /></a>
  <a href="https://expo.dev/" target="_blank"><img src="https://img.shields.io/badge/Expo-53-black.svg" alt="Expo Version" /></a>
  <a href="https://www.typescriptlang.org/" target="_blank"><img src="https://img.shields.io/badge/TypeScript-5.8.3-blue.svg" alt="TypeScript Version" /></a>
  <a href="https://www.sqlite.org/" target="_blank"><img src="https://img.shields.io/badge/SQLite-15.2.14-green.svg" alt="SQLite Version" /></a>
</p>

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Till System Overview](#-till-system-overview)
- [Current State](#-current-state)
- [Environment Configuration](#-environment-configuration)
- [Development](#-development)
- [Authentication & Security](#-authentication--security)
- [Database Management](#-database-management)
- [Collaboration Guidelines](#-collaboration-guidelines)
- [Deployment](#-deployment)

---

## ✨ Features

### 🏪 **Point of Sale**
- Intuitive touch-friendly interface for retail operations
- Real-time product search and filtering
- Shopping cart with quantity adjustments
- Multiple payment methods support
- Receipt generation and printing
- Offline-first operation with sync capabilities

### 📊 **Inventory Management**
- Product catalog management
- Stock level tracking
- Low stock alerts
- Barcode scanning support
- Product categories and variants
- Bulk product operations

### 📈 **Reporting & Analytics**
- Daily, weekly, monthly sales reports
- Transaction history and details
- Product performance analytics
- Revenue tracking and insights
- Export capabilities (PDF, CSV)
- Real-time dashboard metrics

### 🔐 **Authentication & Security**
- PIN-based authentication (4-8 digit support)
- Biometric authentication (fingerprint/face ID)
- Role-based access control
- Secure local data storage
- Session management
- Transaction void protection

### 🔧 **System Management**
- Device configuration and settings
- Database backup and restore
- Offline data synchronization
- Multi-device support
- Theme customization
- System health monitoring

---

## 🏗️ Architecture

### **Application Structure**

```
till/
├── 🔐 app/                           # Main Application Pages
│   ├── (auth)/                       # Authentication Flow
│   │   ├── sign-in/                  # PIN & Biometric Login
│   │   ├── sign-up/                  # Business Registration
│   │   ├── reset-password/           # Password Recovery
│   │   ├── new-password/             # Password Reset
│   │   └── verify-otp/               # OTP Verification
│   ├── (drawer)/                     # Main Application Drawer
│   │   ├── till/                     # POS Interface
│   │   ├── inventory/                # Product Management
│   │   ├── reports/                  # Sales Analytics
│   │   └── settings/                 # System Configuration
│   └── index.tsx                     # Landing Page
│
├── 🧩 components/                    # Reusable UI Components
│   ├── till/                         # POS-specific components
│   │   ├── product-card.tsx          # Product display
│   │   ├── cart-sidebar.tsx          # Shopping cart
│   │   ├── payment-modal.tsx         # Payment processing
│   │   └── receipt-generator.tsx     # Receipt creation
│   ├── inventory/                    # Inventory components
│   │   ├── product-detail-modal.tsx  # Product editing
│   │   ├── filter-modal.tsx          # Search filters
│   │   └── add-item-modal.tsx        # New product creation
│   └── reports/                      # Analytics components
│       ├── transaction-card.tsx      # Sale summaries
│       └── chart-components.tsx      # Data visualization
│
├── 🗄️ @db/                           # Database Layer
│   ├── database.ts                   # SQLite connection
│   ├── product.service.ts            # Product data operations
│   ├── transaction.service.ts        # Sales data operations
│   ├── migration-manager.ts          # Database versioning
│   └── migrations/                   # Schema updates
│
├── 🏪 store/                         # State Management (Zustand)
│   ├── auth.store.ts                 # Authentication state
│   ├── cart.store.ts                 # Shopping cart state
│   ├── inventory.store.ts            # Product state
│   ├── till.store.ts                 # POS operations state
│   └── ui.store.ts                   # UI/UX state
│
├── 🔧 utils/                         # Utility Functions
│   ├── biometrics.util.ts            # Biometric authentication
│   ├── bluetooth.util.ts             # Bluetooth connectivity
│   ├── print.util.ts                 # Receipt printing
│   └── device.util.ts                # Device information
│
└── 📱 types/                         # TypeScript Definitions
    ├── auth.types.ts                 # Authentication interfaces
    ├── inventory.types.ts            # Product interfaces
    └── transaction.types.ts          # Sales interfaces
```

### **Data Flow Architecture**

#### **🏪 Point of Sale Flow**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Product Grid  │ -> │   Cart Sidebar   │ -> │   Payment Flow  │
├─────────────────┤    ├──────────────────┤    ├─────────────────┤
│ • Search/Filter │    │ • Item Management│    │ • Payment Method│
│ • Category Nav  │    │ • Quantity Adjust│    │ • Amount Calc   │
│ • Product Cards │    │ • Price Calc     │    │ • Receipt Gen   │
│ • Quick Actions │    │ • Discount Apply │    │ • Transaction   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

#### **📊 Inventory Management Flow**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Product List   │ -> │  Product Detail  │ -> │   Stock Update  │
├─────────────────┤    ├──────────────────┤    ├─────────────────┤
│ • Filter/Search │    │ • Edit Properties│    │ • Quantity Adj  │
│ • Bulk Actions  │    │ • Price Updates  │    │ • Stock Alerts  │
│ • Stock Status  │    │ • Image Mgmt     │    │ • Audit Trail   │
│ • Category Mgmt │    │ • Variant Opts   │    │ • Sync Status   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 🛠️ Tech Stack

### **Frontend & Mobile**
- **React Native** 0.79.5 - Cross-platform mobile development
- **Expo** 53+ - Development platform and toolchain
- **TypeScript** 5.8.3+ - Type-safe JavaScript development
- **React Navigation** 7+ - Navigation and routing
- **NativeWind** 4+ - Tailwind CSS for React Native styling
- **React Native Reanimated** 3+ - High-performance animations

### **State Management**
- **Zustand** 5+ - Lightweight state management
- **React Query** 5+ - Server state synchronization
- **React Context** - Component-level state sharing

### **Database & Storage**
- **SQLite** (expo-sqlite) - Local database storage
- **Better SQLite3** 12+ - High-performance SQLite driver
- **AsyncStorage** - Key-value storage for app settings

### **Authentication & Security**
- **Expo Local Authentication** - Biometric authentication
- **Expo Crypto** - Cryptographic operations
- **Custom PIN System** - Secure PIN-based authentication
- **JWT Tokens** - Session management

### **Device & Hardware**
- **Expo Print** - Receipt printing capabilities
- **Expo Camera** - Barcode scanning
- **Expo Location** - Location services
- **Expo Device** - Device information access
- **Expo Battery** - Power management

### **Development Tools**
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **Tailwind CSS** - Utility-first styling
- **Expo Dev Tools** - Development and debugging

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ 
- Yarn package manager
- Expo CLI or Expo Dev Tools
- iOS Simulator or Android Emulator (or physical device)

### **Installation**

    ```bash
# Clone the repository
git clone https://github.com/your-org/orrbit-pos.git
cd till

# Install dependencies using yarn (as specified in memory)
yarn install

# Start the development server
yarn start

# Platform-specific commands
yarn ios      # Run on iOS simulator
yarn android  # Run on Android emulator
yarn web      # Run in web browser
```

### **Database Setup**

The application uses SQLite for local data storage with automatic initialization:

    ```bash
# Database files are created automatically on first run
# Located at: till/inventory.db

# Migration system handles schema updates automatically
# See: @db/migrations/ for version history
```

---

## 🏪 Till System Overview

### **Core POS Functionality**

The till system is designed as an offline-first Point of Sale solution that operates independently of internet connectivity while providing sync capabilities when online.

#### **Key Components:**

1. **Product Grid Interface**
   - Touch-optimized product browsing
   - Real-time search and filtering
   - Category-based navigation
   - Stock status indicators

2. **Shopping Cart Management**
   - Side-panel cart interface
   - Quantity adjustments with haptic feedback
   - Price calculations with tax handling
   - Discount application system

3. **Payment Processing**
   - Multiple payment method support
   - Cash, card, and digital payment options
   - Change calculation and display
   - Receipt generation and printing

4. **Transaction Management**
   - Complete transaction history
   - Void/refund capabilities (with authorization)
   - Transaction search and filtering
   - Audit trail maintenance

### **Offline-First Design**

- **Local SQLite Database**: All data stored locally for instant access
- **Background Sync**: Automatic synchronization when connectivity available
- **Conflict Resolution**: Smart merging of offline and online data
- **Backup System**: Automated local backups with cloud storage options

---

## 🚧 Current State

### **✅ Completed Features**

- **Authentication System**
  - PIN-based login (4-8 digits)
  - Biometric authentication (fingerprint/face ID)
  - Role-based access control
  - Session management with Zustand state

- **Database Infrastructure**
  - SQLite setup with migration system
  - Product service for inventory operations
  - Transaction service for sales data
  - Automated backup and restore

- **UI/UX Framework**
  - Responsive design with NativeWind
  - Smooth animations with Reanimated
  - Touch-optimized interfaces
  - Dark/light theme support

- **Basic POS Interface**
  - Product grid with search functionality
  - Shopping cart with quantity management
  - Payment flow mockups
  - Receipt generation framework

### **🔄 In Progress**

- **Advanced Payment Processing**
  - Integration with payment gateways
  - Cash drawer connectivity
  - Receipt printer integration
  - Tax calculation enhancements

- **Inventory Management**
  - Bulk product import/export
  - Low stock alert system
  - Product variant management
  - Supplier management integration

- **Reporting & Analytics**
  - Advanced sales reporting
  - Inventory turnover analysis
  - Profit margin calculations
  - Export functionality (PDF/CSV)

### **📋 Planned Features**

- **Multi-Device Sync**
  - Real-time data synchronization
  - Conflict resolution algorithms
  - Device authentication system
  - Centralized user management

- **Advanced Security**
  - End-to-end encryption
  - Audit logging system
  - Role-based permissions
  - Compliance reporting

- **Hardware Integration**
  - Barcode scanner support
  - Cash drawer integration
  - Customer display screens
  - Kitchen printer connectivity

---

## ⚙️ Environment Configuration

Create a `.env` file in the project root:

```bash
# Application Configuration
APP_NAME=Orrbit POS
APP_VERSION=0.0.1
NODE_ENV=development

# Database Configuration
DB_NAME=inventory.db
DB_VERSION=1
ENABLE_DB_LOGGING=true

# Authentication Settings
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_TIMEOUT=3600000
BIOMETRIC_ENABLED=true

# POS Configuration
DEFAULT_CURRENCY=ZAR
TAX_RATE=15.0
RECEIPT_FOOTER="Thank you for your business!"

# Device Settings
ENABLE_HAPTICS=true
ENABLE_SOUNDS=true
AUTO_BACKUP=true
BACKUP_INTERVAL=86400000

# Development Settings (DEV only)
ENABLE_DEBUGGING=true
LOG_LEVEL=debug
MOCK_PAYMENTS=true
```

---

## 🔧 Development

### **Available Scripts**

```bash
# Development
yarn start              # Start Expo development server
yarn ios                # Run on iOS simulator
yarn android            # Run on Android emulator
yarn web                # Run in web browser

# Code Quality
yarn lint               # Run ESLint
yarn format             # Format code with Prettier
yarn type-check         # TypeScript type checking

# Database
yarn db:migrate         # Run database migrations
yarn db:seed            # Seed database with sample data
yarn db:reset           # Reset database to initial state

# Build & Deploy
yarn build:ios          # Build iOS application
yarn build:android      # Build Android application
yarn build:web          # Build web application
```

### **Development Workflow**

1. **Feature Development**
   ```bash
   # Create feature branch
   git checkout -b feature/new-feature-name
   
   # Start development server
   yarn start
   
   # Make changes and test
   yarn lint && yarn type-check
   ```

2. **Database Changes**
   ```bash
   # Create new migration
   yarn db:create-migration migration-name
   
   # Apply migrations
   yarn db:migrate
   ```

3. **Testing**
   ```bash
   # Run unit tests
   yarn test
   
   # Run integration tests
   yarn test:integration
   
   # Generate coverage report
   yarn test:coverage
   ```

---

## 🔐 Authentication & Security

### **Authentication Methods**

1. **PIN Authentication**
   - 4-8 digit PIN support
   - Configurable PIN complexity
   - Failed attempt lockout
   - PIN change functionality

2. **Biometric Authentication**
   - Fingerprint recognition
   - Face ID support (iOS)
   - Fallback to PIN if biometric fails
   - Device-specific enrollment

### **Security Features**

- **Data Encryption**: All sensitive data encrypted at rest
- **Session Management**: JWT-based session tokens
- **Role-Based Access**: Granular permission system
- **Audit Logging**: Complete transaction audit trail
- **Secure Storage**: Encrypted local storage for credentials

---

## 🗄️ Database Management

### **Database Schema**

The application uses SQLite with the following core tables:

```sql
-- Users and Authentication
users (id, email, name, role, pin_hash, created_at)
sessions (id, user_id, token, expires_at)

-- Product Management
products (id, name, price, cost, stock, category_id, barcode)
categories (id, name, description, sort_order)
product_variants (id, product_id, name, price_modifier)

-- Transaction Management
transactions (id, user_id, total, payment_method, created_at)
transaction_items (id, transaction_id, product_id, quantity, price)
payments (id, transaction_id, method, amount, reference)

-- System Management
settings (key, value, type)
audit_logs (id, user_id, action, entity_type, entity_id, timestamp)
```

### **Migration System**

- **Automatic Migrations**: Database schema updates applied automatically
- **Version Control**: Schema versioning with rollback capabilities
- **Data Preservation**: Safe migrations that preserve existing data
- **Backup Integration**: Automatic backups before schema changes

---

## 🤝 Collaboration Guidelines

### **Getting Started**

1. **Repository Setup**
   ```bash
   # Clone the repository
   git clone https://github.com/your-org/orrbit-pos.git
   cd till
   
   # Install dependencies
   yarn install
   
   # Set up development environment
   cp .env.example .env
   ```

2. **Development Environment**
   - Use **yarn** for package management (specified in memory)
   - Follow TypeScript best practices
   - Use ESLint and Prettier for code consistency
   - Test on both iOS and Android platforms

### **Code Standards**

- **TypeScript**: All code must be TypeScript with proper type definitions
- **Component Structure**: Use functional components with hooks
- **State Management**: Use Zustand for global state, local state for component-specific data
- **Styling**: Use NativeWind (Tailwind CSS) for consistent styling
- **File Naming**: Use kebab-case for files, PascalCase for components

### **Git Workflow**

1. **Branch Naming**
   - Features: `feature/feature-name`
   - Bug fixes: `fix/bug-description`
   - Hotfixes: `hotfix/issue-description`

2. **Commit Messages**
   ```
   type(scope): description
   
   Examples:
   feat(auth): add biometric authentication
   fix(cart): resolve quantity calculation bug
   docs(readme): update installation instructions
   ```

3. **Pull Request Process**
   - Create PR with descriptive title and description
   - Ensure all tests pass and code is linted
   - Request review from team members
   - Update documentation if needed

### **Testing Requirements**

- **Unit Tests**: All business logic must have unit tests
- **Integration Tests**: Core user flows must have integration tests
- **Manual Testing**: Test on multiple devices and screen sizes
- **Performance Testing**: Ensure smooth operation on lower-end devices

### **Documentation Standards**

- **Code Comments**: Document complex business logic
- **API Documentation**: Document all service methods
- **Component Props**: Document all component interfaces
- **README Updates**: Keep documentation current with features

### **Areas for Collaboration**

#### **High Priority**
1. **Payment Integration**: Implement actual payment processing
2. **Hardware Integration**: Add printer and scanner support
3. **Sync System**: Build robust offline/online synchronization
4. **Advanced Reporting**: Create comprehensive analytics

#### **Medium Priority**
1. **Multi-tenant Support**: Support multiple businesses
2. **Advanced Inventory**: Supplier management and purchase orders
3. **Customer Management**: Customer accounts and loyalty programs
4. **API Integration**: Connect with external business systems

#### **Future Enhancements**
1. **Web Dashboard**: Administrative web interface
2. **Mobile App**: Customer-facing mobile application
3. **AI Features**: Sales forecasting and inventory optimization
4. **Multi-language**: Internationalization support

---

## 🚀 Deployment

### **Development Deployment**

```bash
# Create development build
yarn build:dev

# Test on physical devices
yarn build:preview
```

### **Production Deployment**

```bash
# Build for production
yarn build:ios          # iOS App Store build
yarn build:android      # Google Play Store build

# Submit to app stores
yarn deploy:ios         # Submit to App Store
yarn deploy:android     # Submit to Play Store
```

### **Environment-Specific Configurations**

- **Development**: Local database, mock payments, debug logging
- **Staging**: Production-like environment for testing
- **Production**: Live payments, analytics, error reporting

---

## 📚 Additional Resources

- **React Native Documentation**: [https://reactnative.dev/docs/getting-started](https://reactnative.dev/docs/getting-started)
- **Expo Documentation**: [https://docs.expo.dev/](https://docs.expo.dev/)
- **Zustand Documentation**: [https://zustand-demo.pmnd.rs/](https://zustand-demo.pmnd.rs/)
- **SQLite Documentation**: [https://www.sqlite.org/docs.html](https://www.sqlite.org/docs.html)
- **TypeScript Handbook**: [https://www.typescriptlang.org/docs/](https://www.typescriptlang.org/docs/)

---

## 📞 Support & Contact

- **Project Repository**: [GitHub Repository](https://github.com/your-org/orrbit-pos)
- **Issue Tracking**: [GitHub Issues](https://github.com/your-org/orrbit-pos/issues)
- **Development Team**: Brandon N Nkawu
- **Organization**: Orrbit Technologies
- **Website**: [https://pos.orrbit.co.za](https://orrbit.co.za)

---

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

**© 2025 Orrbit Technologies - All Rights Reserved**

---

**Built with ❤️ using React Native, Expo, and SQLite**