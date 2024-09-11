let trackersCache = {
  data: [],
  expiry: null
}

let seoScriptCache = {
  data: [],
  expiry: null
}

const generateGoogleAnalyticsHTML = (trackers) => {
  let html = ''

  // google_site_verification
  if (trackers.google_site_verification) {
    html += `<meta name="google-site-verification" content="${trackers.google_site_verification}" />`
  }

  // gtag
  let gtagIds = []
  if (typeof trackers.gtag_id == 'string') {
    gtagIds.push(trackers.gtag_id)
  }
  else if (Array.isArray(trackers.gtag_id)) {
    gtagIds = trackers.gtag_id
  }
  for (let i = 0; i < gtagIds.length; i++) {
    html += `
<script async src="https://www.googletagmanager.com/gtag/js?id=${gtagIds[i]}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${gtagIds[i]}');
</script>`
  }

  // gtm
  let gtmIds = []
  if (typeof trackers.gtag_manager_id == 'string') {
    gtmIds.push(trackers.gtag_manager_id)
  }
  else if (Array.isArray(trackers.gtag_manager_id)) {
    gtmIds = trackers.gtag_manager_id
  }
  for (let i = 0; i < gtmIds.length; i++) {
    html += `
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmIds[i]}');</script>`
  }

  return html
}

const generateGoogleAnalyticsBody = (trackers) => {
  let html = ''
  let gtmIds = []
  if (typeof trackers.gtag_manager_id == 'string') {
    gtmIds.push(trackers.gtag_manager_id)
  }
  else if (Array.isArray(trackers.gtag_manager_id)) {
    gtmIds = trackers.gtag_manager_id
  }
  for (let i = 0; i < gtmIds.length; i++) {
    html += `
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmIds[i]}"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`
  }

  return html
}

const generateFacebookDomainVerification = (verificationContent) => {
  return `
<meta name=facebook-domain-verification content=${verificationContent} />`
}

const generateFBPixelHTML = (pixelId) => {
  return `
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${pixelId}');
  fbq('track', 'PageView');
</script>`
}

const generateFBPixelMultiHTML = (fbPixelObjList) => {
  let fbPixelIdList = []
  fbPixelObjList.forEach((obj) => {
    for (const [key, value] of Object.entries(obj)) {
      fbPixelIdList.push(key)
    }
  })

  let fbPixelMultiHeadHtml = `
    <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');`
  fbPixelIdList.forEach(e => {
    fbPixelMultiHeadHtml += `
    fbq('init', '${e}');`
  })

  fbPixelMultiHeadHtml += `
    fbq('track', 'PageView');
    </script>
  `
  fbPixelMultiHeadHtml += `<script>window.fbPixelsList=${JSON.stringify(fbPixelObjList)}</script>`

  return fbPixelMultiHeadHtml
}

const generateFBPixelMultiBody = (fbPixelObjList) => {
  let fbPixelIdList = []
  fbPixelObjList.forEach((obj) => {
    for (const [key, value] of Object.entries(obj)) {
      fbPixelIdList.push(key)
    }
  })

  let fbPixelMultiBodyHtml = ``
  fbPixelIdList.forEach(e => {
    fbPixelMultiBodyHtml += `<noscript><img height=1 width=1 style=display:none src=https://www.facebook.com/tr?id=${e}&ev=PageView&noscript=1/></noscript>`
  })

  return fbPixelMultiBodyHtml

}

const generateTiktokAnalyticsHTML = (tiktokId) => {
  return `
<script>
	!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++
  )ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=i+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
  ttq.load('${tiktokId}');
  ttq.page();
  }(window, document, 'ttq');
</script>`
}

const generateHotjarHTML = (hotjarId) => {
  return `
<script>
  (function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:${hotjarId},hjsv:6};
    a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');r.async=1;
    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    a.appendChild(r);
  })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
</script>`
}


const generateQPixel = (qPixelId) => {
  return `
<script type="text/javascript">
window._qevents = window._qevents || [];
(function() {
    var elem = document.createElement('script');
    elem.src = (document.location.protocol == "https:" ? "https://secure" : "http://edge") + ".quantserve.com/quant.js";
    elem.async = true;
    elem.type = "text/javascript";
    var scpt = document.getElementsByTagName('script')[0];
    scpt.parentNode.insertBefore(elem, scpt);
})();

window._qevents.push({
    qacct:"${qPixelId}",
    labels:"_fp.event.PageView"
});
</script>`
}

const saveQPixels = (qPixelList) => {
  try {
    return `
<script>window.qPixelsList=${JSON.stringify(qPixelList)}</script>
`
  }
  catch (err) {
    return ''
  }
}

const generateKayzenTracker = (kayzenApiKey) => {
  return `
<script>ktag=function(){ktag.q.push(arguments);};ktag.q=[];</script>
<script async src="https://webevents.eventstracker.io/webevents.js" data-api-
key="${kayzenApiKey}"></script>`
}

const generateUnphionetorTracker = (unphionetorPath) => {
  return `
  <div id='m3_tracker_' style='position: absolute; left: 0px; top: 0px; visibility: hidden;'><img src='//unphionetor.com/${unphionetorPath}'></div>`
}

const generateAppsFlyerHTML = (devKey) => {
  return `
<script>
  !function(t,e,n,s,a,c,i,o,p){t.AppsFlyerSdkObject=a,t.AF=t.AF||function(){
  (t.AF.q=t.AF.q||[]).push([Date.now()].concat(Array.prototype.slice.call(arguments)))},
  t.AF.id=t.AF.id||i,t.AF.plugins={},o=e.createElement(n),p=e.getElementsByTagName(n)[0],o.async=1,
  o.src="https://websdk.appsflyer.com?"+(c.length>0?"st="+c.split(",").sort().join(",")+"&":"")+(i.length>0?"af_id="+i:""),
  p.parentNode.insertBefore(o,p)}(window,document,"script",0,"AF","pba",{pba: {webAppId: "${devKey}"} })
</script>`
}

const generateStylvealsfolveroes = () => {
  return `
    <meta http-equiv="delegate-ch" content="sec-ch-ua https://stylvealsfolveroes.com; sec-ch-ua-mobile https://stylvealsfolveroes.com; sec-ch-ua-arch https://stylvealsfolveroes.com; sec-ch-ua-model https://stylvealsfolveroes.com; sec-ch-ua-platform https://stylvealsfolveroes.com; sec-ch-ua-platform-version https://stylvealsfolveroes.com; sec-ch-ua-bitness https://stylvealsfolveroes.com; sec-ch-ua-full-version-list https://stylvealsfolveroes.com; sec-ch-ua-full-version https://stylvealsfolveroes.com"><style>.dtpcnt{opacity: 0;}</style>
    <script>
      (function(c,d,f,h,t,b,n,u,k,l,m,e,p,v,q){function r(a){var c=d.cookie.match(new RegExp("(^| )"+a+"=([^;]+)"));return c?c.pop():f.getItem(a+"-expires")&&+f.getItem(a+"-expires")>(new Date).getTime()?f.getItem(a):null}q="https:"===c.location.protocol?"secure; ":"";c[b]||(c[b]=function(a){c[b].state.callbackQueue.push(a)},c[b].state={callbackQueue:[]},c[b].registerConversion=function(a){c[b].state.callbackQueue.push(a)},function(){(m=/[?&]cpid(=([^&#]*)|&|#|$)/.exec(c.location.href))&&m[2]&&(e=m[2],
    p=r("vl-"+e));var a=r("vl-cid"),b;"savedCid"!==u||!a||e&&"undefined"!==typeof e||(b=a);k=d.createElement("script");l=d.scripts[0];k.src=n+(-1===n.indexOf("?")?"?":"&")+"oref="+h(d.referrer)+"&ourl="+h(location[t])+"&opt="+h(d.title)+"&vtm="+(new Date).getTime()+(b?"&cid="+b:"")+(p?"&uw=no":"");l.parentNode.insertBefore(k,l);if(e){a="vl-"+e;b=q;var g=new Date;g.setTime(g.getTime()+864E5);d.cookie=a+"=1; "+b+"samesite=Strict; expires="+g.toGMTString()+"; path=/";f.setItem(a,"1");f.setItem(a+"-expires",
    g.getTime())}}())})(window,document,localStorage,encodeURIComponent,"href","dtpCallback","https://stylvealsfolveroes.com/d/.js","savedCid");
    </script>
    <noscript><link href="https://stylvealsfolveroes.com/d/.js?noscript=true&ourl=" rel="stylesheet"/></noscript>
  `
}

const generateOperaAnalyticsHTML = (operaId) => {
  return `
    <script>
      !(function(p,l,o,w,i,n,g){if(!p[i]){p.GlobalSnowplowNamespace=p.GlobalSnowplowNamespace||[];p.GlobalSnowplowNamespace.push(i);p[i]=function(){(p[i].q=p[i].q||[]).push(arguments)};p[i].q=p[i].q||[];n=l.createElement(o);g=l.getElementsByTagName(o)[0];n.async=1;n.src=w;g.parentNode.insertBefore(n,g)}})(window,document,"script","//res-odx.op-mobile.opera.com/sp.js","otag");
      
      otag('init', '${operaId}')

    </script>
  `
}

const generateCidTracker = (trackUrl) => {
  return `
    <meta http-equiv="delegate-ch" content="sec-ch-ua ${trackUrl}; sec-ch-ua-mobile ${trackUrl}; sec-ch-ua-arch ${trackUrl}; sec-ch-ua-model ${trackUrl}; sec-ch-ua-platform ${trackUrl}; sec-ch-ua-platform-version ${trackUrl}; sec-ch-ua-bitness ${trackUrl}; sec-ch-ua-full-version-list ${trackUrl}; sec-ch-ua-full-version ${trackUrl}"><style>.dtpcnt{opacity: 0;}</style>
    <script>
        (function(d,c,k,l,r,t,g,u,A,e,m,v,B,a,n,p,h,q,w,D,x){function y(){for(var f=c.querySelectorAll(".dtpcnt"),b=0,a=f.length;b<a;b++)f[b][u]=f[b][u].replace(/(^|\s+)dtpcnt($|\s+)/g,"")}function C(a,b,d,e){var f=new Date;f.setTime(f.getTime()+(e||864E5));c.cookie=a+"="+b+"; "+d+"samesite=Strict; expires="+f.toGMTString()+"; path=/";k.setItem(a,b);k.setItem(a+"-expires",f.getTime())}function z(a){var b=c.cookie.match(new RegExp("(^| )"+a+"=([^;]+)"));return b?b.pop():k.getItem(a+"-expires")&&+k.getItem(a+
    "-expires")>(new Date).getTime()?k.getItem(a):null}x="https:"===d.location.protocol?"secure; ":"";d[e](d[e]=function(){(d[e].q=d[e].q[]).push(arguments)},p=c[r],c[r]=function(){p&&p.apply(this,arguments);if(d[e]&&!d[e].hasOwnProperty("params")&&/loaded|interactive|complete/.test(c.readyState))for(;a=c[t][m++];)/\/?click\/?($|(\/[0-9]+)?$)/.test(a.pathname)&&(a[g]="javascrip"+d.postMessage.toString().slice(4,5)+":"+e+'.l="'+a[g]+'",void 0')},setTimeout(function(){(q=/[?&]cpid(=([^&#]*)|&|#|$)/.exec(d.location.href))&&
    q[2]&&(h=q[2],w=z("vl-"+h));var f=z("vl-cep"),b=location[g];if("savedCep"===B&&f&&(!h||"undefined"===typeof h)&&0>b.indexOf("cep=")){var e=-1<b.indexOf("?")?"&":"?";b+=e+f}a=c.createElement("script");n=c.scripts[0];a.defer=1;a.src=v+(-1===v.indexOf("?")?"?":"&")+"lpref="+l(c.referrer)+"&lpurl="+l(b)+"&lpt="+l(c.title)+"&vtm="+(new Date).getTime()+(w?"&uw=no":"");a[A]=function(){for(m=0;a=c[t][m++];)/dtpCallback\.l/.test(a[g])&&(a[g]=decodeURIComponent(a[g]).match(/dtpCallback\.l="([^"]+)/)[1]);y()};
    n.parentNode.insertBefore(a,n);h&&C("vl-"+h,"1",x)},0),setTimeout(y,7E3))})(window,document,localStorage,encodeURIComponent,"onreadystatechange","links","href","className","onerror","dtpCallback",0,"${trackUrl}/d/.js","savedCep");
    </script>
    <noscript><link href="${trackUrl}/d/.js?noscript=true&lpurl=" rel="stylesheet"/></noscript>
  `
}

const saveFloodLightIds = (floodLightIdList) => {
  try {
    return `
<script>window.floodLightIds=${JSON.stringify(floodLightIdList)}</script>
`
  }
  catch (err) {
    return ''
  }
}

const generateoneSignalScript = (initObj) => {
  return `
<script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
<script>
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.init(${initObj});
  });
</script>`
}

const decodeHtmlEntities = (script) => {
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x2F;': '/',
    '&#x5C;': '\\',
    '&#96;': '`'
  };
  
  return script.replace(/&[^\s]*?;/g, match => entities[match] || match);
}


export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', async (html, { event }) => {
    const { host, pathname } = getRequestURL(event)
    const config = useRuntimeConfig()
    const query = getQuery(event)

    let matchLocale = config.public.DEFAULT_LOCALE;
    const urlLocale = pathname.split('/')[1]
    const locales = config.LOCALES.map(e => e.code)
    if (locales.includes(urlLocale)) {
      matchLocale = urlLocale
    }

    const matchDomain = host.replace('www.', '')

    let customTrackers = config.TRACKERS.custom ? config.TRACKERS.custom : []

    // fetch s3 trackers
    if (!trackersCache.expiry == null || Date.now() > trackersCache.expiry) {
      try {
        let res = await $fetch(`${config.public.PUBLIC_FE_BUCKET}backend/${config.public.ENV}/event_tracking/event_tracking_list.json.gz`, { parseResponse: JSON.parse })
        if (Array.isArray(res) && res.length > 0) {
          // combine env trackers into s3 trackers, and cache them
          // WARNING: cannot customTrackers = [...res, ...trackersCache.data], as it will just overwrite s3 trackers
          // need to deep merge manually
          customTrackers.forEach(c => {
            const matchEntry = res.find(rc => rc.domain == c.domain)
            if (!matchEntry) { // domain not found in s3 trackers, push env tracker into s3 trackers
              res.push(c)
            }
            else { // domain exists in both env and s3, deep merge them

              // safe check
              if (typeof matchEntry.trackers != 'object') {
                matchEntry.trackers = {}
              }
              if (typeof c.trackers != 'object') {
                c.trackers = {}
              }

              /* deep merge start */
              Object.keys(matchEntry.trackers).forEach(t => {
                if (typeof matchEntry.trackers[t] == 'string') { // convert tracker to array if it's a string
                  matchEntry.trackers[t] = [matchEntry.trackers[t]]
                }
                if (typeof c.trackers[t] == 'string') {
                    matchEntry.trackers[t].push(c.trackers?.[t])
                }
                else if (Array.isArray(c.trackers[t])) {
                  matchEntry.trackers[t] = [...matchEntry.trackers[t], ...c.trackers[t]]
                }
              })

              Object.keys(c.trackers).forEach(t => {
                if (!matchEntry.trackers[t]) {
                  matchEntry.trackers[t] = c.trackers[t]
                }
              })
              /* deep merge end */
            }
          })
          
          trackersCache.data = res
          customTrackers = trackersCache.data
        }
        else {
          trackersCache.data = customTrackers
        }
      }
      catch(err) {}
      finally {
        trackersCache.expiry = Date.now() + 600000 // cache for 10 minute
        trackersCache.data = customTrackers
      }
    }
    else {
      customTrackers = trackersCache.data
    }

    // fetch s3 seo scripts
    let seoScripts = config?.SEO_SCRIPTS ? config.SEO_SCRIPTS : []

    if (!seoScriptCache.expiry == null || Date.now() > seoScriptCache.expiry) {
      try {
        let res2 = await $fetch(`${config.public.PUBLIC_FE_BUCKET}backend/${config.public.ENV}/seo/seo_script.json`)
        if (Array.isArray(res2) && res2.length > 0) {
          // combine env SEO scripts into s3 SEO scripts, and cache them
          // WARNING: cannot seoScripts = [...res2, ...seoScriptCache.data], as it will just overwrite s3 SEO scripts
          seoScripts.forEach(c => {
            const matchEntry = res2.find(rc => rc.language == c.language)
            if (!matchEntry) { // language not found in s3 SEO scripts, push env tracker into s3 SEO scripts
              res2.push(c)
            }
          })
          
          seoScriptCache.data = res2
          seoScripts = seoScriptCache.data
        }
        else {
          seoScriptCache.data = seoScripts
        }
      }
      catch(err) {}
      finally {
        seoScriptCache.expiry = Date.now() + 600000 // cache for 10 minute
        seoScriptCache.data = seoScripts
      }
    }
    else {
      seoScripts = seoScriptCache.data
    }

    // facebook domain verification
    let fbVerificationContent = []
    if (typeof config.TRACKERS.facebook_domain_verification == 'object' && config.TRACKERS.apply_to_all.facebook_domain_verification) {
    }
    else if (matchDomain) {
      customTrackers.forEach(entry => {
        if ((matchDomain == entry.domain) && entry.trackers.facebook_domain_verification) {
          if (typeof entry.trackers.facebook_domain_verification == 'string') {
            fbVerificationContent.push(entry.trackers.facebook_domain_verification)
          }
          else if (Array.isArray(entry.trackers.facebook_domain_verification)) {
            fbVerificationContent = entry.trackers.facebook_domain_verification
          }
        }
      })
    }
    for (let i = 0; i < fbVerificationContent.length; i++) {
      html.head.push(generateFacebookDomainVerification(fbVerificationContent[i]))
    }

    // Cid Tracker 
    let cidTrackBool = false
    let cidTrackUrl = ''
    if (typeof config.TRACKERS.apply_to_all == 'object' && config.TRACKERS.apply_to_all.track_cid) {
      if (typeof config.TRACKERS.apply_to_all.track_cid.enable == 'boolean' && config.TRACKERS.apply_to_all.track_cid.enable == true) {
        cidTrackBool = true
        cidTrackUrl = config.TRACKERS.apply_to_all.track_cid.track_url
      }
    }
    else if (matchDomain) {
      customTrackers.forEach(entry => {
        if ((matchDomain == entry.domain) && entry.trackers.track_cid) {
          if (typeof entry.trackers.track_cid.enable == 'boolean' && entry.trackers.track_cid.enable == true) {
            cidTrackBool = true
            cidTrackUrl = entry.trackers.track_cid.track_url
          }
        }
      })
    }

    if (cidTrackBool) {
      html.head.push(generateCidTracker(cidTrackUrl))
    }


    /* trackers & analytics */
    if (typeof config.PVT_TRACKERS.apply_to_all == 'object') {
      // google
      html.head.push(generateGoogleAnalyticsHTML(config.PVT_TRACKERS.apply_to_all))
      html.bodyPrepend.push(generateGoogleAnalyticsBody(config.PVT_TRACKERS.apply_to_all))
    }

    if (typeof config.TRACKERS.apply_to_all == 'object') {
      // google
      html.head.push(generateGoogleAnalyticsHTML(config.TRACKERS.apply_to_all))
      html.bodyPrepend.push(generateGoogleAnalyticsBody(config.TRACKERS.apply_to_all))
    }
    else if (matchDomain) {
      customTrackers.forEach(entry => {
        if (matchDomain == entry.domain) {
          html.head.push(generateGoogleAnalyticsHTML(entry.trackers))
          html.bodyPrepend.push(generateGoogleAnalyticsBody(entry.trackers))
        }
      })
    }

    // facebook pixel
    let pixelIdList = []
    if (typeof config.TRACKERS.apply_to_all == 'object' && config.TRACKERS.apply_to_all.fb_pixel) {
      if (typeof config.TRACKERS.apply_to_all.fb_pixel == 'string') {
        pixelIdList.push(config.TRACKERS.apply_to_all.fb_pixel)
        setCookie(event, 'fb_dynamic_pixel', config.TRACKERS.apply_to_all.fb_pixel)
      }
      else if (Array.isArray(config.TRACKERS.apply_to_all.fb_pixel)) {
        pixelIdList = config.TRACKERS.apply_to_all.fb_pixel
        setCookie(event, 'fb_dynamic_pixel', config.TRACKERS.apply_to_all.fb_pixel[0])
      }
    }
    else if (matchDomain) {
      customTrackers.forEach(entry => {
        if ((matchDomain == entry.domain) && entry.trackers.fb_pixel) {
          if (typeof entry.trackers.fb_pixel == 'string') {
            pixelIdList.push(entry.trackers.fb_pixel)
            setCookie(event, 'fb_dynamic_pixel', entry.trackers.fb_pixel)
          }
          else if (Array.isArray(entry.trackers.fb_pixel)) {
            pixelIdList = entry.trackers.fb_pixel
            setCookie(event, 'fb_dynamic_pixel', entry.trackers.fb_pixel[0])
          }
        }
      })
    }
    else if (query.fb_dynamic_pixel) {
      pixelIdList.push(query.fb_dynamic_pixel)
      setCookie(event, 'fb_dynamic_pixel', query.fb_dynamic_pixel)
    }
    else {
      let pixelIdCookie = getCookie(event, 'fb_dynamic_pixel')
      if (pixelIdCookie) {
        pixelIdList.push(pixelIdCookie)
      }
    }

    for (let i = 0; i < pixelIdList.length; i++) {
      html.head.push(generateFBPixelHTML(pixelIdList[i]))
    }
    // Tiktok
    let tiktokIdList = []
    if (typeof config.PVT_TRACKERS.apply_to_all == 'object' && config.PVT_TRACKERS.apply_to_all.tiktok_id) {
      if (typeof config.PVT_TRACKERS.apply_to_all.tiktok_id == 'string') {
        tiktokIdList.push(config.PVT_TRACKERS.apply_to_all.tiktok_id)
        // setCookie(event, 'fb_dynamic_pixel', config.PVT_TRACKERS.apply_to_all.tiktok_id)
      }
      else if (Array.isArray(config.PVT_TRACKERS.apply_to_all.tiktok_id)) {
        tiktokIdList = config.PVT_TRACKERS.apply_to_all.tiktok_id
        // setCookie(event, 'fb_dynamic_pixel', config.PVT_TRACKERS.apply_to_all.tiktok_id[0])
      }
    }

    for (let i = 0; i < tiktokIdList.length; i++) {
      html.head.push(generateTiktokAnalyticsHTML(tiktokIdList[i]))
    }

    /* Q Pixel */
    let qPixelList = []
    if (typeof config.TRACKERS.apply_to_all == 'object' && config.TRACKERS.apply_to_all.q_pixel) {
      if (typeof config.TRACKERS.apply_to_all.q_pixel == 'string') {
        qPixelList.push(config.TRACKERS.apply_to_all.q_pixel)
      }
      else if (Array.isArray(config.TRACKERS.apply_to_all.q_pixel)) {
        qPixelList = config.TRACKERS.apply_to_all.q_pixel
      }
    }
    else if (matchDomain) {
      customTrackers.forEach(entry => {
        if ((matchDomain == entry.domain) && entry.trackers.q_pixel) {
          if (typeof entry.trackers.q_pixel == 'string') {
            qPixelList.push(entry.trackers.q_pixel)
          }
          else if (Array.isArray(entry.trackers.q_pixel)) {
            qPixelList = entry.trackers.q_pixel
          }
        }
      })
    }

    for (let i = 0; i < qPixelList.length; i++) {
      html.head.push(generateQPixel(qPixelList[i]))
    }

    html.head.push(saveQPixels(qPixelList))

    /* Kayzen */
    let kayzenList = []
    if (typeof config.TRACKERS.apply_to_all == 'object' && config.TRACKERS.apply_to_all.kayzen_api_key) {
      if (typeof config.TRACKERS.apply_to_all.kayzen_api_key == 'string') {
        kayzenList.push(config.TRACKERS.apply_to_all.kayzen_api_key)
      }
      else if (Array.isArray(config.TRACKERS.apply_to_all.kayzen_api_key)) {
        kayzenList = config.TRACKERS.apply_to_all.kayzen_api_key
      }
    }
    else if (matchDomain) {
      customTrackers.forEach(entry => {
        if ((matchDomain == entry.domain) && entry.trackers.kayzen_api_key) {
          if (typeof entry.trackers.kayzen_api_key == 'string') {
            kayzenList.push(entry.trackers.kayzen_api_key)
          }
          else if (Array.isArray(entry.trackers.kayzen_api_key)) {
            kayzenList = entry.trackers.kayzen_api_key
          }
        }
      })
    }

    for (let i = 0; i < kayzenList.length; i++) {
      html.head.push(generateKayzenTracker(kayzenList[i]))
    }

    /* Facebook Pixel Multi */
    let fbPixelObjList = []
    if (typeof config.TRACKERS.apply_to_all == 'object' && config.TRACKERS.apply_to_all.fb_pixel_multi) {
      if (Array.isArray(config.TRACKERS.apply_to_all.fb_pixel_multi)) {
        fbPixelObjList = config.TRACKERS.apply_to_all.fb_pixel_multi
      }
    }
    else if (matchDomain) {
      customTrackers.forEach(entry => {
        if ((matchDomain == entry.domain) && entry.trackers.fb_pixel_multi) {
          if (Array.isArray(entry.trackers.fb_pixel_multi)) {
            fbPixelObjList = entry.trackers.fb_pixel_multi
          }
        }
      }) 
    }

    if (fbPixelObjList.length > 0) {
      html.head.push(generateFBPixelMultiHTML(fbPixelObjList))
      html.bodyPrepend.push(generateFBPixelMultiBody(fbPixelObjList))
    }

    // unphionetor
    let unphionetorList = []
    if (typeof config.TRACKERS.apply_to_all == 'object' && config.TRACKERS.apply_to_all.unphionetor) {
      if (typeof config.TRACKERS.apply_to_all.unphionetor == 'string') {
        unphionetorList.push(config.TRACKERS.apply_to_all.unphionetor)
      }
      else if (Array.isArray(config.TRACKERS.apply_to_all.unphionetor)) {
        unphionetorList = config.TRACKERS.apply_to_all.unphionetor
      }
    }
    else if (matchDomain) {
      customTrackers.forEach(entry => {
        if ((matchDomain == entry.domain) && entry.trackers.unphionetor) {
          if (typeof entry.trackers.unphionetor == 'string') {
            unphionetorList.push(entry.trackers.unphionetor)
          }
          else if (Array.isArray(entry.trackers.unphionetor)) {
            unphionetorList = entry.trackers.unphionetor
          }
        }
      })
    }

    for (let i = 0; i < unphionetorList.length; i++) {
      html.head.push(generateUnphionetorTracker(unphionetorList[i]))
    }


    // appsflyer
    if (query.app && query.dev_key && query.appsflyer_id) {
      setCookie(event, 'appsflyer_dev_key', query.dev_key)
    }
    const appsFlyerCookie = query.dev_key || getCookie(event, 'appsflyer_dev_key')
    if (appsFlyerCookie) {
      html.head.push(generateAppsFlyerHTML(appsFlyerCookie))
    }

    // hotjar
    let hotjarList = []
    if (typeof config.TRACKERS.apply_to_all == 'object' && config.TRACKERS.apply_to_all.hotjar_id) {
      if (typeof config.TRACKERS.apply_to_all.hotjar_id == 'string') {
        hotjarList.push(config.TRACKERS.apply_to_all.hotjar_id)
      }
      else if (Array.isArray(config.TRACKERS.apply_to_all.hotjar_id)) {
        hotjarList = config.TRACKERS.apply_to_all.hotjar_id
      }
    }
    else if (matchDomain) {
      customTrackers.forEach(entry => {
        if ((matchDomain == entry.domain) && entry.trackers.hotjar_id) {
          if (typeof entry.trackers.hotjar_id == 'string') {
            hotjarList.push(entry.trackers.hotjar_id)
          }
          else if (Array.isArray(entry.trackers.hotjar_id)) {
            hotjarList = entry.trackers.hotjar_id
          }
        }
      })
    }
    for (let i = 0; i < hotjarList.length; i++) {
      html.head.push(generateHotjarHTML(hotjarList[i]))
    }

    // stylvealsfolveroes
    if (['siam66'].includes(config.public.MERCHANT) && config.public.ENV != 'production') {
      html.head.push(generateStylvealsfolveroes())
    }

    // opera
    let operaIdList = []
    if (typeof config.TRACKERS.apply_to_all == 'object' && config.TRACKERS.apply_to_all.opera_id) {
      if (typeof config.TRACKERS.apply_to_all.opera_id == 'string') {
        operaIdList.push(config.TRACKERS.apply_to_all.opera_id)
      }
      else if (Array.isArray(config.TRACKERS.apply_to_all.opera_id)) {
        operaIdList = config.TRACKERS.apply_to_all.opera_id
      }
    }
    else if (matchDomain) {
      customTrackers.forEach(entry => {
        if ((matchDomain == entry.domain) && entry.trackers.opera_id) {
          if (typeof entry.trackers.opera_id == 'string') {
            operaIdList.push(entry.trackers.opera_id)
          }
          else if (Array.isArray(entry.trackers.opera_id)) {
            operaIdList = entry.trackers.opera_id
          }
        }
      })
    }

    for (let i = 0; i < operaIdList.length; i++) {
      html.head.push(generateOperaAnalyticsHTML(operaIdList[i]))
    }

    /* floodlight */
    let floodLightIdList = []
    if (typeof config.TRACKERS.apply_to_all == 'object' && config.TRACKERS.apply_to_all.floodlight) {
      if (typeof config.TRACKERS.apply_to_all.floodlight == 'string') {
        floodLightIdList.push(config.TRACKERS.apply_to_all.floodlight)
      }
      else if (Array.isArray(config.TRACKERS.apply_to_all.floodlight)) {
        floodLightIdList = config.TRACKERS.apply_to_all.floodlight
      }
    }
    else if (matchDomain) {
      customTrackers.forEach(entry => {
        if ((matchDomain == entry.domain) && entry.trackers.floodlight) {
          if (typeof entry.trackers.floodlight == 'string') {
            floodLightIdList.push(entry.trackers.floodlight)
          }
          else if (Array.isArray(entry.trackers.floodlight)) {
            floodLightIdList = entry.trackers.floodlight
          }
        }
      })
    }

    html.head.push(saveFloodLightIds(floodLightIdList))

     // one signal
     let oneSignalInits = []
     if (typeof config.TRACKERS.apply_to_all == 'object' && config.TRACKERS.apply_to_all.one_signal) {
       if (typeof config.TRACKERS.apply_to_all.one_signal == 'string') {
         oneSignalInits.push(config.TRACKERS.apply_to_all.one_signal)
       }
       else if (Array.isArray(config.TRACKERS.apply_to_all.one_signal)) {
         oneSignalInits = config.TRACKERS.apply_to_all.one_signal
       }
     }
     if (matchDomain) {
       customTrackers.forEach(entry => {
         if ((matchDomain == entry.domain) && entry.trackers.one_signal) {
           if (typeof entry.trackers.one_signal == 'string') {
             oneSignalInits.push(entry.trackers.one_signal)
           }
           else if (Array.isArray(entry.trackers.one_signal)) {
             oneSignalInits = entry.trackers.one_signal
           }
         }
       })
     }
 
     for (let i = 0; i < oneSignalInits.length; i++) {
       html.head.push(generateoneSignalScript(oneSignalInits[i]))
     }

    seoScripts.forEach(entry => {
      if (matchLocale == entry.language) {
        if (entry.header_script) html.head.push(decodeHtmlEntities(entry.header_script));
        if (entry.homepage_script) html.bodyPrepend.push(decodeHtmlEntities(entry.homepage_script));
      }
    })

    // stupid hard code for jw8
    if (matchDomain == 'amaizingwool.com') {
      html.head.push(`
<link rel="amphtml" href="https://Jw8santay.lat" />
<script type="application/ld+json">
    {
        "@context": "http://schema.org",
        "@graph": [
            {
                "@type": "WebPage",
                "author": { "@id": "https://amaizingwool.com/id-id/#identity" },
                "copyrightHolder": { "@id": "https://amaizingwool.com/id-id/#identity" },
                "copyrightYear": "2024",
                "creator": { "@id": "https://amaizingwool.com/id-id/#creator" },
                "datePublished": "2024-04-09T08:30:00Z",
                "description": "JW8 | JW8 adalah situs judi slot online terpercaya yang memiliki ribuan pemain slot online aktif setiap hari dengan persentasi jackpot tertinggi, banyak bonus dan pasti bayar",
                "headline": "JW8 : Daftar Situs Judi Terbesar dan Terpercaya 2024",
                "image": { "@type": "ImageObject", "url": "https://jw8-public.s3-accelerate.amazonaws.com/backend/production/member_site/192x192_favicon.png" },
                "inLanguage": "id",
                "mainEntityOfPage": "https://amaizingwool.com/id-id/",
                "name": "JW8 : Daftar Situs Judi Terbesar dan Terpercaya 2024",
                "publisher": { "@id": "https://amaizingwool.com/id-id/#creator" },
                "url": "https://amaizingwool.com/id-id/"
            },
            { "@id": "https://amaizingwool.com/id-id/#organization", "@type": "Organization" },
            { "@type": "BreadcrumbList", "description": "Breadcrumbs list", "itemListElement": [{ "@type": "ListItem", "item": "https://amaizingwool.com/id-id/", "name": "JW8", "position": 1 }], "name": "Breadcrumbs" }
        ]
    }
</script>
<script type="application/ld+json">
    {
        "@context": "http://schema.org",
        "@type": "AboutPage",
        "mainEntityOfPage": { "@type": "WebPage", "@id": "https://amaizingwool.com/id-id/" },
        "url": "https://amaizingwool.com/id-id/",
        "headline": "JW8 : Daftar Situs Judi Terbesar dan Terpercaya 2024",
        "image": { "@type": "ImageObject", "url": "https://jw8-public.s3-accelerate.amazonaws.com/backend/production/member_site/192x192_favicon.png", "width": 696, "height": "200" },
        "publisher": {
            "@type": "Organization",
            "@id": "https://amaizingwool.com/id-id/#organization",
            "name": "JW8 : Daftar Situs Judi Terbesar dan Terpercaya 2024",
            "logo": { "@type": "ImageObject", "url": "https://jw8-public.s3-accelerate.amazonaws.com/backend/production/member_site/192x192_favicon.png", "width": 600, "height": 60 }
        },
        "description": "JW8 | JW8 adalah situs judi slot online terpercaya yang memiliki ribuan pemain slot online aktif setiap hari dengan persentasi jackpot tertinggi, banyak bonus dan pasti bayar"
    }
</script>`)
    }
  })
})