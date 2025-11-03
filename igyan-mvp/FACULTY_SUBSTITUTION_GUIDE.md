# Faculty Substitution System - Quick Setup Guide

## ✅ What's Been Done

### 1. **Navigation Updated**
- Changed "Calendar" to "Faculty Substitution" in the dashboard sidebar
- Route: `/dashboard/faculty-substitution`
- Old calendar pages removed

### 2. **Enhanced Calendar View** 
The faculty substitution system now features:

#### **Calendar Tab** (Default View)
- 📅 **Monthly Calendar**: Visual grid showing all days
- 📊 **Class Overview**: See classes scheduled on each day
- 🔴 **Absent Markers**: Red highlights for absent teachers
- 🔵 **Active Classes**: Blue highlights for scheduled classes
- 📱 **Responsive**: Works on all screen sizes

#### **Daily Schedule Detail**
When you click a date, you'll see:
- All 8 periods for that day
- All classes in each period
- Teacher assigned to each class
- Quick actions:
  - **Mark Absent**: Flag a teacher as absent
  - **Mark Present**: Unflag if marked by mistake
  - **Find Substitute**: Auto-navigate to substitution request

### 3. **Four Main Tabs**

1. **📅 Calendar View** (NEW - Default)
   - Month navigation
   - Click any date to see full schedule
   - Mark teachers absent/present directly
   - Visual indicators for absent teachers

2. **🔍 Request Substitution**
   - Select absent faculty
   - Choose date and period
   - AI-powered substitution matching
   - View alternatives

3. **👥 Faculty Directory**
   - Search by name
   - Filter by subject
   - See availability
   - View workload

4. **📜 History**
   - Past substitutions
   - AI reasoning archive
   - Export capability

### 4. **Smart Features**

#### Absent Teacher Tracking
- Click "Mark Absent" on any class
- Teacher automatically flagged in red
- System remembers across page views
- Quick access to find substitute

#### Visual Indicators
- 🔴 **Red**: Teacher is absent
- 🔵 **Blue**: Class scheduled normally
- ⚪ **Gray**: No classes/Unavailable
- 🟣 **Purple**: Today's date
- 🟢 **Indigo**: Selected date

### 5. **25 Dummy Faculty Members**
Pre-loaded with realistic data:
- Science (5)
- Mathematics (5)
- English (4)
- Hindi (3)
- Social Science (3)
- Computer Science (2)
- Physical Education (2)
- Library (1)

## 🚀 Quick Start

### Access the System
1. Navigate to `/dashboard/faculty-substitution`
2. You'll land on the **Calendar View** tab by default

### Mark a Teacher Absent
1. Click on today's date (or any date)
2. Scroll to see all 8 periods
3. Find a class and click **"Mark Absent"**
4. The class turns red with "Absent" badge
5. Click **"Find Substitute"** to auto-fill the request form

### Request Substitution
1. Either:
   - Click "Find Substitute" from calendar, OR
   - Go to "Request Substitution" tab
2. Select absent faculty (auto-selected from calendar)
3. Confirm date and period
4. Click **"Find Substitute"**
5. AI generates best match with reasoning

### View Schedule
- **Monthly View**: See overview of all classes
- **Daily View**: Click date for detailed schedule
- **Period View**: See all classes in a specific period

## 📋 Usage Examples

### Example 1: Morning Absence
```
1. Teacher calls in sick at 8 AM
2. Admin opens Faculty Substitution
3. Clicks today's date
4. Finds Period 1 class
5. Clicks "Mark Absent"
6. Clicks "Find Substitute"
7. System shows best match in 2 seconds
8. Confirms substitution
```

### Example 2: Planned Leave
```
1. Teacher requests leave for next week
2. Admin navigates to future date
3. Marks all their classes as absent
4. Finds substitutes for each period
5. Reviews alternatives
6. Confirms all substitutions
```

### Example 3: Quick Check
```
1. Principal wants to see today's schedule
2. Opens Faculty Substitution
3. Calendar shows all classes at a glance
4. Can see any absent teachers immediately
5. Check Period 1: 15 classes, all teachers present ✓
```

## 🎨 UI Features

### Calendar Grid
- Hover effect on dates
- Click to select date
- Mini class preview (shows first 3 classes)
- "+X more" indicator for additional classes

### Daily Schedule
- Organized by period (1-8)
- Color-coded by status
- Teacher info visible
- Quick action buttons

### Responsive Design
- Desktop: Full calendar view
- Tablet: Optimized layout
- Mobile: Scrollable schedule

## 🔧 Optional: OpenAI Integration

### Setup (Optional)
Add to `.env.local`:
```env
OPENAI_API_KEY=your_api_key_here
```

### What It Does
- Generates human-readable explanations
- Justifies why each substitute is chosen
- Falls back to rule-based reasoning if not configured

### Without OpenAI
The system works perfectly without it! It uses intelligent fallback reasoning based on the algorithm.

## 📊 Algorithm Highlights

The system scores substitutes on:
- Same subject (40 points)
- Class overlap (15 points)
- Specialization match (15 points)
- Experience compatibility (10 points)
- Current workload (10 points)
- Preferred period (10 points)

## 🎯 Next Steps

1. **Test the system**: Try marking teachers absent
2. **Generate substitutions**: See the AI reasoning
3. **Check calendar**: View the full schedule
4. **Review history**: See all past substitutions

## 🐛 Troubleshooting

### Calendar not showing classes?
- Check that `selectedDate` is valid
- Faculty data includes classes array
- Schedule generation working

### Can't mark absent?
- Make sure you clicked on a valid class
- Check that date and period are selected

### Substitution fails?
- Verify at least one teacher is available
- Check that absent teacher ID is valid
- Ensure selected period has available substitutes

## 📝 Key Files

```
dashboard/faculty-substitution/
├── page.js                          # Main page with calendar
├── components/
│   ├── SubstitutionCard.js         # Results display
│   ├── FacultyList.js              # Directory view
│   └── SubstitutionHistory.js      # Past records
└── utils/
    └── substitutionAlgorithm.js    # Core algorithm + schedule generator
```

## 🎉 You're All Set!

The Faculty Substitution System is ready to use. The calendar-first approach makes it easy to:
- See what's happening today
- Quickly mark absences
- Find substitutes fast
- Track everything in one place

Navigate to `/dashboard/faculty-substitution` and start exploring! 🚀
