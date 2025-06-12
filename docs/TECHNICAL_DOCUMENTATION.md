# ⚙️ VCS Bonus CRM - Technical Documentation

This document provides technical details for developers and system maintainers working on the Vilnius Coding School Bonus CRM system.

## 🏗️ System Architecture

### Technology Stack

**Frontend**
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** Lucide React icons, Radix UI primitives
- **State Management:** React Context + useState/useReducer
- **Routing:** React Router DOM
- **Deployment:** Vercel

**Backend**
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth
- **API:** Supabase REST API + Row Level Security
- **Edge Functions:** Supabase Edge Functions (Deno)
- **Email Service:** EmailJS

**Infrastructure**
- **Hosting:** Vercel (Frontend)
- **Database Hosting:** Supabase Cloud
- **CDN:** Vercel Edge Network
- **SSL:** Automatic via Vercel

### Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── admin/          # Admin-specific components
│   │   └── auth/           # Authentication components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── pages/              # Page components
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Helper utilities
├── supabase/
│   ├── functions/          # Edge Functions
│   └── migrations/         # Database migrations
└── docs/                   # Documentation
```

## 🗄️ Database Schema

### Core Tables

**auth.users** (Supabase managed)
- `id` (UUID, Primary Key)
- `email` (Text, Unique)
- `created_at` (Timestamp)
- `email_confirmed_at` (Timestamp)

**public.profiles**
```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**public.bonus_entries**
```sql
CREATE TABLE public.bonus_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_name TEXT NOT NULL,
    course_price DECIMAL(10,2) NOT NULL,
    points INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**public.prizes**
```sql
CREATE TABLE public.prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    points_required INTEGER NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**public.prize_redemptions**
```sql
CREATE TABLE public.prize_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    prize_id UUID NOT NULL REFERENCES public.prizes(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**public.registration_links**
```sql
CREATE TABLE public.registration_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**public.user_invitations**
```sql
CREATE TABLE public.user_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    registration_link_id UUID REFERENCES public.registration_links(id),
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'registered')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**public.rate_limits**
```sql
CREATE TABLE public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL,
    action_type TEXT NOT NULL,
    count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Database Functions

**handle_new_user()**
- Triggered on auth.users INSERT
- Creates corresponding profile record
- Processes registration links with points

**auto_confirm_user()**
- Triggered on auth.users INSERT
- Automatically confirms user email (bypasses email verification)

**process_registration_link_on_signup()**
- Called during user registration
- Validates and processes registration tokens
- Awards bonus points if applicable

**validate_registration_link()**
- Validates registration token existence and status
- Returns link details including points value

## 🔌 API Integration

### Supabase Client Configuration

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseAnonKey = 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Authentication Flow

**Registration with Token**
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name,
      phone,
      registration_token: token
    }
  }
})
```

**Login**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})
```

### Data Operations

**Fetching User Points**
```typescript
const { data: bonusEntries } = await supabase
  .from('bonus_entries')
  .select('points')
  .eq('user_id', userId)

const totalPoints = bonusEntries?.reduce((sum, entry) => sum + entry.points, 0) || 0
```

**Creating Prize Redemption**
```typescript
const { data, error } = await supabase
  .from('prize_redemptions')
  .insert([{
    user_id: userId,
    prize_id: prizeId,
    status: 'pending'
  }])
```

## 🔧 Edge Functions

### send-invitation-email-emailjs

**Purpose:** Sends invitation emails using EmailJS service

**Endpoint:** `/functions/v1/send-invitation-email-emailjs`

**Parameters:**
```typescript
{
  full_name: string
  email: string
  registration_url: string
}
```

**Implementation:**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const { full_name, email, registration_url } = await req.json()
  
  // EmailJS integration logic
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: 'your-service-id',
      template_id: 'your-template-id',
      user_id: 'your-user-id',
      template_params: { full_name, email, registration_url }
    })
  })

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### send-prize-notification-emailjs

**Purpose:** Sends prize redemption status notifications

**Endpoint:** `/functions/v1/send-prize-notification-emailjs`

**Parameters:**
```typescript
{
  user_email: string
  user_name: string
  prize_name: string
  status: 'approved' | 'rejected'
  rejection_reason?: string
}
```

### delete-user

**Purpose:** Securely deletes user accounts and associated data

**Endpoint:** `/functions/v1/delete-user`

**Security:** Requires admin authentication

## 🔐 Row Level Security (RLS)

### Profiles Table Policies

```sql
-- Users can view all profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Allow profile creation during signup
CREATE POLICY "Enable profile creation during signup" ON public.profiles
FOR INSERT WITH CHECK (true);
```

### Bonus Entries Policies

```sql
-- Users can view their own bonus entries
CREATE POLICY "Users can view own bonus entries" ON public.bonus_entries
FOR SELECT USING (auth.uid() = user_id);

-- Admins can insert bonus entries
CREATE POLICY "Admins can insert bonus entries" ON public.bonus_entries
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

## 🚀 Deployment

### Vercel Configuration

**vercel.json**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install"
}
```

### Environment Variables

**Required Variables:**
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Supabase Configuration

**Database URL:** Configure in Supabase dashboard
**Edge Functions:** Deploy via Supabase CLI
```bash
supabase functions deploy send-invitation-email-emailjs
supabase functions deploy send-prize-notification-emailjs
supabase functions deploy delete-user
```

## 🧪 Testing

### Running Tests

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Manual Testing Procedures

**Registration Flow**
1. Generate registration link in admin panel
2. Use link to register new user
3. Verify email delivery and point assignment
4. Confirm user can login

**Points System**
1. Award points to user via admin panel
2. Verify email notification sent
3. Check point balance updates in user dashboard
4. Test point calculations

**Prize Redemption**
1. Submit redemption request
2. Verify admin receives notification
3. Test approval/rejection flow
4. Confirm email notifications

## 🔍 Monitoring & Debugging

### Supabase Logs

**Authentication Logs**
- Monitor auth signup/login events
- Track failed authentication attempts
- Review security events

**Database Logs**
- SQL execution logs
- Performance metrics
- Error tracking

**Edge Function Logs**
- Function execution logs
- Error messages and stack traces
- Performance monitoring

### Frontend Error Tracking

**Console Logging**
```typescript
// Log errors with context
console.error('Prize redemption failed:', {
  userId,
  prizeId,
  error: error.message
})
```

**Error Boundaries**
```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to monitoring service
    console.error('React Error Boundary:', error, errorInfo)
  }
}
```

## 🔧 Maintenance

### Database Maintenance

**Regular Cleanup**
```sql
-- Clean old rate limit records
DELETE FROM public.rate_limits 
WHERE created_at < NOW() - INTERVAL '24 hours';

-- Archive old bonus entries (optional)
-- Backup and remove records older than 1 year
```

**Performance Optimization**
```sql
-- Add indexes for common queries
CREATE INDEX idx_bonus_entries_user_id ON public.bonus_entries(user_id);
CREATE INDEX idx_prize_redemptions_status ON public.prize_redemptions(status);
CREATE INDEX idx_profiles_role ON public.profiles(role);
```

### Code Quality

**TypeScript Configuration**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

**ESLint Rules**
- Enforce consistent code style
- Prevent common React pitfalls
- Maintain accessibility standards

## 📚 Development Guidelines

### Code Standards

**Component Structure**
```typescript
interface ComponentProps {
  // Define props with TypeScript
}

export const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Component logic
  return (
    <div className="tailwind-classes">
      {/* JSX content */}
    </div>
  )
}
```

**Error Handling**
```typescript
try {
  const result = await apiCall()
  // Handle success
} catch (error) {
  console.error('Operation failed:', error)
  // Show user-friendly error message
  setError('Something went wrong. Please try again.')
}
```

### Security Best Practices

**Input Validation**
- Validate all user inputs
- Sanitize data before database operations
- Use parameterized queries

**Authentication**
- Verify user sessions on protected routes
- Implement proper logout functionality
- Use secure session management

**Data Protection**
- Follow principle of least privilege
- Implement proper RLS policies
- Regular security audits

---

**Version:** 1.0  
**Last Updated:** December 2024  
**Repository:** Private  
**Contact:** Technical support for system maintenance 