import { useEffect } from 'react';

import { useMerchantStore } from '@/src/store/merchant.store';

export function useMerchant(autoLoad = true) {
  const payments = useMerchantStore((s) => s.payments);
  const summary = useMerchantStore((s) => s.summary);
  const isLoading = useMerchantStore((s) => s.isLoading);
  const error = useMerchantStore((s) => s.error);
  const load = useMerchantStore((s) => s.load);

  useEffect(() => {
    if (autoLoad && payments.length === 0 && !isLoading) load();
  }, [autoLoad, payments.length, isLoading, load]);

  return { payments, summary, isLoading, error, load };
}
