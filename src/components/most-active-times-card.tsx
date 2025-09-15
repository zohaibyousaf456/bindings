"use client";

import { useState } from 'react';
import { RefreshCw, Calendar } from 'lucide-react';
import { useInstagramFollowers } from '@/hooks/use-instagram-followers';
import { getSampleHours, getMostActiveTime, calculateBarHeight } from '@/utils/followers-utils';

interface MostActiveTimesCardProps {
  className?: string;
}

export function MostActiveTimesCard({ className = "" }: MostActiveTimesCardProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  const { data, loading, error, refetch } = useInstagramFollowers(selectedDate);

  const handleDateChange = async (newDate: string) => {
    setSelectedDate(newDate);
    await refetch(newDate);
  };

  const handleRefresh = async () => {
    await refetch(selectedDate);
  };

  // Process the data for display
  const chartData = data ? getSampleHours(data.onlineFollowersByHour, 7) : [];
  const mostActiveTime = data ? getMostActiveTime(data.onlineFollowersByHour) : null;
  const maxValue = Math.max(...chartData.map(item => item.value), 1);

  if (error) {
    return (
      <div className={`bg-white rounded-[24px] p-4 md:p-5 lg:p-6 w-full hover:shadow-lg hover:border-gray-200 transition-all duration-300 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 text-base md:text-lg lg:text-xl">
            Most Active Times
          </h3>
          <button
            onClick={handleRefresh}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        <div className="text-center py-8">
          <div className="text-red-500 text-sm mb-2">Failed to load data</div>
          <div className="text-gray-500 text-xs">{error}</div>
          <button
            onClick={handleRefresh}
            className="mt-3 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-[24px] p-4 md:p-5 lg:p-6 w-full hover:shadow-lg hover:border-gray-200 transition-all duration-300 ${className}`}>
      {/* Header with date selector and refresh */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 text-base md:text-lg lg:text-xl">
          Most Active Times
        </h3>
        
        <div className="flex items-center gap-2">
          {/* Date picker */}
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="text-xs px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 pr-8"
            />
            <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
          
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 md:h-48 lg:h-56">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Bar Chart */}
          <div className="relative h-40 md:h-48 lg:h-56 mb-4">
            {/* Y-axis values */}
            <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-between text-xs md:text-sm text-gray-400">
              {[maxValue, Math.floor(maxValue * 0.75), Math.floor(maxValue * 0.5), Math.floor(maxValue * 0.25), 0].map((v) => (
                <span key={v}>{v}</span>
              ))}
            </div>

            {/* Bars */}
            <div className="flex items-end justify-between h-full pr-6 gap-1 md:gap-2">
              {chartData.map((item) => (
                <div
                  key={item.hour}
                  className="flex flex-col items-center flex-1"
                >
                  <div
                    className={`w-3 md:w-4 lg:w-6 xl:w-8 rounded-t-lg transition-all duration-300 ${
                      item.isActive 
                        ? "bg-green-500 shadow-lg" 
                        : "bg-green-400 hover:bg-green-500"
                    }`}
                    style={{ 
                      height: `${calculateBarHeight(item.value, maxValue, 200)}px`,
                      minHeight: item.value > 0 ? '8px' : '0px'
                    }}
                    title={`${item.time}: ${item.value} followers`}
                  ></div>
                  <span className="text-xs md:text-sm text-gray-500 mt-1">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Most active time info */}
          <div className="text-center">
            {mostActiveTime ? (
              <>
                <div className="text-sm md:text-base text-gray-600">
                  Peak activity at <span className="font-medium">{mostActiveTime.formattedTime}</span>
                </div>
                <div className="text-xs md:text-sm text-gray-500">
                  {mostActiveTime.value} active followers
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">No data available</div>
            )}
          </div>

          {/* Date range info */}
          {data && (
            <div className="text-xs text-gray-400 text-center mt-2">
              Data for {new Date(selectedDate).toLocaleDateString()}
            </div>
          )}
        </>
      )}
    </div>
  );
}