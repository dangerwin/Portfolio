/**
 * Set up the two-image, Batman-inspired profile reveal.
 *
 * Expected HTML (the parent page owns this markup):
 *
 * <div class="profile-card" data-profile tabindex="0" role="button"
 *      aria-pressed="false" aria-label="Reveal Dan's portrait">
 *   <div class="profile-image-frame">
 *     <img class="profile-image profile-image--mask"
 *          src="./Assets/Mask.png" alt="Dan Gerwin wearing a mask">
 *     <img class="profile-image profile-image--me"
 *          src="./Assets/Me.png" alt="Dan Gerwin unmasked">
 *   </div>
 *   <div class="profile-caption">...</div>
 * </div>
 *
 * Load styles/profile.css and call setupProfile(document.querySelector('[data-profile]'))
 * from the page's existing ES-module entry point. Hover and focus give a temporary
 * preview; click, touch tap, Enter and Space toggle the persistent aria-pressed state.
 * Escape clears a persistent reveal. Returns an optional teardown function.
 */

const mountedProfiles = new WeakMap();

export function setupProfile(element) {
  if (!element || typeof element.addEventListener !== 'function') {
    return () => {};
  }

  const mounted = mountedProfiles.get(element);
  if (mounted) return mounted;

  // A non-native button needs both focusability and keyboard activation.
  const nativeButton = element.tagName === 'BUTTON';
  if (!nativeButton) {
    if (!element.hasAttribute('role')) element.setAttribute('role', 'button');
    if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '0');
  }
  if (!element.hasAttribute('aria-label') && !element.textContent.trim()) {
    element.setAttribute('aria-label', 'Reveal profile portrait');
  }

  let pinned = element.getAttribute('aria-pressed') === 'true';
  let pendingSpace = false;
  let lastPointerType = null;

  function setPinned(nextPinned) {
    pinned = Boolean(nextPinned);
    element.setAttribute('aria-pressed', String(pinned));
    element.setAttribute('aria-label', pinned ? 'Show Dan wearing a mask' : 'Reveal Dan without the mask');
  }

  function togglePinned() {
    setPinned(!pinned);
  }

  function onPointerDown(event) {
    lastPointerType = event.pointerType || 'mouse';
  }

  function onClick() {
    togglePinned();

    // Some mobile browsers retain focus after a tap. Releasing focus on the
    // second tap lets the masked image become visible again immediately.
    if (!pinned && (lastPointerType === 'touch' || lastPointerType === 'pen')) {
      element.blur?.();
    }
    lastPointerType = null;
  }

  function onKeyDown(event) {
    if (event.key === 'Escape') {
      if (pinned) {
        event.preventDefault();
        setPinned(false);
      }
      pendingSpace = false;
      return;
    }

    // Native buttons synthesize a click for Enter/Space; don't toggle twice.
    if (nativeButton || event.altKey || event.ctrlKey || event.metaKey) return;

    if (event.key === 'Enter') {
      event.preventDefault();
      if (!event.repeat) togglePinned();
    } else if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault(); // prevent page scrolling while Space is held
      if (!event.repeat) pendingSpace = true;
    }
  }

  function onKeyUp(event) {
    if (nativeButton || (event.key !== ' ' && event.key !== 'Spacebar')) return;
    if (!pendingSpace) return;
    event.preventDefault();
    pendingSpace = false;
    togglePinned();
  }

  function onBlur() {
    pendingSpace = false;
    lastPointerType = null;
  }

  setPinned(pinned);
  element.addEventListener('pointerdown', onPointerDown);
  element.addEventListener('click', onClick);
  element.addEventListener('keydown', onKeyDown);
  element.addEventListener('keyup', onKeyUp);
  element.addEventListener('blur', onBlur);

  const teardown = () => {
    element.removeEventListener('pointerdown', onPointerDown);
    element.removeEventListener('click', onClick);
    element.removeEventListener('keydown', onKeyDown);
    element.removeEventListener('keyup', onKeyUp);
    element.removeEventListener('blur', onBlur);
    mountedProfiles.delete(element);
  };

  mountedProfiles.set(element, teardown);
  return teardown;
}
