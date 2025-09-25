# Complete Next.js Frontend Requirements for Enlive Platform

## 🎯 Project Overview

**Project Name**: Enlive Frontend  
**Framework**: Next.js 14+ with App Router  
**Backend API**: http://localhost:8000  
**Type**: E-commerce + Salon Management Platform  

## 📋 Core Features & Pages

### 1. Authentication System
- **Login Page** (`/login`)
- **Register Page** (`/register`) 
- **Forgot Password** (`/forgot-password`)
- **Reset Password** (`/reset-password`)
- **Profile Management** (`/profile`)

### 2. E-commerce Features
- **Home Page** (`/`)
- **Product Catalog** (`/products`)
- **Product Details** (`/products/[id]`)
- **Shopping Cart** (`/cart`)
- **Checkout** (`/checkout`)
- **Order History** (`/orders`)
- **Order Details** (`/orders/[id]`)

### 3. Salon Services
- **Serervices Page** (`/services`)
- **Service Details** (`/svices/[id]`)
- **Stylists Page** (`/stylists`)
- **Stylist Profile** (`/stylists/[id]`)
- **Book Appointment** (`/appointments/book`)
- **My Appointments** (`/appointments`)
- **Appointment Details** (`/appointments/[id]`)

### 4. Gallery & Portfolio
- **Gallery Page** (`/gallery`)
- **Gallery Categories** (`/gallery/[category]`)

### 5. Membership & Packages
- **Membership Packages** (`/packages`)
- **My Memberships** (`/memberships`)

### 6. Reviews & Ratings
- **Product/Service Reviews** (integrated in detail pages)
- **My Reviews** (`/reviews`)

### 7. Admin Dashboard
- **Admin Dashboard** (`/admin`)
- **Product Management** (`/admin/products`)
- **Service Management** (`/admin/services`)
- **Stylist Management** (`/admin/stylists`)
- **Order Management** (`/admin/orders`)
- **Appointment Management** (`/admin/appointments`)
- **User Management** (`/admin/users`)
- **Gallery Management** (`/admin/gallery`)

## 🏗️ Technical Architecture

### Core Technologies
```json
{
  "framework": "Next.js 14+",
  "typescript": "TypeScript",
  "styling": "Tailwind CSS + Shadcn/ui",
  "stateManagement": "Zustand + React Query",
  "forms": "React Hook Form + Zod",
  "authentication": "NextAuth.js",
  "payments": "Razorpay Integration",
  "fileUpload": "Cloudinary",
  "notifications": "React Hot Toast"
}
```

### Project Structure
```
src/
├── app/                          # App Router (Next.js 14+)
│   ├── (auth)/                   # Auth route group
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (dashboard)/              # Protected routes
│   │   ├── profile/
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── appointments/
│   │   └── reviews/
│   ├── (admin)/                  # Admin routes
│   │   ├── admin/
│   │   └── admin/
│   ├── products/
│   ├── services/
│   ├── stylists/
│   ├── gallery/
│   ├── packages/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # Reusable components
│   ├── ui/                       # Shadcn/ui components
│   ├── forms/                    # Form components
│   ├── layout/                   # Layout components
│   ├── product/                  # Product-specific components
│   ├── service/                  # Service-specific components
│   ├── appointment/              # Appointment components
│   └── admin/                    # Admin components
├── lib/                          # Utilities and configurations
│   ├── api/                      # API client and endpoints
│   ├── auth/                     # Authentication config
│   ├── utils/                    # Utility functions
│   ├── validations/              # Zod schemas
│   └── constants/                # App constants
├── hooks/                        # Custom React hooks
├── store/                        # Zustand stores
├── types/                        # TypeScript types
└── styles/                       # Additional styles
```

## 🎨 Design System & UI Requirements

### Design Principles
- **Modern & Clean**: Minimalist design with focus on usability
- **Mobile-First**: Responsive design for all screen sizes
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Fast loading and smooth animations

### Color Palette
```css
:root {
  --primary: #6366f1;        /* Indigo */
  --primary-dark: #4f46e5;
  --secondary: #ec4899;      /* Pink */
  --accent: #f59e0b;         /* Amber */
  --success: #10b981;        /* Emerald */
  --warning: #f59e0b;        /* Amber */
  --error: #ef4444;          /* Red */
  --background: #ffffff;
  --foreground: #0f172a;
  --muted: #f1f5f9;
  --border: #e2e8f0;
}
```

### Typography
- **Primary Font**: Inter (Google Fonts)
- **Headings**: 2.5rem, 2rem, 1.5rem, 1.25rem, 1rem
- **Body**: 1rem (16px)
- **Small**: 0.875rem (14px)

### Component Library (Shadcn/ui)
- Button, Input, Label, Textarea
- Card, Dialog, Sheet, Dropdown
- Table, Pagination, Badge
- Form, Select, Checkbox, Radio
- Toast, Alert, Skeleton
- Avatar, Progress, Tabs

## 🔧 Core Components Required

### 1. Layout Components
```typescript
// components/layout/
├── Header.tsx              # Main navigation
├── Footer.tsx              # Site footer
├── Sidebar.tsx             # Admin sidebar
├── MobileNav.tsx           # Mobile navigation
├── Breadcrumb.tsx          # Breadcrumb navigation
└── LoadingSpinner.tsx      # Loading states
```

### 2. Authentication Components
```typescript
// components/auth/
├── LoginForm.tsx           # Login form
├── RegisterForm.tsx        # Registration form
├── ForgotPasswordForm.tsx  # Password reset
├── AuthGuard.tsx          # Route protection
└── UserMenu.tsx           # User dropdown
```

### 3. Product Components
```typescript
// components/product/
├── ProductCard.tsx        # Product grid item
├── ProductGrid.tsx        # Product listing
├── ProductDetails.tsx    # Product detail view
├── ProductFilters.tsx    # Filter sidebar
├── ProductSearch.tsx     # Search functionality
├── ProductReviews.tsx    # Reviews section
└── ProductGallery.tsx    # Image gallery
```

### 4. Cart & Checkout Components
```typescript
// components/cart/
├── CartItem.tsx           # Cart item component
├── CartSummary.tsx        # Cart totals
├── CartDrawer.tsx         # Mobile cart drawer
├── CheckoutForm.tsx       # Checkout form
├── PaymentForm.tsx        # Payment integration
└── OrderSummary.tsx       # Order confirmation
```

### 5. Service & Appointment Components
```typescript
// components/service/
├── ServiceCard.tsx        # Service grid item
├── ServiceDetails.tsx     # Service detail view
├── StylistCard.tsx        # Stylist profile card
├── AppointmentForm.tsx    # Booking form
├── TimeSlotPicker.tsx     # Time selection
├── AppointmentCard.tsx    # Appointment item
└── CalendarView.tsx       # Calendar interface
```

### 6. Admin Components
```typescript
// components/admin/
├── Dashboard.tsx          # Admin dashboard
├── DataTable.tsx          # Reusable data table
├── ProductForm.tsx        # Product CRUD
├── ServiceForm.tsx        # Service CRUD
├── StylistForm.tsx        # Stylist CRUD
├── OrderManagement.tsx    # Order management
└── UserManagement.tsx     # User management
```

## 🔌 API Integration Requirements

### API Client Setup
```typescript
// lib/api/client.ts
class ApiClient {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Implementation with error handling, auth headers, etc.
  }
}
```

### API Endpoints Integration
```typescript
// lib/api/
├── auth.ts              # Authentication endpoints
├── products.ts          # Product endpoints
├── services.ts          # Service endpoints
├── cart.ts              # Cart endpoints
├── orders.ts            # Order endpoints
├── appointments.ts      # Appointment endpoints
├── reviews.ts           # Review endpoints
├── profile.ts           # Profile endpoints
└── admin.ts             # Admin endpoints
```

### React Query Integration
```typescript
// hooks/api/
├── useProducts.ts       # Product queries
├── useCart.ts           # Cart management
├── useAppointments.ts   # Appointment queries
├── useOrders.ts         # Order queries
└── useAuth.ts           # Authentication hooks
```

## 🗃️ State Management

### Zustand Stores
```typescript
// store/
├── authStore.ts         # Authentication state
├── cartStore.ts         # Shopping cart state
├── uiStore.ts           # UI state (modals, loading)
├── productStore.ts      # Product filters/state
└── appointmentStore.ts  # Appointment booking state
```

### Store Structure
```typescript
// Example: cartStore.ts
interface CartStore {
  items: CartItem[];
  total: number;
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}
```

## 📱 Responsive Design Requirements

### Breakpoints
```css
/* Mobile First Approach */
sm: 640px    /* Small tablets */
md: 768px    /* Tablets */
lg: 1024px   /* Laptops */
xl: 1280px   /* Desktops */
2xl: 1536px  /* Large desktops */
```

### Mobile Optimizations
- Touch-friendly buttons (min 44px)
- Swipe gestures for image galleries
- Bottom navigation for mobile
- Optimized images (WebP format)
- Lazy loading for performance

## 🔐 Authentication & Security

### NextAuth.js Configuration
```typescript
// lib/auth/config.ts
export const authConfig = {
  providers: [
    CredentialsProvider({
      // Custom JWT authentication
    })
  ],
  pages: {
    signIn: '/login',
    signUp: '/register',
  },
  callbacks: {
    jwt: ({ token, user }) => {
      // JWT token handling
    },
    session: ({ session, token }) => {
      // Session management
    }
  }
}
```

### Route Protection
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Route protection logic
}
```

## 💳 Payment Integration

### Razorpay Integration
```typescript
// components/payment/RazorpayButton.tsx
interface PaymentProps {
  amount: number;
  orderId: string;
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
}
```

### Payment Flow
1. Create order on backend
2. Initialize Razorpay payment
3. Handle payment success/failure
4. Update order status
5. Send confirmation

## 📊 Performance Requirements

### Core Web Vitals
- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)

### Optimization Strategies
- Image optimization with Next.js Image
- Code splitting and lazy loading
- API response caching
- Bundle size optimization
- CDN for static assets

## 🧪 Testing Requirements

### Testing Stack
```json
{
  "testing": {
    "framework": "Jest + React Testing Library",
    "e2e": "Playwright",
    "coverage": "> 80%",
    "types": ["unit", "integration", "e2e"]
  }
}
```

### Test Coverage
- Component unit tests
- API integration tests
- User flow tests
- Accessibility tests
- Performance tests

## 🚀 Deployment Requirements

### Build Configuration
```json
{
  "build": {
    "output": "standalone",
    "optimization": true,
    "compression": true,
    "minification": true
  }
}
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_RAZORPAY_KEY=your_razorpay_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
```

### Deployment Platforms
- **Development**: Local development server
- **Staging**: Vercel Preview
- **Production**: Vercel or AWS

## 📦 Package Dependencies

### Core Dependencies
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0"
  }
}
```

### UI & Styling
```json
{
  "dependencies": {
    "tailwindcss": "^3.3.0",
    "@tailwindcss/forms": "^0.5.0",
    "@tailwindcss/typography": "^0.5.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "^0.290.0"
  }
}
```

### State Management & API
```json
{
  "dependencies": {
    "zustand": "^4.4.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.47.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0"
  }
}
```

### Authentication & Payments
```json
{
  "dependencies": {
    "next-auth": "^4.24.0",
    "razorpay": "^2.9.0",
    "jwt-decode": "^3.1.2"
  }
}
```

### Utilities
```json
{
  "dependencies": {
    "date-fns": "^2.30.0",
    "react-hot-toast": "^2.4.0",
    "framer-motion": "^10.16.0",
    "react-intersection-observer": "^9.5.0"
  }
}
```

### Development Dependencies
```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^6.1.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "@playwright/test": "^1.40.0",
    "eslint": "^8.53.0",
    "eslint-config-next": "^14.0.0",
    "prettier": "^3.0.0"
  }
}
```

## 📋 Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Project setup and configuration
- [ ] Authentication system
- [ ] Basic layout and navigation
- [ ] API client setup

### Phase 2: Core Features (Week 3-4)
- [ ] Product catalog and details
- [ ] Shopping cart functionality
- [ ] User profile management
- [ ] Basic admin panel

### Phase 3: Advanced Features (Week 5-6)
- [ ] Service booking system
- [ ] Appointment management
- [ ] Payment integration
- [ ] Review system

### Phase 4: Polish & Deploy (Week 7-8)
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Testing and bug fixes
- [ ] Deployment setup

## 🎯 Success Metrics

### Performance Metrics
- Page load time < 3 seconds
- Time to interactive < 5 seconds
- Lighthouse score > 90
- Bundle size < 500KB

### User Experience
- Mobile responsiveness
- Accessibility compliance
- Cross-browser compatibility
- Error handling and recovery

### Business Metrics
- Conversion rate optimization
- User engagement tracking
- Admin efficiency improvements
- Revenue tracking integration

## 🔧 Development Guidelines

### Code Standards
- TypeScript strict mode
- ESLint + Prettier configuration
- Component composition over inheritance
- Custom hooks for logic reuse
- Error boundaries for error handling

### Git Workflow
- Feature branches
- Pull request reviews
- Automated testing
- Semantic versioning

### Documentation
- Component documentation
- API integration guides
- Deployment instructions
- User manuals

---

**Total Estimated Development Time**: 8 weeks  
**Team Size**: 2-3 developers  
**Budget Considerations**: Development, hosting, third-party services  

This comprehensive requirements document provides everything needed to build a complete Next.js frontend for your Enlive platform. The backend API is already operational and ready for integration.
