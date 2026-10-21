import { useEffect } from 'react';

/**
 * Spatial Navigation Hook for Android TV / Smart TV D-Pad Remotes.
 * Enables seamless Up/Down/Left/Right/OK/Back navigation using standard TV remotes.
 */
export function useTvNavigation(options?: {
  onBack?: () => boolean | void; // Return true if handled
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const isDpad = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key);
      const isSelect = key === 'Enter' || key === ' ' || e.keyCode === 13 || e.keyCode === 23; // 23 = KEYCODE_DPAD_CENTER
      const isBack = key === 'Escape' || key === 'Backspace' || key === 'GoBack' || e.keyCode === 4; // 4 = KEYCODE_BACK

      // Handle Back Button
      if (isBack) {
        if (options?.onBack) {
          const handled = options.onBack();
          if (handled) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
        }
      }

      // Handle D-Pad Navigation
      if (isDpad) {
        const focusableSelector = [
          'button:not([disabled]):not([tabindex="-1"])',
          'a[href]:not([tabindex="-1"])',
          'input:not([disabled]):not([type="hidden"]):not([tabindex="-1"])',
          'select:not([disabled]):not([tabindex="-1"])',
          '[tabindex="0"]',
          '[data-tv-nav="true"]',
        ].join(', ');

        const allFocusable = Array.from(
          document.querySelectorAll<HTMLElement>(focusableSelector)
        ).filter((el) => {
          const style = window.getComputedStyle(el);
          return (
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0' &&
            el.offsetParent !== null
          );
        });

        if (allFocusable.length === 0) return;

        const current = document.activeElement as HTMLElement | null;

        if (!current || !allFocusable.includes(current)) {
          // If no element is currently focused, focus the first one
          allFocusable[0].focus();
          e.preventDefault();
          return;
        }

        const currentRect = current.getBoundingClientRect();
        const currentCenter = {
          x: currentRect.left + currentRect.width / 2,
          y: currentRect.top + currentRect.height / 2,
        };

        let bestCandidate: HTMLElement | null = null;
        let minDistance = Infinity;

        for (const candidate of allFocusable) {
          if (candidate === current) continue;

          const candRect = candidate.getBoundingClientRect();
          const candCenter = {
            x: candRect.left + candRect.width / 2,
            y: candRect.top + candRect.height / 2,
          };

          const dx = candCenter.x - currentCenter.x;
          const dy = candCenter.y - currentCenter.y;

          let isDirectionValid = false;
          let primaryDiff = 0;
          let secondaryDiff = 0;

          if (key === 'ArrowRight') {
            isDirectionValid = dx > 5;
            primaryDiff = dx;
            secondaryDiff = Math.abs(dy);
          } else if (key === 'ArrowLeft') {
            isDirectionValid = dx < -5;
            primaryDiff = -dx;
            secondaryDiff = Math.abs(dy);
          } else if (key === 'ArrowDown') {
            isDirectionValid = dy > 5;
            primaryDiff = dy;
            secondaryDiff = Math.abs(dx);
          } else if (key === 'ArrowUp') {
            isDirectionValid = dy < -5;
            primaryDiff = -dy;
            secondaryDiff = Math.abs(dx);
          }

          if (isDirectionValid) {
            // Give preference to elements that align along the main axis
            const distance = primaryDiff + secondaryDiff * 2.5;
            if (distance < minDistance) {
              minDistance = distance;
              bestCandidate = candidate;
            }
          }
        }

        if (bestCandidate) {
          e.preventDefault();
          bestCandidate.focus();
          bestCandidate.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest',
          });
        }
      }

      // Handle Select / Click on focused element
      if (isSelect && document.activeElement) {
        const el = document.activeElement as HTMLElement;
        if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') {
          // Trigger click
          el.click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options]);
}
