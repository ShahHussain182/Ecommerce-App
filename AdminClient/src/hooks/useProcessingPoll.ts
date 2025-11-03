// src/hooks/useProcessingPoll.ts
import { useRef } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { productService } from '@/services/productService';

const INITIAL_DELAY_MS = 1000;
const MAX_DELAY_MS = 5000;
const MAX_TOTAL_MS = 2 * 60 * 1000; // 2 minutes

export function useProcessingPoll() {
  const isPollingRef = useRef(false);

  async function startPoll(productId: string, queryClient: QueryClient, onDone?: () => void) {
    if (!productId) return;
    if (isPollingRef.current) return; // already polling
    isPollingRef.current = true;

    const startTs = Date.now();
    let delay = INITIAL_DELAY_MS;

    try {
      while (Date.now() - startTs < MAX_TOTAL_MS) {
        try {
          const resp = await productService.getProductById(productId);
          const product = resp?.product;
          if (!product) break;

          if (product.imageProcessingStatus && product.imageProcessingStatus !== 'pending') {
            // finished (either 'completed' or 'failed')
            // Invalidate both the list and single product caches so UI refreshes
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', productId] });
            if (typeof onDone === 'function') onDone();
            break;
          }
        } catch (e) {
          // network or transient error — ignore and retry
          // optional: log e to console for debug
        }

        // wait and backoff slightly
        await new Promise((res) => setTimeout(res, delay));
        delay = Math.min(MAX_DELAY_MS, Math.round(delay * 1.5));
      }
    } finally {
      isPollingRef.current = false;
    }
  }

  return { startPoll };
}
