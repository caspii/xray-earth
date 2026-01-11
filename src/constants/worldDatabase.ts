export type POIType = 'city' | 'landmark' | 'natural';

export interface POI {
  id: string;
  name: string;
  country: string;
  type: POIType;
  population: number | null; // null for non-cities
  lat: number;
  lng: number;
}

// 100 Major World Cities (by population/significance)
const CITIES: POI[] = [
  { id: "tokyo", name: "Tokyo", country: "Japan", type: "city", population: 37400000, lat: 35.6762, lng: 139.6503 },
  { id: "delhi", name: "Delhi", country: "India", type: "city", population: 32941000, lat: 28.6139, lng: 77.2090 },
  { id: "shanghai", name: "Shanghai", country: "China", type: "city", population: 29210000, lat: 31.2304, lng: 121.4737 },
  { id: "sao_paulo", name: "São Paulo", country: "Brazil", type: "city", population: 22430000, lat: -23.5505, lng: -46.6333 },
  { id: "mexico_city", name: "Mexico City", country: "Mexico", type: "city", population: 21920000, lat: 19.4326, lng: -99.1332 },
  { id: "cairo", name: "Cairo", country: "Egypt", type: "city", population: 21750000, lat: 30.0444, lng: 31.2357 },
  { id: "dhaka", name: "Dhaka", country: "Bangladesh", type: "city", population: 21740000, lat: 23.8103, lng: 90.4125 },
  { id: "mumbai", name: "Mumbai", country: "India", type: "city", population: 21300000, lat: 19.0760, lng: 72.8777 },
  { id: "beijing", name: "Beijing", country: "China", type: "city", population: 21000000, lat: 39.9042, lng: 116.4074 },
  { id: "osaka", name: "Osaka", country: "Japan", type: "city", population: 19160000, lat: 34.6937, lng: 135.5023 },
  { id: "new_york", name: "New York", country: "USA", type: "city", population: 18820000, lat: 40.7128, lng: -74.0060 },
  { id: "karachi", name: "Karachi", country: "Pakistan", type: "city", population: 16840000, lat: 24.8607, lng: 67.0011 },
  { id: "chongqing", name: "Chongqing", country: "China", type: "city", population: 16380000, lat: 29.4316, lng: 106.9123 },
  { id: "istanbul", name: "Istanbul", country: "Turkey", type: "city", population: 15640000, lat: 41.0082, lng: 28.9784 },
  { id: "buenos_aires", name: "Buenos Aires", country: "Argentina", type: "city", population: 15370000, lat: -34.6037, lng: -58.3816 },
  { id: "kolkata", name: "Kolkata", country: "India", type: "city", population: 15130000, lat: 22.5726, lng: 88.3639 },
  { id: "lagos", name: "Lagos", country: "Nigeria", type: "city", population: 14860000, lat: 6.5244, lng: 3.3792 },
  { id: "kinshasa", name: "Kinshasa", country: "DR Congo", type: "city", population: 14340000, lat: -4.4419, lng: 15.2663 },
  { id: "manila", name: "Manila", country: "Philippines", type: "city", population: 14160000, lat: 14.5995, lng: 120.9842 },
  { id: "rio", name: "Rio de Janeiro", country: "Brazil", type: "city", population: 13630000, lat: -22.9068, lng: -43.1729 },
  { id: "tianjin", name: "Tianjin", country: "China", type: "city", population: 13590000, lat: 39.3434, lng: 117.3616 },
  { id: "guangzhou", name: "Guangzhou", country: "China", type: "city", population: 13500000, lat: 23.1291, lng: 113.2644 },
  { id: "los_angeles", name: "Los Angeles", country: "USA", type: "city", population: 12460000, lat: 34.0522, lng: -118.2437 },
  { id: "moscow", name: "Moscow", country: "Russia", type: "city", population: 12410000, lat: 55.7558, lng: 37.6173 },
  { id: "shenzhen", name: "Shenzhen", country: "China", type: "city", population: 12360000, lat: 22.5431, lng: 114.0579 },
  { id: "lahore", name: "Lahore", country: "Pakistan", type: "city", population: 12190000, lat: 31.5204, lng: 74.3587 },
  { id: "bangalore", name: "Bangalore", country: "India", type: "city", population: 11440000, lat: 12.9716, lng: 77.5946 },
  { id: "paris", name: "Paris", country: "France", type: "city", population: 11020000, lat: 48.8566, lng: 2.3522 },
  { id: "jakarta", name: "Jakarta", country: "Indonesia", type: "city", population: 10770000, lat: -6.2088, lng: 106.8456 },
  { id: "seoul", name: "Seoul", country: "South Korea", type: "city", population: 9960000, lat: 37.5665, lng: 126.9780 },
  { id: "lima", name: "Lima", country: "Peru", type: "city", population: 9750000, lat: -12.0464, lng: -77.0428 },
  { id: "london", name: "London", country: "UK", type: "city", population: 9540000, lat: 51.5074, lng: -0.1278 },
  { id: "chennai", name: "Chennai", country: "India", type: "city", population: 9470000, lat: 13.0827, lng: 80.2707 },
  { id: "bogota", name: "Bogotá", country: "Colombia", type: "city", population: 9460000, lat: 4.7110, lng: -74.0721 },
  { id: "bangkok", name: "Bangkok", country: "Thailand", type: "city", population: 9310000, lat: 13.7563, lng: 100.5018 },
  { id: "hyderabad", name: "Hyderabad", country: "India", type: "city", population: 9010000, lat: 17.3850, lng: 78.4867 },
  { id: "nagoya", name: "Nagoya", country: "Japan", type: "city", population: 8920000, lat: 35.1815, lng: 136.9066 },
  { id: "tehran", name: "Tehran", country: "Iran", type: "city", population: 8690000, lat: 35.6892, lng: 51.3890 },
  { id: "chicago", name: "Chicago", country: "USA", type: "city", population: 8560000, lat: 41.8781, lng: -87.6298 },
  { id: "hong_kong", name: "Hong Kong", country: "China", type: "city", population: 7510000, lat: 22.3193, lng: 114.1694 },
  { id: "ho_chi_minh", name: "Ho Chi Minh City", country: "Vietnam", type: "city", population: 8600000, lat: 10.8231, lng: 106.6297 },
  { id: "singapore", name: "Singapore", country: "Singapore", type: "city", population: 5450000, lat: 1.3521, lng: 103.8198 },
  { id: "sydney", name: "Sydney", country: "Australia", type: "city", population: 5310000, lat: -33.8688, lng: 151.2093 },
  { id: "toronto", name: "Toronto", country: "Canada", type: "city", population: 6310000, lat: 43.6532, lng: -79.3832 },
  { id: "madrid", name: "Madrid", country: "Spain", type: "city", population: 6620000, lat: 40.4168, lng: -3.7038 },
  { id: "berlin", name: "Berlin", country: "Germany", type: "city", population: 3570000, lat: 52.5200, lng: 13.4050 },
  { id: "dubai", name: "Dubai", country: "UAE", type: "city", population: 3480000, lat: 25.2048, lng: 55.2708 },
  { id: "rome", name: "Rome", country: "Italy", type: "city", population: 4260000, lat: 41.9028, lng: 12.4964 },
  { id: "johannesburg", name: "Johannesburg", country: "South Africa", type: "city", population: 5780000, lat: -26.2041, lng: 28.0473 },
  { id: "cape_town", name: "Cape Town", country: "South Africa", type: "city", population: 4620000, lat: -33.9249, lng: 18.4241 },
  { id: "nairobi", name: "Nairobi", country: "Kenya", type: "city", population: 4920000, lat: -1.2921, lng: 36.8219 },
  { id: "casablanca", name: "Casablanca", country: "Morocco", type: "city", population: 3710000, lat: 33.5731, lng: -7.5898 },
  { id: "riyadh", name: "Riyadh", country: "Saudi Arabia", type: "city", population: 7680000, lat: 24.7136, lng: 46.6753 },
  { id: "baghdad", name: "Baghdad", country: "Iraq", type: "city", population: 7140000, lat: 33.3152, lng: 44.3661 },
  { id: "santiago", name: "Santiago", country: "Chile", type: "city", population: 6770000, lat: -33.4489, lng: -70.6693 },
  { id: "kuala_lumpur", name: "Kuala Lumpur", country: "Malaysia", type: "city", population: 7780000, lat: 3.1390, lng: 101.6869 },
  { id: "taipei", name: "Taipei", country: "Taiwan", type: "city", population: 2650000, lat: 25.0330, lng: 121.5654 },
  { id: "melbourne", name: "Melbourne", country: "Australia", type: "city", population: 5080000, lat: -37.8136, lng: 144.9631 },
  { id: "vancouver", name: "Vancouver", country: "Canada", type: "city", population: 2580000, lat: 49.2827, lng: -123.1207 },
  { id: "miami", name: "Miami", country: "USA", type: "city", population: 6170000, lat: 25.7617, lng: -80.1918 },
  { id: "san_francisco", name: "San Francisco", country: "USA", type: "city", population: 4730000, lat: 37.7749, lng: -122.4194 },
  { id: "seattle", name: "Seattle", country: "USA", type: "city", population: 3980000, lat: 47.6062, lng: -122.3321 },
  { id: "boston", name: "Boston", country: "USA", type: "city", population: 4870000, lat: 42.3601, lng: -71.0589 },
  { id: "washington_dc", name: "Washington D.C.", country: "USA", type: "city", population: 6280000, lat: 38.9072, lng: -77.0369 },
  { id: "atlanta", name: "Atlanta", country: "USA", type: "city", population: 6020000, lat: 33.7490, lng: -84.3880 },
  { id: "dallas", name: "Dallas", country: "USA", type: "city", population: 7640000, lat: 32.7767, lng: -96.7970 },
  { id: "houston", name: "Houston", country: "USA", type: "city", population: 7070000, lat: 29.7604, lng: -95.3698 },
  { id: "phoenix", name: "Phoenix", country: "USA", type: "city", population: 4950000, lat: 33.4484, lng: -112.0740 },
  { id: "denver", name: "Denver", country: "USA", type: "city", population: 2930000, lat: 39.7392, lng: -104.9903 },
  { id: "montreal", name: "Montreal", country: "Canada", type: "city", population: 4220000, lat: 45.5017, lng: -73.5673 },
  { id: "amsterdam", name: "Amsterdam", country: "Netherlands", type: "city", population: 1150000, lat: 52.3676, lng: 4.9041 },
  { id: "vienna", name: "Vienna", country: "Austria", type: "city", population: 1910000, lat: 48.2082, lng: 16.3738 },
  { id: "warsaw", name: "Warsaw", country: "Poland", type: "city", population: 1790000, lat: 52.2297, lng: 21.0122 },
  { id: "prague", name: "Prague", country: "Czech Republic", type: "city", population: 1310000, lat: 50.0755, lng: 14.4378 },
  { id: "budapest", name: "Budapest", country: "Hungary", type: "city", population: 1760000, lat: 47.4979, lng: 19.0402 },
  { id: "stockholm", name: "Stockholm", country: "Sweden", type: "city", population: 1630000, lat: 59.3293, lng: 18.0686 },
  { id: "oslo", name: "Oslo", country: "Norway", type: "city", population: 1060000, lat: 59.9139, lng: 10.7522 },
  { id: "copenhagen", name: "Copenhagen", country: "Denmark", type: "city", population: 1350000, lat: 55.6761, lng: 12.5683 },
  { id: "helsinki", name: "Helsinki", country: "Finland", type: "city", population: 1290000, lat: 60.1699, lng: 24.9384 },
  { id: "athens", name: "Athens", country: "Greece", type: "city", population: 3150000, lat: 37.9838, lng: 23.7275 },
  { id: "lisbon", name: "Lisbon", country: "Portugal", type: "city", population: 2870000, lat: 38.7223, lng: -9.1393 },
  { id: "barcelona", name: "Barcelona", country: "Spain", type: "city", population: 5620000, lat: 41.3851, lng: 2.1734 },
  { id: "munich", name: "Munich", country: "Germany", type: "city", population: 1470000, lat: 48.1351, lng: 11.5820 },
  { id: "hamburg", name: "Hamburg", country: "Germany", type: "city", population: 1900000, lat: 53.5511, lng: 9.9937 },
  { id: "frankfurt", name: "Frankfurt", country: "Germany", type: "city", population: 750000, lat: 50.1109, lng: 8.6821 },
  { id: "cologne", name: "Cologne", country: "Germany", type: "city", population: 1080000, lat: 50.9375, lng: 6.9603 },
  { id: "dusseldorf", name: "Düsseldorf", country: "Germany", type: "city", population: 620000, lat: 51.2277, lng: 6.7735 },
  { id: "stuttgart", name: "Stuttgart", country: "Germany", type: "city", population: 635000, lat: 48.7758, lng: 9.1829 },
  { id: "leipzig", name: "Leipzig", country: "Germany", type: "city", population: 600000, lat: 51.3397, lng: 12.3731 },
  { id: "dresden", name: "Dresden", country: "Germany", type: "city", population: 560000, lat: 51.0504, lng: 13.7373 },
  { id: "hanover", name: "Hanover", country: "Germany", type: "city", population: 535000, lat: 52.3759, lng: 9.7320 },
  { id: "nuremberg", name: "Nuremberg", country: "Germany", type: "city", population: 520000, lat: 49.4521, lng: 11.0767 },
  { id: "milan", name: "Milan", country: "Italy", type: "city", population: 3140000, lat: 45.4642, lng: 9.1900 },
  { id: "zurich", name: "Zurich", country: "Switzerland", type: "city", population: 1390000, lat: 47.3769, lng: 8.5417 },
  { id: "dublin", name: "Dublin", country: "Ireland", type: "city", population: 1430000, lat: 53.3498, lng: -6.2603 },
  { id: "brussels", name: "Brussels", country: "Belgium", type: "city", population: 2110000, lat: 50.8503, lng: 4.3517 },
  { id: "auckland", name: "Auckland", country: "New Zealand", type: "city", population: 1660000, lat: -36.8509, lng: 174.7645 },
  { id: "mumbai", name: "Mumbai", country: "India", type: "city", population: 21300000, lat: 19.0760, lng: 72.8777 },
  { id: "hanoi", name: "Hanoi", country: "Vietnam", type: "city", population: 4680000, lat: 21.0285, lng: 105.8542 },
  { id: "yangon", name: "Yangon", country: "Myanmar", type: "city", population: 5160000, lat: 16.8661, lng: 96.1951 },
  { id: "addis_ababa", name: "Addis Ababa", country: "Ethiopia", type: "city", population: 3600000, lat: 9.0320, lng: 38.7469 },
  { id: "algiers", name: "Algiers", country: "Algeria", type: "city", population: 2770000, lat: 36.7372, lng: 3.0869 },
  { id: "havana", name: "Havana", country: "Cuba", type: "city", population: 2130000, lat: 23.1136, lng: -82.3666 },
  { id: "caracas", name: "Caracas", country: "Venezuela", type: "city", population: 2940000, lat: 10.4806, lng: -66.9036 },
  { id: "quito", name: "Quito", country: "Ecuador", type: "city", population: 2010000, lat: -0.1807, lng: -78.4678 },
  { id: "la_paz", name: "La Paz", country: "Bolivia", type: "city", population: 2030000, lat: -16.4897, lng: -68.1193 },
  { id: "montevideo", name: "Montevideo", country: "Uruguay", type: "city", population: 1870000, lat: -34.9011, lng: -56.1645 },
];

// 50 Notable Points of Interest (landmarks and natural wonders)
const LANDMARKS: POI[] = [
  // Famous landmarks
  { id: "eiffel_tower", name: "Eiffel Tower", country: "France", type: "landmark", population: null, lat: 48.8584, lng: 2.2945 },
  { id: "statue_liberty", name: "Statue of Liberty", country: "USA", type: "landmark", population: null, lat: 40.6892, lng: -74.0445 },
  { id: "big_ben", name: "Big Ben", country: "UK", type: "landmark", population: null, lat: 51.5007, lng: -0.1246 },
  { id: "colosseum", name: "Colosseum", country: "Italy", type: "landmark", population: null, lat: 41.8902, lng: 12.4922 },
  { id: "taj_mahal", name: "Taj Mahal", country: "India", type: "landmark", population: null, lat: 27.1751, lng: 78.0421 },
  { id: "great_wall", name: "Great Wall", country: "China", type: "landmark", population: null, lat: 40.4319, lng: 116.5704 },
  { id: "christ_redeemer", name: "Christ the Redeemer", country: "Brazil", type: "landmark", population: null, lat: -22.9519, lng: -43.2105 },
  { id: "machu_picchu", name: "Machu Picchu", country: "Peru", type: "landmark", population: null, lat: -13.1631, lng: -72.5450 },
  { id: "petra", name: "Petra", country: "Jordan", type: "landmark", population: null, lat: 30.3285, lng: 35.4444 },
  { id: "pyramids_giza", name: "Pyramids of Giza", country: "Egypt", type: "landmark", population: null, lat: 29.9792, lng: 31.1342 },
  { id: "angkor_wat", name: "Angkor Wat", country: "Cambodia", type: "landmark", population: null, lat: 13.4125, lng: 103.8670 },
  { id: "sydney_opera", name: "Sydney Opera House", country: "Australia", type: "landmark", population: null, lat: -33.8568, lng: 151.2153 },
  { id: "burj_khalifa", name: "Burj Khalifa", country: "UAE", type: "landmark", population: null, lat: 25.1972, lng: 55.2744 },
  { id: "golden_gate", name: "Golden Gate Bridge", country: "USA", type: "landmark", population: null, lat: 37.8199, lng: -122.4783 },
  { id: "acropolis", name: "Acropolis", country: "Greece", type: "landmark", population: null, lat: 37.9715, lng: 23.7267 },
  { id: "sagrada_familia", name: "Sagrada Familia", country: "Spain", type: "landmark", population: null, lat: 41.4036, lng: 2.1744 },
  { id: "kremlin", name: "Kremlin", country: "Russia", type: "landmark", population: null, lat: 55.7520, lng: 37.6175 },
  { id: "forbidden_city", name: "Forbidden City", country: "China", type: "landmark", population: null, lat: 39.9163, lng: 116.3972 },
  { id: "neuschwanstein", name: "Neuschwanstein Castle", country: "Germany", type: "landmark", population: null, lat: 47.5576, lng: 10.7498 },
  { id: "mount_rushmore", name: "Mount Rushmore", country: "USA", type: "landmark", population: null, lat: 43.8791, lng: -103.4591 },
  { id: "stonehenge", name: "Stonehenge", country: "UK", type: "landmark", population: null, lat: 51.1789, lng: -1.8262 },
  { id: "chichen_itza", name: "Chichen Itza", country: "Mexico", type: "landmark", population: null, lat: 20.6843, lng: -88.5678 },
  { id: "easter_island", name: "Easter Island", country: "Chile", type: "landmark", population: null, lat: -27.1127, lng: -109.3497 },
  { id: "leaning_tower", name: "Leaning Tower of Pisa", country: "Italy", type: "landmark", population: null, lat: 43.7230, lng: 10.3966 },
  { id: "hagia_sophia", name: "Hagia Sophia", country: "Turkey", type: "landmark", population: null, lat: 41.0086, lng: 28.9802 },

  // Natural wonders
  { id: "grand_canyon", name: "Grand Canyon", country: "USA", type: "natural", population: null, lat: 36.0544, lng: -112.1401 },
  { id: "mount_everest", name: "Mount Everest", country: "Nepal", type: "natural", population: null, lat: 27.9881, lng: 86.9250 },
  { id: "victoria_falls", name: "Victoria Falls", country: "Zimbabwe", type: "natural", population: null, lat: -17.9243, lng: 25.8572 },
  { id: "great_barrier_reef", name: "Great Barrier Reef", country: "Australia", type: "natural", population: null, lat: -18.2871, lng: 147.6992 },
  { id: "amazon_river", name: "Amazon River", country: "Brazil", type: "natural", population: null, lat: -3.4653, lng: -62.2159 },
  { id: "niagara_falls", name: "Niagara Falls", country: "USA/Canada", type: "natural", population: null, lat: 43.0962, lng: -79.0377 },
  { id: "mount_fuji", name: "Mount Fuji", country: "Japan", type: "natural", population: null, lat: 35.3606, lng: 138.7274 },
  { id: "aurora_iceland", name: "Northern Lights", country: "Iceland", type: "natural", population: null, lat: 64.9631, lng: -19.0208 },
  { id: "uluru", name: "Uluru", country: "Australia", type: "natural", population: null, lat: -25.3444, lng: 131.0369 },
  { id: "dead_sea", name: "Dead Sea", country: "Israel/Jordan", type: "natural", population: null, lat: 31.5000, lng: 35.5000 },
  { id: "yellowstone", name: "Yellowstone", country: "USA", type: "natural", population: null, lat: 44.4280, lng: -110.5885 },
  { id: "galapagos", name: "Galápagos Islands", country: "Ecuador", type: "natural", population: null, lat: -0.9538, lng: -90.9656 },
  { id: "iguazu_falls", name: "Iguazu Falls", country: "Argentina/Brazil", type: "natural", population: null, lat: -25.6953, lng: -54.4367 },
  { id: "matterhorn", name: "Matterhorn", country: "Switzerland", type: "natural", population: null, lat: 45.9763, lng: 7.6586 },
  { id: "table_mountain", name: "Table Mountain", country: "South Africa", type: "natural", population: null, lat: -33.9628, lng: 18.4098 },
  { id: "serengeti", name: "Serengeti", country: "Tanzania", type: "natural", population: null, lat: -2.3333, lng: 34.8333 },
  { id: "kilimanjaro", name: "Mount Kilimanjaro", country: "Tanzania", type: "natural", population: null, lat: -3.0674, lng: 37.3556 },
  { id: "sahara", name: "Sahara Desert", country: "Africa", type: "natural", population: null, lat: 23.4162, lng: 25.6628 },
  { id: "antarctica", name: "Antarctica", country: "Antarctica", type: "natural", population: null, lat: -82.8628, lng: 135.0000 },
  { id: "arctic", name: "North Pole", country: "Arctic", type: "natural", population: null, lat: 90.0000, lng: 0.0000 },
  { id: "mariana_trench", name: "Mariana Trench", country: "Pacific Ocean", type: "natural", population: null, lat: 11.3493, lng: 142.1996 },
  { id: "ha_long_bay", name: "Ha Long Bay", country: "Vietnam", type: "natural", population: null, lat: 20.9101, lng: 107.1839 },
  { id: "banff", name: "Banff National Park", country: "Canada", type: "natural", population: null, lat: 51.4968, lng: -115.9281 },
  { id: "zhangjiajie", name: "Zhangjiajie", country: "China", type: "natural", population: null, lat: 29.3249, lng: 110.4343 },
  { id: "plitvice", name: "Plitvice Lakes", country: "Croatia", type: "natural", population: null, lat: 44.8654, lng: 15.5820 },
];

// Combined database
export const WORLD_DATABASE: POI[] = [...CITIES, ...LANDMARKS];

// Helper to get POI by ID
export function getPOIById(id: string): POI | undefined {
  return WORLD_DATABASE.find(poi => poi.id === id);
}

// Get all cities
export function getCities(): POI[] {
  return WORLD_DATABASE.filter(poi => poi.type === 'city');
}

// Get all landmarks and natural wonders
export function getLandmarks(): POI[] {
  return WORLD_DATABASE.filter(poi => poi.type === 'landmark' || poi.type === 'natural');
}
