"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const cursorOuterRef = useRef(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const outerPosition = useRef({ x: 0, y: 0 });
  const isHovering = useRef(false);
  const hasInitialized = useRef(false); // Prevent duplicate initialization

  useEffect(() => {
    if (hasInitialized.current) return; // Prevent re-initialization on re-renders
    hasInitialized.current = true;

    let rafId = null;
    let lastUpdate = 0;
    const updateFrequency = 16; // Update every ~16ms (60fps)

    const updateCursorPosition = (timestamp) => {
      if (timestamp - lastUpdate < updateFrequency) {
        rafId = requestAnimationFrame(updateCursorPosition);
        return;
      }

      lastUpdate = timestamp;

      // Update inner cursor position immediately
      cursorRef.current.style.left = `${mousePosition.current.x}px`;
      cursorRef.current.style.top = `${mousePosition.current.y}px`;

      // Smoothly interpolate outer cursor position for a trailing effect
      const ease = 0.15;
      outerPosition.current.x +=
        (mousePosition.current.x - outerPosition.current.x) * ease;
      outerPosition.current.y +=
        (mousePosition.current.y - outerPosition.current.y) * ease;

      cursorOuterRef.current.style.left = `${outerPosition.current.x}px`;
      cursorOuterRef.current.style.top = `${outerPosition.current.y}px`;

      rafId = requestAnimationFrame(updateCursorPosition);
    };

    const handleMouseMove = (e) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseOver = () => {
      if (!isHovering.current) {
        isHovering.current = true;
        cursorRef.current.classList.add("cursor-hover");
        cursorOuterRef.current.classList.add("cursor-outer-hover");
      }
    };

    const handleMouseOut = () => {
      if (isHovering.current) {
        isHovering.current = false;
        cursorRef.current.classList.remove("cursor-hover");
        cursorOuterRef.current.classList.remove("cursor-outer-hover");
      }
    };

    // Add event listeners to the document for global cursor behavior
    const interactiveElements = document.querySelectorAll(
      "a, button, .hover-target"
    );
    interactiveElements.forEach((el) => {
      el.addEventListener("mouseover", handleMouseOver);
      el.addEventListener("mouseout", handleMouseOut);
    });

    // Update event listeners when DOM changes (e.g., after navigation)
    const observer = new MutationObserver(() => {
      const newInteractiveElements = document.querySelectorAll(
        "a, button, .hover-target"
      );
      newInteractiveElements.forEach((el) => {
        el.removeEventListener("mouseover", handleMouseOver); // Prevent duplicates
        el.removeEventListener("mouseout", handleMouseOut);
        el.addEventListener("mouseover", handleMouseOver);
        el.addEventListener("mouseout", handleMouseOut);
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener("mousemove", handleMouseMove);
    document.body.classList.add("custom-cursor-active");
    rafId = requestAnimationFrame(updateCursorPosition);

    // Cleanup on unmount (only when the component is truly unmounted)
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.body.classList.remove("custom-cursor-active");
      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseover", handleMouseOver);
        el.removeEventListener("mouseout", handleMouseOut);
      });
      observer.disconnect();
      cancelAnimationFrame(rafId);
      hasInitialized.current = false; // Reset for potential future mounts
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="custom-cursor"></div>
      <div ref={cursorOuterRef} className="custom-cursor-outer"></div>
    </>
  );
}
