"use client";

import { useEffect } from "react";

export function InteractiveElements() {
  useEffect(() => {
    // Smooth scrolling for anchor links
    const handleSmoothScroll = (e: Event) => {
      const target = e.target as HTMLAnchorElement;
      if (target.tagName === "A" && target.href.includes("#")) {
        const href = target.getAttribute("href");
        if (href && href.startsWith("#") && href !== "#") {
          e.preventDefault();
          const targetElement = document.querySelector(href);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }
      }
    };

    // Header background on scroll
    const handleHeaderScroll = () => {
      const header = document.querySelector("header");
      if (header) {
        if (window.scrollY > 100) {
          header.style.background = "rgb(27 58 40 / 0.98)";
          header.style.backdropFilter = "blur(20px)";
        } else {
          header.style.background = "rgb(27 58 40 / 0.95)";
          header.style.backdropFilter = "blur(12px)";
        }
      }
    };

    // Animate elements on scroll
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          element.style.opacity = "1";
          element.style.transform = "translateY(0)";
        }
      });
    }, observerOptions);

    // Initialize animations
    const animateElements = document.querySelectorAll(".animate-on-scroll");
    animateElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.opacity = "0";
      htmlElement.style.transform = "translateY(30px)";
      htmlElement.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(element);
    });

    // Add event listeners
    document.addEventListener("click", handleSmoothScroll);
    window.addEventListener("scroll", handleHeaderScroll);

    // Cleanup
    return () => {
      document.removeEventListener("click", handleSmoothScroll);
      window.removeEventListener("scroll", handleHeaderScroll);
      observer.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
}
