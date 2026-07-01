import { useState, useEffect, useCallback, useRef } from 'react';

interface UseCountdownOptions {
  initialSeconds: number;
  onComplete?: () => void;
  active?: boolean;
}

export function useCountdown({
  initialSeconds,
  onComplete,
  active = true,
}: UseCountdownOptions) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  const initialRef = useRef(initialSeconds);
  onCompleteRef.current = onComplete;
  initialRef.current = initialSeconds;

  const reset = useCallback((newSeconds?: number) => {
    setSeconds(newSeconds ?? initialRef.current);
  }, []);

  useEffect(() => {
    if (!active) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          onCompleteRef.current?.();
          return initialRef.current;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [active]);

  return { seconds, reset };
}
