import axios from 'axios';

// Get API URL from environment variable or use default
const API_URL = 'http://localhost:8081/api';;

export const fetchHourlyData = async () => {
  try {
    console.log("Fetching hourly data from:", `${API_URL}/consumption/hourly`);
    const response = await axios.get(`${API_URL}/consumption/hourly`);
    console.log("Hourly data response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching hourly data:', error);
    throw error;
  }
};

export const fetchSummaryStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/stats/summary`);
    return response.data;
  } catch (error) {
    console.error('Error fetching summary stats:', error);
    throw error;
  }
};

export const fetchRealtimeData = async () => {
  try {
    const response = await axios.get(`${API_URL}/consumption/realtime`);
    return response.data;
  } catch (error) {
    console.error('Error fetching realtime data:', error);
    throw error;
  }
};