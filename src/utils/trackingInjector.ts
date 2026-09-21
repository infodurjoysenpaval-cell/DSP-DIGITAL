import { getStoreSettings } from './adminStore';

/**
 * Real Tracking & Pixel Script Injector
 * Injects Google Tag Manager, Facebook Pixel, TikTok Pixel, and Google Search Console
 * directly into document.head and document.body when enabled in Store Settings.
 */
export const initTrackingScripts = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const applyTracking = () => {
    const settings = getStoreSettings();

    // 1. Google Search Console Verification Meta Tag
    const existingGsc = document.getElementById('dsp-gsc-meta');
    if (existingGsc) existingGsc.remove();

    if (settings.googleSearchConsole?.enabled && settings.googleSearchConsole.metaVerification) {
      let content = settings.googleSearchConsole.metaVerification.trim();
      // If user pasted full meta tag like <meta name="google-site-verification" content="XYZ" />
      const match = content.match(/content=["'](.*?)["']/i);
      if (match && match[1]) {
        content = match[1];
      }
      const meta = document.createElement('meta');
      meta.id = 'dsp-gsc-meta';
      meta.name = 'google-site-verification';
      meta.content = content;
      document.head.appendChild(meta);
    }

    // 2. Google Tag Manager & GA4
    const staticGtmScript = document.getElementById('gtm-script');
    const existingGtmHead = document.getElementById('dsp-gtm-head');
    if (existingGtmHead) existingGtmHead.remove();
    const existingGtmBody = document.getElementById('dsp-gtm-body');
    if (existingGtmBody) existingGtmBody.remove();

    if (settings.tagManager?.enabled) {
      // Ensure dataLayer is initialized
      (window as any).dataLayer = (window as any).dataLayer || [];

      if (settings.tagManager.ecommerceDataLayer) {
        (window as any).dataLayer.push({
          event: 'dsp_store_init',
          currency: settings.shopCurrency || 'BDT',
        });
      }

      const activeGtmId = settings.tagManager.gtmId?.trim() || 'GTM-TMMCPB3C';

      // Check if index.html already has this exact GTM container running
      const isAlreadyInHtml = staticGtmScript && staticGtmScript.textContent?.includes(activeGtmId);

      // If not already in index.html, or if admin provided custom head script
      if (!isAlreadyInHtml) {
        if (settings.tagManager.headScript && settings.tagManager.headScript.trim()) {
          const container = document.createElement('div');
          container.id = 'dsp-gtm-head';
          container.innerHTML = settings.tagManager.headScript;
          const scripts = container.querySelectorAll('script');
          scripts.forEach((oldScript) => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value));
            newScript.textContent = oldScript.textContent;
            document.head.appendChild(newScript);
          });
        } else if (activeGtmId) {
          const script = document.createElement('script');
          script.id = 'dsp-gtm-head';
          script.textContent = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${activeGtmId}');`;
          document.head.appendChild(script);
        }

        if (settings.tagManager.bodyNoScript && settings.tagManager.bodyNoScript.trim()) {
          const noscriptWrapper = document.createElement('div');
          noscriptWrapper.id = 'dsp-gtm-body';
          noscriptWrapper.innerHTML = settings.tagManager.bodyNoScript;
          document.body.appendChild(noscriptWrapper);
        }
      }
    }

    // 3. Facebook (Meta) Pixel
    const existingFbHead = document.getElementById('dsp-fb-pixel');
    if (existingFbHead) existingFbHead.remove();
    const existingFbBody = document.getElementById('dsp-fb-noscript');
    if (existingFbBody) existingFbBody.remove();

    if (settings.facebookPixel?.enabled) {
      if (settings.facebookPixel.headerScript && settings.facebookPixel.headerScript.trim()) {
        const container = document.createElement('div');
        container.id = 'dsp-fb-pixel';
        container.innerHTML = settings.facebookPixel.headerScript;
        const scripts = container.querySelectorAll('script');
        scripts.forEach((oldScript) => {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value));
          newScript.textContent = oldScript.textContent;
          document.head.appendChild(newScript);
        });
      } else if (settings.facebookPixel.pixelId && settings.facebookPixel.pixelId.trim()) {
        const script = document.createElement('script');
        script.id = 'dsp-fb-pixel';
        script.textContent = `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${settings.facebookPixel.pixelId.trim()}');
fbq('track', 'PageView');`;
        document.head.appendChild(script);
      }

      if (settings.facebookPixel.bodyScript && settings.facebookPixel.bodyScript.trim()) {
        const noscriptWrapper = document.createElement('div');
        noscriptWrapper.id = 'dsp-fb-noscript';
        noscriptWrapper.innerHTML = settings.facebookPixel.bodyScript;
        document.body.appendChild(noscriptWrapper);
      }
    }

    // 4. TikTok Pixel
    const existingTtHead = document.getElementById('dsp-tiktok-pixel');
    if (existingTtHead) existingTtHead.remove();

    if (settings.tiktokPixel?.enabled) {
      if (settings.tiktokPixel.headerScript && settings.tiktokPixel.headerScript.trim()) {
        const container = document.createElement('div');
        container.id = 'dsp-tiktok-pixel';
        container.innerHTML = settings.tiktokPixel.headerScript;
        const scripts = container.querySelectorAll('script');
        scripts.forEach((oldScript) => {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value));
          newScript.textContent = oldScript.textContent;
          document.head.appendChild(newScript);
        });
      } else if (settings.tiktokPixel.pixelId && settings.tiktokPixel.pixelId.trim()) {
        const script = document.createElement('script');
        script.id = 'dsp-tiktok-pixel';
        script.textContent = `!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
  ttq.load('${settings.tiktokPixel.pixelId.trim()}');
  ttq.page();
}(window, document, 'ttq');`;
        document.head.appendChild(script);
      }
    }
  };

  // Run immediately on page mount
  applyTracking();

  // Listen for realtime settings updates from admin panel
  window.addEventListener('dsp_settings_updated', () => {
    applyTracking();
  });
};

/**
 * Triggers Meta Pixel (browser) and Meta Conversions API (CAPI) events
 */
export const trackMetaEvent = async (
  eventName: string,
  customData?: Record<string, any>,
  userData?: Record<string, any>
) => {
  if (typeof window === 'undefined') return;
  const settings = getStoreSettings();
  if (!settings.facebookPixel?.enabled) return;

  const pixelId = settings.facebookPixel.pixelId?.trim();
  const accessToken = settings.facebookPixel.accessToken?.trim();

  // 1. Browser Meta Pixel Event
  if ((window as any).fbq) {
    try {
      (window as any).fbq('track', eventName, customData || {});
    } catch (e) {
      console.warn('FB Pixel track error:', e);
    }
  }

  // 2. Conversions API (CAPI) Direct Event
  if (pixelId && accessToken) {
    try {
      const eventTime = Math.floor(Date.now() / 1000);
      const payload = {
        data: [
          {
            event_name: eventName,
            event_time: eventTime,
            action_source: 'website',
            event_source_url: window.location.href,
            user_data: {
              client_user_agent: navigator.userAgent,
              ...(userData || {}),
            },
            custom_data: customData || {},
          },
        ],
        ...(settings.facebookPixel.testEventCode ? { test_event_code: settings.facebookPixel.testEventCode } : {}),
      };

      fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch((err) => console.warn('Meta CAPI error:', err));
    } catch (err) {
      console.warn('Meta CAPI dispatch error:', err);
    }
  }
};

/**
 * Triggers Google Tag Manager dataLayer event for GA4 / eCommerce tracking
 */
export const trackGtmEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (typeof window === 'undefined') return;
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({
    event: eventName,
    ...eventParams,
  });
};

