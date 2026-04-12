/**
 * SPA navigation without a document-wide MutationObserver (major source of jank/leaks on YouTube).
 */
export function subscribeNavigation(onNavigate) {
  const fire = () => onNavigate();

  window.addEventListener("popstate", fire);

  const push = history.pushState;
  const replace = history.replaceState;

  history.pushState = function patchedPush(...args) {
    const ret = push.apply(this, args);
    fire();
    return ret;
  };

  history.replaceState = function patchedReplace(...args) {
    const ret = replace.apply(this, args);
    fire();
    return ret;
  };

  return function unsubscribeNavigation() {
    window.removeEventListener("popstate", fire);
    history.pushState = push;
    history.replaceState = replace;
  };
}
