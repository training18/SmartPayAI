import { useEffect } from 'react';

import { useMerchantStore } from '@/src/store/merchant.store';

export function useMerchant(autoLoad = true) {
  const payments = useMerchantStore((s) => s.payments);
  const summary = useMerchantStore((s) => s.summary);
  const isLoading = useMerchantStore((s) => s.isLoading);
  const error = useMerchantStore((s) => s.error);
  const load = useMerchantStore((s) => s.load);

  useEffect(() => {
    if (autoLoad) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { payments, summary, isLoading, error, load };
}
