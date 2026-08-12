import { useEffect, useRef, useState } from "react";

/**
 * Cheap fade/rise-on-scroll: pair the returned ref/visibility with the
 * `.reveal` / `.reveal.is-visible` classes in Home.css. No animation
 * library — a single IntersectionObserver, disconnected after the first
 * reveal so it never re-triggers on scroll-back.
 */
export function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}
