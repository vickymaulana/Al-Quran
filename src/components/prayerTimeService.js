import axios from 'axios';

export const getPrayerTimesByCoordinates = async (city, month, year) => {
  try {
    const response = await axios.get(`https://raw.githubusercontent.com/lakuapik/jadwalsholatorg/master/adzan/${city.toLowerCase()}/${year}/${month}.json`);
    
    if (response.status !== 200) {
      throw new Error('Failed to fetch prayer times');
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching prayer times for ${city}:`, error);
    return [];
  }
};
