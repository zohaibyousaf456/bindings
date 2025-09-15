export interface InstagramFollowersResponse {
  status: string;
  onlineFollowersByHour: {
    [key: string]: number;
  };
  startTime: string;
  endTime: string;
}

export interface InstagramFollowersApiResponse {
  success: boolean;
  message: string;
  data?: InstagramFollowersResponse;
  error?: string;
}

export interface ProcessedFollowersData {
  time: string;
  hour: number;
  value: number;
  isActive: boolean;
}

export interface MostActiveTimeInfo {
  hour: number;
  value: number;
  formattedTime: string;
}