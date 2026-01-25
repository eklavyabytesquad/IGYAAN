# iGyanAI Login System - Mobile (React Native) Replication Guide

## Overview
This document provides complete instructions for an AI agent to recreate the iGyanAI dual-portal login system in React Native. The system features a landing page with two distinct login portals: **Institutional Suite** (for schools/institutions) and **Professional Suite** (for individual learners/families).

---

## System Architecture

### 1. Login Flow Structure

```
Root Login Landing Page
├── Institutional Suite Portal (for institutional users)
│   └── Roles: super_admin, co_admin, student, faculty
└── Professional Suite Portal (for B2C users)
    └── Roles: b2c_student, b2c_mentor
```

### 2. Navigation Hierarchy

```
/login (Landing Page)
  ├── /login/institutional-suite (Institutional Login)
  └── /login/launch-pad (Professional Suite Login)
```

---

## Database Schema

### Table: `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(64) NOT NULL,  -- SHA-256 hash
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  image_base64 TEXT,  -- Profile image stored as base64
  role VARCHAR(50) NOT NULL,  -- super_admin, co_admin, student, faculty, b2c_student, b2c_mentor
  school_id UUID,  -- Foreign key to schools table (for institutional users)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `sessions`

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  refresh_token VARCHAR(255) UNIQUE NOT NULL,
  device_type VARCHAR(50),  -- mobile, tablet, desktop
  os_name VARCHAR(50),  -- iOS, Android, Windows, macOS, Linux
  browser_name VARCHAR(50),  -- Chrome, Safari, Firefox, Edge, etc.
  user_agent TEXT,
  ip_address VARCHAR(45),
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_activity_at TIMESTAMP DEFAULT NOW(),
  logout_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Component Structure

### 1. Login Landing Page Component

**Purpose**: Display two portal options with beautiful UI and route to respective login forms.

**Key Features**:
- Two option cards: Institutional Suite & Professional Suite
- Gradient backgrounds with blur effects
- Responsive design
- Clear role descriptions
- Navigation to specific login portals

**Data Structure**:

```javascript
const OPTIONS = [
  {
    href: "/login/institutional-suite",
    label: "Institutional Suite",
    badge: "Institutional Suite • Institutions",
    description: "School and network leaders sign in to manage Sudarshan Ai copilots, automate operations, and orchestrate campus-wide innovation."
  },
  {
    href: "/login/launch-pad",
    label: "Professional Suite",
    badge: "Professional Suite • Personal",
    description: "Students and families sign in to personalize copilots, access learning journeys, and track progress across devices."
  }
];
```

---

### 2. Login Form Component (Reusable)

**Purpose**: Reusable login form that adapts based on portal variant (institutional vs professional).

**Props**:
- `variant`: "institutionalSuite" | "professionalSuite"

**Variant Configuration**:

```javascript
const VARIANT_COPY = {
  institutionalSuite: {
    badge: "Institutional Suite • Institutions",
    title: "Welcome back, visionary school leaders",
    subtitle: "Access the unified control center for Sudarshan Ai copilots, compliance, and innovation programs tailored to your campus.",
    highlight: "Institutional Suite",
    accentRing: "from-sky-500/20 via-cyan-400/10 to-transparent",
    gradient: "from-white via-sky-50 to-white",
    helper: "Need to onboard new principals or connect additional campuses? Our strategy team can tailor governance, provisioning, and integrations for your network.",
    helperLink: { href: "/contact", label: "Talk to strategists" },
    signupHref: "/register",
    signupLabel: "Request workspace access",
    footerPrompt: "Need to invite your leadership team?"
  },
  professionalSuite: {
    badge: "Professional Suite • Learners & Families",
    title: "Log in to your Sudarshan learner copilots",
    subtitle: "Stay on top of daily learning plans, passion projects, and venture studio challenges curated for curious minds and ambitious families.",
    highlight: "Professional Suite",
    accentRing: "from-sky-400/30 via-blue-400/10 to-transparent",
    gradient: "from-white via-sky-50 to-white",
    helper: "Looking to join as a new learner, parent, or mentor? Request access in minutes and unlock guided roadmaps for the skills you want to master.",
    helperLink: { href: "/contact", label: "Request an invite" },
    signupHref: "/register",
    signupLabel: "Create your personal account",
    footerPrompt: "First time discovering Professional Suite?"
  }
};
```

**Form Fields**:
1. **Email** (type: email, required)
   - Placeholder: "you@school.com"
2. **Password** (type: password, required)
   - Placeholder: "••••••••"
   - Show/hide password toggle button

**UI Elements**:
- Logo component at top
- Portal badge
- Title & subtitle (variant-specific)
- Error message display
- Submit button with loading state
- Helper/info box with gradient background
- Sign-up link

---

## Authentication Logic

### Core Functions

#### 1. Password Hashing (SHA-256)

```javascript
async function hashPassword(password) {
  // Use crypto library to hash password with SHA-256
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
```

#### 2. Token Generation

```javascript
function generateToken() {
  // Generate unique session/refresh tokens
  return crypto.randomUUID() + "-" + Date.now() + "-" + Math.random().toString(36);
}
```

#### 3. Device Information Collection

```javascript
function getDeviceInfo() {
  // For React Native, use react-native-device-info package
  return {
    deviceType: "mobile" | "tablet",
    osName: "iOS" | "Android",
    browserName: "Mobile App",
    userAgent: "iGyanAI Mobile/1.0"
  };
}
```

#### 4. IP Address Retrieval

```javascript
async function getUserIP() {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return "0.0.0.0";
  }
}
```

---

### Login Function (with Role-Based Access Control)

```javascript
const login = async (email, password, loginVariant = null) => {
  try {
    // 1. Hash the password
    const passwordHash = await hashPassword(password);

    // 2. Query user from database
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password_hash", passwordHash)
      .single();

    if (userError || !userData) {
      throw new Error("Invalid email or password");
    }

    // 3. ROLE-BASED ACCESS CONTROL
    const INSTITUTIONAL_ROLES = ['super_admin', 'co_admin', 'student', 'faculty'];
    const LAUNCH_PAD_ROLES = ['b2c_student', 'b2c_mentor'];

    if (loginVariant === "institutionalSuite") {
      if (!INSTITUTIONAL_ROLES.includes(userData.role)) {
        throw new Error("Access denied. This portal is for institutional users (super_admin, co_admin, student, faculty) only. Please use the Professional Suite portal for B2C access.");
      }
    } else if (loginVariant === "professionalSuite") {
      if (!LAUNCH_PAD_ROLES.includes(userData.role)) {
        throw new Error("Access denied. This portal is for B2C users (b2c_student, b2c_mentor) only. Please use the Institutional Suite portal.");
      }
    }

    // 4. Collect device information
    const deviceInfo = getDeviceInfo();
    const ipAddress = await getUserIP();

    // 5. Generate session tokens
    const sessionToken = generateToken();
    const refreshToken = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // 6. Create session in database
    const { data: sessionData, error: sessionError } = await supabase
      .from("sessions")
      .insert([
        {
          user_id: userData.id,
          session_token: sessionToken,
          refresh_token: refreshToken,
          device_type: deviceInfo.deviceType,
          os_name: deviceInfo.osName,
          browser_name: deviceInfo.browserName,
          user_agent: deviceInfo.userAgent,
          ip_address: ipAddress,
          expires_at: expiresAt.toISOString(),
          is_active: true
        }
      ])
      .select()
      .single();

    if (sessionError) {
      throw sessionError;
    }

    // 7. Store session token locally
    await AsyncStorage.setItem("session_token", sessionToken);

    // 8. Update user state and navigate to dashboard
    setUser(userData);
    setSession(sessionData);
    navigation.navigate("Dashboard");

    return { success: true, data: userData };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: error.message };
  }
};
```

---

### Session Management

#### Check Session (Auto-login)

```javascript
const checkSession = async () => {
  try {
    const sessionToken = await AsyncStorage.getItem("session_token");
    if (!sessionToken) {
      setLoading(false);
      return;
    }

    // Verify session in database
    const { data: sessionData, error } = await supabase
      .from("sessions")
      .select("*, users(*)")
      .eq("session_token", sessionToken)
      .eq("is_active", true)
      .single();

    if (error || !sessionData) {
      await AsyncStorage.removeItem("session_token");
      setLoading(false);
      return;
    }

    // Check if session expired
    if (new Date(sessionData.expires_at) < new Date()) {
      await logout();
      return;
    }

    // Update last activity
    await supabase
      .from("sessions")
      .update({ last_activity_at: new Date().toISOString() })
      .eq("id", sessionData.id);

    setUser(sessionData.users);
    setSession(sessionData);
  } catch (error) {
    console.error("Session check error:", error);
  } finally {
    setLoading(false);
  }
};
```

#### Logout Function

```javascript
const logout = async () => {
  try {
    const sessionToken = await AsyncStorage.getItem("session_token");
    if (sessionToken) {
      // Mark session as inactive
      await supabase
        .from("sessions")
        .update({
          is_active: false,
          logout_at: new Date().toISOString()
        })
        .eq("session_token", sessionToken);
    }

    await AsyncStorage.removeItem("session_token");
    setUser(null);
    setSession(null);
    navigation.navigate("Login");
  } catch (error) {
    console.error("Logout error:", error);
  }
};
```

---

## React Native Implementation Guide

### Required Packages

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-native": "^0.72.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/stack": "^6.3.0",
    "@supabase/supabase-js": "^2.38.0",
    "@react-native-async-storage/async-storage": "^1.19.0",
    "react-native-device-info": "^10.11.0",
    "react-native-linear-gradient": "^2.8.0",
    "react-native-vector-icons": "^10.0.0"
  }
}
```

---

### File Structure

```
src/
├── screens/
│   ├── auth/
│   │   ├── LoginLandingScreen.js        // Main landing with two options
│   │   ├── InstitutionalLoginScreen.js  // Wrapper for institutional login
│   │   ├── ProfessionalLoginScreen.js   // Wrapper for professional login
│   │   └── LoginFormScreen.js           // Reusable login form
├── contexts/
│   └── AuthContext.js                   // Auth state & functions
├── components/
│   ├── Logo.js                          // Logo component
│   └── GradientBackground.js            // Reusable gradient container
├── utils/
│   ├── supabase.js                      // Supabase client
│   └── crypto.js                        // Hashing & token functions
└── navigation/
    └── AuthNavigator.js                 // Auth stack navigator
```

---

## Design Guidelines

### Color Palette

```javascript
const colors = {
  primary: {
    sky500: "#0ea5e9",
    sky400: "#38bdf8",
    sky600: "#0284c7",
    cyan400: "#22d3ee",
  },
  neutral: {
    zinc700: "#3f3f46",
    zinc500: "#71717a",
    zinc300: "#d4d4d8",
  },
  background: {
    white: "#ffffff",
    sky50: "#f0f9ff",
    slate900: "#0f172a",
    slate950: "#020617"
  },
  error: {
    red50: "#fef2f2",
    red600: "#dc2626",
    red300: "#fca5a5"
  }
};
```

### Typography

- **Title**: 24px, semibold
- **Subtitle**: 14px, regular, line-height: 20px
- **Badge**: 11px, semibold, uppercase, letter-spacing: 0.28em
- **Form labels**: 14px, semibold
- **Input text**: 14px, regular
- **Button text**: 14px, semibold
- **Helper text**: 12px, regular

### Spacing

- Container padding: 24px (horizontal), 80px (vertical)
- Card padding: 40px
- Form field spacing: 20px
- Section gaps: 32px

### Border Radius

- Containers: 24px
- Cards: 16px
- Input fields: 8px
- Buttons: 8px
- Badges: 9999px (fully rounded)

---

## Navigation Setup

```javascript
// AuthNavigator.js
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginLanding" component={LoginLandingScreen} />
      <Stack.Screen name="InstitutionalLogin" component={InstitutionalLoginScreen} />
      <Stack.Screen name="ProfessionalLogin" component={ProfessionalLoginScreen} />
    </Stack.Navigator>
  );
}
```

---

## Error Handling

### Error Messages

```javascript
const ERROR_MESSAGES = {
  invalidCredentials: "Invalid email or password",
  institutionalAccessDenied: "Access denied. This portal is for institutional users (super_admin, co_admin, student, faculty) only. Please use the Professional Suite portal for B2C access.",
  professionalAccessDenied: "Access denied. This portal is for B2C users (b2c_student, b2c_mentor) only. Please use the Institutional Suite portal.",
  sessionExpired: "Your session has expired. Please log in again.",
  networkError: "Unable to connect. Please check your internet connection.",
};
```

### Error Display Component

```jsx
{error && (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>{error}</Text>
  </View>
)}
```

---

## Security Best Practices

1. **Password Hashing**: Always use SHA-256 hashing before sending passwords
2. **Session Tokens**: Use cryptographically secure random tokens
3. **Token Storage**: Store session tokens in AsyncStorage (secure storage recommended for production)
4. **Session Expiry**: Implement 7-day session expiration with refresh tokens
5. **Role Validation**: Always validate user roles server-side AND client-side
6. **HTTPS Only**: Ensure all API calls use HTTPS
7. **Device Tracking**: Log device info for security auditing

---

## Testing Checklist

### Functional Testing

- [ ] Landing page displays both portal options correctly
- [ ] Institutional Suite login accepts only institutional roles
- [ ] Professional Suite login accepts only B2C roles
- [ ] Error messages display for wrong portal access
- [ ] Password show/hide toggle works
- [ ] Form validation works (required fields)
- [ ] Loading states display during login
- [ ] Successful login navigates to dashboard
- [ ] Session persists across app restarts
- [ ] Session expires after 7 days
- [ ] Logout clears session and navigates to login
- [ ] Activity tracking updates last_activity_at

### UI/UX Testing

- [ ] Gradient backgrounds render correctly
- [ ] Blur effects work on all devices
- [ ] Typography is readable and properly sized
- [ ] Buttons have proper touch targets (min 44px)
- [ ] Forms are keyboard-friendly
- [ ] Error states are visually distinct
- [ ] Loading indicators are visible
- [ ] Logo displays correctly
- [ ] Layout is responsive on different screen sizes

### Security Testing

- [ ] Passwords are never logged
- [ ] Session tokens are securely stored
- [ ] Role-based access control enforced
- [ ] Expired sessions are handled
- [ ] Invalid credentials handled properly
- [ ] SQL injection prevention (use parameterized queries)

---

## Example Usage Flow

### User Journey 1: Institutional User Login

1. User opens app → sees **Login Landing Page**
2. User taps **"Institutional Suite"** card
3. App navigates to **Institutional Login Form**
4. User enters email & password
5. App validates credentials
6. App checks user role (must be: super_admin, co_admin, student, or faculty)
7. If valid → creates session → navigates to **Dashboard**
8. If invalid role → shows error: "Access denied. Please use Professional Suite portal."

### User Journey 2: B2C User Login

1. User opens app → sees **Login Landing Page**
2. User taps **"Professional Suite"** card
3. App navigates to **Professional Login Form**
4. User enters email & password
5. App validates credentials
6. App checks user role (must be: b2c_student or b2c_mentor)
7. If valid → creates session → navigates to **Dashboard**
8. If invalid role → shows error: "Access denied. Please use Institutional Suite portal."

---

## Supabase Configuration

### Supabase Client Setup

```javascript
// utils/supabase.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'your-supabase-url';
const SUPABASE_ANON_KEY = 'your-supabase-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### Row-Level Security (RLS) Policies

**Enable RLS on both tables**:

```sql
-- Users table policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Sessions table policies
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## AI Prompt for Implementation

**Prompt Template:**

```
Create a complete React Native login system based on the iGyanAI dual-portal architecture with the following requirements:

1. SCREENS:
   - Login Landing Screen with two portal options (Institutional Suite & Professional Suite)
   - Reusable Login Form Screen that adapts based on portal variant
   - Separate wrapper screens for each portal

2. AUTHENTICATION:
   - Implement SHA-256 password hashing
   - Role-based access control (institutional roles: super_admin, co_admin, student, faculty | B2C roles: b2c_student, b2c_mentor)
   - Session management with 7-day expiration
   - Device tracking (deviceType, OS, IP address)
   - Secure token generation and storage

3. DATABASE INTEGRATION:
   - Connect to Supabase with provided schema (users & sessions tables)
   - Implement session persistence using AsyncStorage
   - Auto-login on app restart if valid session exists

4. UI/UX:
   - Modern gradient backgrounds with blur effects
   - Sky/cyan color scheme (primary: #0ea5e9)
   - Responsive layout for all screen sizes
   - Show/hide password toggle
   - Loading states and error handling
   - Smooth animations and transitions

5. NAVIGATION:
   - Stack navigator for auth flow
   - Navigate to dashboard on successful login
   - Handle back navigation appropriately

Use React Navigation, @supabase/supabase-js, AsyncStorage, and react-native-linear-gradient.
Follow the variant configuration exactly as specified in VARIANT_COPY.
Ensure role validation happens before creating sessions.
Display appropriate error messages for wrong portal access.
```

---

## Additional Notes

### Future Enhancements

1. **Biometric Authentication**: Add Face ID / Touch ID support
2. **Multi-Factor Authentication**: SMS/Email OTP verification
3. **Social Login**: Google, Apple Sign-In integration
4. **Password Reset**: Email-based password recovery
5. **Remember Me**: Optional longer session duration
6. **Offline Mode**: Queue login attempts when offline

### Maintenance

- Regularly review and update security practices
- Monitor session expiration patterns
- Analyze device/OS usage for optimization
- Keep dependencies updated
- Implement logging for debugging

---

## Support & Resources

### Key Files Reference

- **Web Login Landing**: `src/app/login/page.js`
- **Web Login Form**: `src/app/login/login-form.js`
- **Auth Context**: `src/app/utils/auth_context.js`
- **Supabase Config**: `src/app/utils/supabase.js`

### Documentation Links

- React Navigation: https://reactnavigation.org/
- Supabase Docs: https://supabase.com/docs
- React Native: https://reactnavigation.org/
- AsyncStorage: https://react-native-async-storage.github.io/

---

**Document Version**: 1.0  
**Last Updated**: January 23, 2026  
**Platform**: React Native (iOS & Android)  
**Backend**: Supabase (PostgreSQL)
