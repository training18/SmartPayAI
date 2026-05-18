import { useEffect } from 'react';

import { useTransactionsStore } from '@/src/store/transactions.store';

export function useTransactions(autoLoad = true) {
  const transactions = useTransactionsStore((s) => s.transactions);
  const isLoading = useTransactionsStore((s) => s.isLoading);
  const error = useTransactionsStore((s) => s.error);
  const load = useTransactionsStore((s) => s.load);

  useEffect(() => {
    if (autoLoad && transactions.length === 0 && !isLoading) load();
  }, [autoLoad, transactions.length, isLoading, load]);

  return { transactions, isLoading, error, load };
}
