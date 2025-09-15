// This is an example of how to integrate the MostActiveTimesCard into your existing homepage
// Replace the existing static "Most Active Times" card with this dynamic version

import { MostActiveTimesCard } from './most-active-times-card';

// In your renderAudienceScreen function, replace the existing Most Active Times card with:

const renderAudienceScreen = () => (
  <div className="flex-1 overflow-y-auto bg-[#eaeef1] px-4 py-4 lg:px-8">
    {/* ... other existing components ... */}
    
    <div className="space-y-2">
      {/* ... existing Profile Card and Followers Insight Card ... */}
      
      {/* Replace the static Most Active Times Card with the dynamic one */}
      <MostActiveTimesCard className="max-w-[353px] lg:max-w-none" />
      
      {/* ... existing Reach Card ... */}
    </div>
  </div>
);

// Alternative: If you want to keep it inline in your existing component structure:
/*
<div className="bg-white rounded-[24px] p-4 md:p-5 lg:p-6 w-full max-w-[353px] lg:max-w-none hover:shadow-lg hover:border-gray-200 transition-all duration-300">
  <MostActiveTimesCard />
</div>
*/