import { useEffect } from 'react';

import { useTransactionsStore } from '@/src/store/transactions.store';

export function useTransactions(autoLoad = true) {
  const transactions = useTransactionsStore((s) => s.transactions);
  const isLoading = useTransactionsStore((s) => s.isLoading);
  const error = useTransactionsStore((s) => s.error);
  const load = useTransactionsStore((s) => s.load);
  const initiate = useTransactionsStore((s) => s.initiate);
  const approve = useTransactionsStore((s) => s.approve);
  const reject = useTransactionsStore((s) => s.reject);
  const pendingRecommendation = useTransactionsStore((s) => s.pendingRecommendation);
  const isInitiating = useTransactionsStore((s) => s.isInitiating);
  const clearPendingRecommendation = useTransactionsStore((s) => s.clearPendingRecommendation);

  useEffect(() => {
    if (autoLoad) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    transactions,
    isLoading,
    error,
    load,
    initiate,
    approve,
    reject,
    pendingRecommendation,
    isInitiating,
    clearPendingRecommendation,
  };
}
