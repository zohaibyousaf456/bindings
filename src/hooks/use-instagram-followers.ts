import { useState, useEffect } from 'react';

interface InstagramFollowersResponse {
  status: string;
  onlineFollowersByHour: {
    [key: string]: number;
  };
  startTime: string;
  endTime: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: InstagramFollowersResponse;
  error?: string;
}

interface UseInstagramFollowersReturn {
  data: InstagramFollowersResponse | null;
  loading: boolean;
  error: string | null;
  refetch: (date?: string) => Promise<void>;
}

export function useInstagramFollowers(initialDate?: string): UseInstagramFollowersReturn {
  const [data, setData] = useState<InstagramFollowersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (date?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Use provided date or default to today
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/instagram/followers?date=${targetDate}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch data');
      }

      setData(result.data || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching Instagram followers data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async (date?: string) => {
    await fetchData(date);
  };

  useEffect(() => {
    fetchData(initialDate);
  }, [initialDate]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}