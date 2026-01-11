import { useEffect, useState } from 'react';
import { DeviceMotion, DeviceMotionMeasurement } from 'expo-sensors';

export interface Orientation {
  alpha: number; // Yaw - rotation around Z axis (compass heading)
  beta: number;  // Pitch - rotation around X axis (forward/back tilt)
  gamma: number; // Roll - rotation around Y axis (left/right tilt)
}

export function useOrientation() {
  const [orientation, setOrientation] = useState<Orientation>({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const startListening = async () => {
      const isAvailable = await DeviceMotion.isAvailableAsync();
      setAvailable(isAvailable);

      if (!isAvailable) {
        return;
      }

      // Set update interval to ~60Hz
      DeviceMotion.setUpdateInterval(16);

      subscription = DeviceMotion.addListener((data: DeviceMotionMeasurement) => {
        if (data.rotation) {
          setOrientation({
            alpha: data.rotation.alpha,
            beta: data.rotation.beta,
            gamma: data.rotation.gamma,
          });
        }
      });
    };

    startListening();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return { orientation, available };
}
