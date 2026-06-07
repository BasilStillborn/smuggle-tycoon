import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

function shouldOpenExternally(anchor: HTMLAnchorElement) {
  if (!anchor.href) {
    return false;
  }

  const url = new URL(anchor.href);
  if (url.origin === window.location.origin) {
    return false;
  }

  return anchor.target === '_blank' || ['http:', 'https:'].includes(url.protocol);
}

export function installNativeExternalLinkHandler() {
  if (!Capacitor.isNativePlatform()) {
    return () => undefined;
  }

  function handleClick(event: MouseEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const anchor = target.closest('a');
    if (!anchor || !shouldOpenExternally(anchor)) {
      return;
    }

    event.preventDefault();
    void Browser.open({ url: anchor.href, presentationStyle: 'popover' });
  }

  document.addEventListener('click', handleClick);
  return () => document.removeEventListener('click', handleClick);
}
