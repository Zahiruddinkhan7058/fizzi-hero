"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

// Ensure GSAP plugins are registered
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  // Safeguard against unhandled DOM removeChild / insertBefore errors when 3rd-party
  // libraries (GSAP pin-spacers, extensions, Google Translate) reparent nodes.
  // This prevents the NotFoundError: Failed to execute 'removeChild' on 'Node'
  // during React client-side navigation.
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child && child.parentNode && child.parentNode !== this) {
      return child.parentNode.removeChild(child);
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(
    newNode: T,
    referenceNode: Node | null
  ): T {
    if (
      referenceNode &&
      referenceNode.parentNode &&
      referenceNode.parentNode !== this
    ) {
      return referenceNode.parentNode.insertBefore(newNode, referenceNode);
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };
}

export default function ClientHydrationManager() {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      // Revert all active ScrollTrigger instances on route change
      // so pinned elements are restored to their original React parents before unmounting
      try {
        ScrollTrigger.getAll().forEach((st) => {
          const trigger = st as unknown as { revert?: () => void };
          if (typeof trigger.revert === "function") {
            trigger.revert();
          }
          st.kill(true);
        });
      } catch {
        // Gracefully ignore if already cleaned up
      }

      // Reset any body background color inline styles applied by GSAP timelines
      if (prevPathRef.current === "/" && pathname !== "/") {
        if (typeof document !== "undefined" && document.body) {
          document.body.style.backgroundColor = "";
        }
      }

      prevPathRef.current = pathname;
    }
  }, [pathname]);

  return null;
}
