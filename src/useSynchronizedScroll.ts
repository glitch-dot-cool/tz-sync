import { useRef, useEffect, useCallback } from "react";

export function useSyncedScroll<T extends HTMLElement>() {
  const elementsRef = useRef<T[]>([]);

  const register = useCallback((el: T | null) => {
    if (!el) return;
    if (!elementsRef.current.includes(el)) {
      elementsRef.current.push(el);
    }
  }, []);

  useEffect(() => {
    const elements = elementsRef.current;
    let isSyncing = false;
    let scheduled = false;

    const handleScroll = (e: Event) => {
      if (isSyncing) return;

      const source = e.target as T;

      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(() => {
          scheduled = false;
          isSyncing = true;

          elements.forEach((el) => {
            if (el !== source) {
              const ratio =
                source.scrollLeft /
                (source.scrollWidth - source.clientWidth || 1);
              el.scrollLeft = ratio * (el.scrollWidth - el.clientWidth);
            }
          });

          isSyncing = false;
        });
      }
    };

    elements.forEach((el) =>
      el.addEventListener("scroll", handleScroll, { passive: true })
    );

    return () => {
      elements.forEach((el) => el.removeEventListener("scroll", handleScroll));
    };
  }, []);

  return register;
}
