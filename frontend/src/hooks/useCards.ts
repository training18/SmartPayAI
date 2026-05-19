import { useEffect } from 'react';

import { useCardsStore } from '@/src/store/cards.store';

/**
 * Loads the wallet on mount and exposes selectors.
 * `autoLoad` defaults true so screens get data without ceremony.
 */
export function useCards(autoLoad = true) {
  const cards = useCardsStore((s) => s.cards);
  const virtualCard = useCardsStore((s) => s.virtualCard);
  const isLoading = useCardsStore((s) => s.isLoading);
  const error = useCardsStore((s) => s.error);
  const load = useCardsStore((s) => s.load);
  const loadVirtualCard = useCardsStore((s) => s.loadVirtualCard);
  const add = useCardsStore((s) => s.add);
  const remove = useCardsStore((s) => s.remove);
  const update = useCardsStore((s) => s.update);

  useEffect(() => {
    if (autoLoad) {
      load();
      loadVirtualCard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { cards, virtualCard, isLoading, error, load, loadVirtualCard, add, remove, update };
}
