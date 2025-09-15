interface FollowersData {
  [key: string]: number;
}

interface ProcessedFollowersData {
  time: string;
  hour: number;
  value: number;
  isActive: boolean;
}

/**
 * Convert 24-hour format to 12-hour format with am/pm
 */
export function formatHour(hour: number): string {
  if (hour === 0) return '12a';
  if (hour === 12) return '12p';
  if (hour < 12) return `${hour}a`;
  return `${hour - 12}p`;
}

/**
 * Process followers data for chart display
 */
export function processFollowersData(followersData: FollowersData): ProcessedFollowersData[] {
  const hours = Object.keys(followersData).map(Number).sort((a, b) => a - b);
  const values = hours.map(hour => followersData[hour.toString()]);
  const maxValue = Math.max(...values);
  
  // Find the hour with the highest activity
  const maxHour = hours[values.indexOf(maxValue)];

  return hours.map(hour => ({
    time: formatHour(hour),
    hour,
    value: followersData[hour.toString()],
    isActive: hour === maxHour,
  }));
}

/**
 * Get the most active time period
 */
export function getMostActiveTime(followersData: FollowersData): { hour: number; value: number; formattedTime: string } {
  const hours = Object.keys(followersData).map(Number);
  const values = hours.map(hour => followersData[hour.toString()]);
  const maxValue = Math.max(...values);
  const maxHour = hours[values.indexOf(maxValue)];

  return {
    hour: maxHour,
    value: maxValue,
    formattedTime: formatHour(maxHour),
  };
}

/**
 * Calculate bar height for chart display (normalized to percentage)
 */
export function calculateBarHeight(value: number, maxValue: number, maxHeight: number = 200): number {
  if (maxValue === 0) return 0;
  return Math.round((value / maxValue) * maxHeight);
}

/**
 * Get a sample of hours to display on the chart (to avoid overcrowding)
 */
export function getSampleHours(followersData: FollowersData, sampleSize: number = 7): ProcessedFollowersData[] {
  const processed = processFollowersData(followersData);
  
  if (processed.length <= sampleSize) {
    return processed;
  }

  // Always include the most active hour
  const mostActive = processed.find(item => item.isActive);
  
  // Sample evenly across the 24 hours
  const step = Math.floor(processed.length / (sampleSize - 1));
  const sampled: ProcessedFollowersData[] = [];
  
  for (let i = 0; i < processed.length; i += step) {
    if (sampled.length < sampleSize - 1) {
      sampled.push(processed[i]);
    }
  }
  
  // Add the last hour if not already included
  if (sampled[sampled.length - 1] !== processed[processed.length - 1]) {
    sampled.push(processed[processed.length - 1]);
  }
  
  // Ensure most active hour is included
  if (mostActive && !sampled.find(item => item.hour === mostActive.hour)) {
    // Replace the closest hour with the most active one
    const closestIndex = sampled.reduce((closest, item, index) => {
      const currentDistance = Math.abs(item.hour - mostActive.hour);
      const closestDistance = Math.abs(sampled[closest].hour - mostActive.hour);
      return currentDistance < closestDistance ? index : closest;
    }, 0);
    
    sampled[closestIndex] = mostActive;
  }
  
  return sampled.sort((a, b) => a.hour - b.hour);
}