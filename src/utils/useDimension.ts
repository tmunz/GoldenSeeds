import { RefObject, useEffect, useState } from 'react';

export function useDimension(elementRef: RefObject<HTMLElement>) {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) { return; }
    const measure = () => {
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      setDimensions((current) => current?.width === width && current.height === height ? current : { width, height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [elementRef]);

  return dimensions;
}
