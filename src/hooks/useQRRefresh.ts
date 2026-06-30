import { useState, useEffect, useCallback, useRef } from 'react';
import type { Payload, PayloadWithRaw } from '../models/Payload';
import { generatePayload } from '../services/payloadService';

interface UseQRRefreshOptions {
  basePayload: Payload | null;
  interval: number;
  active: boolean;
  onRefresh?: (oldPayload: PayloadWithRaw | null, newPayload: PayloadWithRaw) => void;
}

export function useQRRefresh({
  basePayload,
  interval,
  active,
  onRefresh,
}: UseQRRefreshOptions) {
  const [currentPayload, setCurrentPayload] = useState<PayloadWithRaw | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const refresh = useCallback(() => {
    if (!basePayload) return;
    const oldPayload = currentPayload;
    const newPayload = generatePayload(basePayload);
    setCurrentPayload(newPayload);
    setRefreshCount((c) => c + 1);
    onRefreshRef.current?.(oldPayload, newPayload);
    return newPayload;
  }, [basePayload, currentPayload]);

  useEffect(() => {
    if (basePayload) {
      const initial = generatePayload(basePayload);
      setCurrentPayload(initial);
      setRefreshCount(0);
      onRefreshRef.current?.(null, initial);
    }
  }, [basePayload]);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (active && basePayload) {
      timerRef.current = setInterval(() => {
        refresh();
      }, interval * 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [active, basePayload, interval, refresh]);

  return { currentPayload, refreshCount, refresh };
}
