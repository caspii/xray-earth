import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export interface UserLocation {
  lat: number;
  lng: number;
}

export function useLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setError('Location permission denied');
          setLoading(false);
          // Default to 0,0 if permission denied
          setLocation({ lat: 0, lng: 0 });
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setError(null);
      } catch (e) {
        setError('Failed to get location');
        // Default to 0,0 on error
        setLocation({ lat: 0, lng: 0 });
      } finally {
        setLoading(false);
      }
    };

    getLocation();
  }, []);

  return { location, error, loading };
}
