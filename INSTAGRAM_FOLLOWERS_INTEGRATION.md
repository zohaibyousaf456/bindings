# Instagram Followers Integration Guide

This guide explains how to integrate the dynamic Instagram followers data into your "Most Active Times" card.

## Files Created

1. **`/src/hooks/use-instagram-followers.ts`** - Custom hook for fetching Instagram followers data
2. **`/src/utils/followers-utils.ts`** - Utility functions for processing followers data
3. **`/src/components/most-active-times-card.tsx`** - Dynamic Most Active Times card component
4. **`/src/types/instagram-followers.ts`** - TypeScript type definitions

## Integration Steps

### Step 1: Replace the Static Card

In your existing homepage component, replace the static "Most Active Times" card with the dynamic version:

```tsx
import { MostActiveTimesCard } from '@/components/most-active-times-card';

// Replace the existing static card with:
<MostActiveTimesCard className="max-w-[353px] lg:max-w-none" />
```

### Step 2: Remove Static Code

Remove the existing static Most Active Times card code:

```tsx
// REMOVE THIS STATIC CODE:
<div className="bg-white rounded-[24px] p-4 md:p-5 lg:p-6 w-full max-w-[353px] lg:max-w-none hover:shadow-lg hover:border-gray-200 transition-all duration-300">
  <h3 className="font-semibold text-gray-900 mb-4 text-base md:text-lg lg:text-xl">
    Most Active Times
  </h3>
  {/* Static bar chart code... */}
</div>
```

### Step 3: Update Imports

Add the necessary imports to your homepage component:

```tsx
import { MostActiveTimesCard } from '@/components/most-active-times-card';
```

## Features

### Dynamic Data Loading
- Fetches real data from your `/api/instagram/followers` endpoint
- Uses authentication token from localStorage
- Handles loading states and errors gracefully

### Interactive Date Selection
- Date picker to view historical data
- Defaults to today's date
- Prevents selection of future dates

### Smart Data Visualization
- Automatically identifies peak activity time
- Scales bar heights based on actual data
- Shows sample of hours to avoid overcrowding
- Highlights the most active hour in green

### Error Handling
- Shows error messages when API calls fail
- Provides retry functionality
- Falls back gracefully when no data is available

### Responsive Design
- Adapts to different screen sizes
- Maintains your existing styling patterns
- Includes hover effects and transitions

## API Requirements

Your existing API endpoint `/api/instagram/followers` should return data in this format:

```json
{
  "success": true,
  "message": "Instagram followers data retrieved successfully",
  "data": {
    "status": "success",
    "onlineFollowersByHour": {
      "0": 120,
      "1": 113,
      "2": 117,
      // ... more hours
      "23": 98
    },
    "startTime": "2024-03-29T07:00:00.000Z",
    "endTime": "2024-03-30T07:00:00.000Z"
  }
}
```

## Customization

### Styling
The component uses your existing Tailwind classes and can be customized by:
- Modifying the `className` prop
- Updating colors in the component file
- Adjusting chart dimensions

### Data Processing
You can modify the data processing logic in `/src/utils/followers-utils.ts`:
- Change the number of displayed hours
- Modify time formatting
- Adjust bar height calculations

### Hook Configuration
The hook can be configured to:
- Change default date behavior
- Modify error handling
- Add caching mechanisms

## Example Usage

```tsx
// Basic usage
<MostActiveTimesCard />

// With custom styling
<MostActiveTimesCard className="shadow-xl border-2" />

// Using the hook directly in your own component
const { data, loading, error, refetch } = useInstagramFollowers('2024-01-15');
```

## Troubleshooting

### Common Issues

1. **"No authentication token found"**
   - Ensure user is logged in and token is in localStorage

2. **API endpoint not found**
   - Verify your API route is at `/api/instagram/followers`
   - Check that the route accepts GET requests with date parameter

3. **CORS errors**
   - Your existing API already handles OPTIONS requests, so this should work

4. **Data not displaying**
   - Check browser console for errors
   - Verify API response format matches expected structure

### Debug Mode

You can enable debug logging by adding console.log statements in the hook:

```tsx
// In use-instagram-followers.ts
console.log('Fetching data for date:', targetDate);
console.log('API response:', result);
```

This integration maintains your existing design while adding dynamic, real-time data from your Instagram followers API.