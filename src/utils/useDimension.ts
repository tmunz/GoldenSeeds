import { RefObject, useEffect, useRef, useState } from "react";

export const useDimension = (elementRef: RefObject<HTMLElement>, animationThreshold = 0) => {
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [dimension, setDimension] = useState<{ width: number, height: number } | null>(null);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.target instanceof HTMLElement) {
          const width = Math.floor(entry.target.offsetWidth);
          const height = Math.floor(entry.target.offsetHeight);
          if (dimension === null || dimension.width !== width || dimension.height !== height) {
            if (resizeTimeoutRef.current) {
              clearTimeout(resizeTimeoutRef.current);
            }
            resizeTimeoutRef.current = setTimeout(() => {
              setDimension({ width, height });
            }, animationThreshold);
          }
        }
      }
    });

    if (elementRef.current) {
      resizeObserver.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        resizeObserver.unobserve(elementRef.current);
      }
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = null;
      }
    };
  }, [elementRef.current, animationThreshold]);

  useEffect(() => {
    if (elementRef.current !== null) {
      const width = Math.floor(elementRef.current.offsetWidth);
      const height = Math.floor(elementRef.current.offsetHeight);
      if (dimension === null || dimension.width !== width || dimension.height !== height) {
        setDimension({ width, height });
      }
    }
  }, []);

  return dimension;

}
