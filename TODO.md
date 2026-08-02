# Student UI Consistency - TODOs

## ✅ Completed
1. ✅ Created `NotificationBell` component with notification polling and dropdown
2. ✅ Created `AvatarInitials` component for user avatar fallback
3. ✅ Updated `StudentDashboardPage` - Added consistent topbar with NotificationBell + AvatarInitials
4. ✅ Updated `ExamList` (layout) - Added consistent topbar with NotificationBell + AvatarInitials
5. ✅ Updated `Results` (layout) - Added consistent topbar with NotificationBell + AvatarInitials
6. ✅ Updated `Profile` (layout) - Added consistent topbar with NotificationBell + AvatarInitials

## 📝 Notes
- All student pages now share the same `exam-topbar` structure
- NotificationBell polls for unread notifications every 30 seconds
- Clicking the bell icon toggles a dropdown with recent notifications
- AvatarInitials shows the first letter of the user's name as a fallback
