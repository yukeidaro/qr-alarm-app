/**
 * PagerSwipeLock — share a "lock" flag between child rows (e.g. SwipeToDelete)
 * and the parent MaterialTopTabs navigator. While locked, the pager-view's
 * horizontal swipe is disabled so a card's swipe-to-delete gesture wins.
 */
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

type Ctx = {
  locked: boolean;
  lock: () => void;
  unlock: () => void;
};

const PagerSwipeLockContext = createContext<Ctx>({
  locked: false,
  lock: () => {},
  unlock: () => {},
});

export function PagerSwipeLockProvider({ children }: { children: React.ReactNode }) {
  const [locked, setLocked] = useState(false);
  // Ref-counted so multiple rows don't fight over the flag.
  const count = useRef(0);

  const lock = useCallback(() => {
    count.current += 1;
    if (count.current === 1) setLocked(true);
  }, []);

  const unlock = useCallback(() => {
    count.current = Math.max(0, count.current - 1);
    if (count.current === 0) setLocked(false);
  }, []);

  return (
    <PagerSwipeLockContext.Provider value={{ locked, lock, unlock }}>
      {children}
    </PagerSwipeLockContext.Provider>
  );
}

export function usePagerSwipeLock() {
  return useContext(PagerSwipeLockContext);
}
