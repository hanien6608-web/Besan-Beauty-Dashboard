/* Besan Beauty — موحّد لتثبيت تطبيق العميل ولوحة الإدارة */
(function () {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (isStandalone && !/admin\.html/i.test(location.pathname)) return;
  const isAdmin = /admin\.html/i.test(location.pathname);
  let installEvent = null;
  let card;
  const dismissedKey = 'besanInstallCardDismissed';
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isSafariIOS = isIOS && /safari/i.test(navigator.userAgent) && !/crios|fxios|edgios/i.test(navigator.userAgent);

  async function showCard() {
    if (card || document.getElementById('besan-install-card') || sessionStorage.getItem(dismissedKey)) return;
    if (isStandalone && isAdmin) {
      try { const reg = await navigator.serviceWorker.ready; if (await reg.pushManager.getSubscription()) return; } catch (_) {}
    }
    if (card || document.getElementById('besan-install-card')) return;
    card = document.createElement('section');
    card.id = 'besan-install-card';
    card.dir = 'rtl';
    const pitch = isStandalone
      ? 'فعّلي إشعارات الطلبات والرسائل حتى لو التطبيق مقفول 🔔'
      : (isIOS ? 'اضغطي زر المشاركة ثم «إضافة إلى الشاشة الرئيسية» عشان تثبّتي لوحة الإدارة 🌸' : 'ثبّتي لوحة الإدارة وافتحي الطلبات والرسائل أسرع من شاشتك الرئيسية 🌸');
    const showInstallBtn = !isStandalone && !isIOS;
    const showNotifyBtn = isAdmin && (isStandalone || !isIOS);
    card.innerHTML = `
      <button class="bic-close" type="button" aria-label="إغلاق">×</button>
      <div class="bic-head"><img src="logo-192.png" alt="Besan Beauty"><div><strong>Besan Beauty</strong><small>${isAdmin ? 'لوحة الإدارة' : 'جمالك أقرب ليكي في كل وقت'}</small></div></div>
      <p>${pitch}</p>
      ${showInstallBtn ? '<button class="bic-install" type="button">تثبيت التطبيق</button>' : ''}
      ${showNotifyBtn ? '<button class="bic-notify" type="button">تفعيل إشعارات الإدارة</button>' : ''}
      <small class="bic-hint" aria-live="polite"></small>`;
    const style = document.createElement('style');
    style.textContent = `
      #besan-install-card{position:fixed;z-index:2147483000;top:calc(10px + env(safe-area-inset-top,0px));left:10px;right:10px;max-width:520px;margin:0 auto;padding:12px 14px 12px 46px;background:linear-gradient(145deg,#fff 0%,#fff5f9 100%);color:#482238;border:1px solid rgba(214,45,119,.18);border-radius:16px;box-shadow:0 10px 30px rgba(80,20,48,.25);font-family:Cairo,Tahoma,sans-serif;direction:rtl;display:grid;grid-template-columns:1fr auto;align-items:center;gap:6px 12px}
      #besan-install-card *{box-sizing:border-box}
      #besan-install-card .bic-close{position:absolute;left:8px;top:8px;width:28px;height:28px;border:0;background:#f9e5ee;color:#a34a70;border-radius:50%;font-size:19px;line-height:1;cursor:pointer}
      #besan-install-card .bic-head{grid-column:1;grid-row:1;display:flex;align-items:center;gap:11px}
      #besan-install-card .bic-head img{width:40px;height:40px;object-fit:cover;border-radius:12px;border:2px solid #fff;box-shadow:0 3px 12px #d62d7740}
      #besan-install-card .bic-head strong{display:block;color:#c21d68;font-size:1rem;font-weight:900}
      #besan-install-card .bic-head small{display:block;color:#8a6478;font-size:.7rem;margin-top:2px}
      #besan-install-card p{grid-column:1/-1;grid-row:2;margin:0;font-size:.76rem;line-height:1.5;color:#684457}
      #besan-install-card .bic-install{grid-column:2;grid-row:1;width:auto;white-space:nowrap;border:0;border-radius:13px;padding:9px 16px;background:linear-gradient(135deg,#ec4b91,#c91e6c);color:#fff;font:800 .9rem Cairo,Tahoma,sans-serif;cursor:pointer;box-shadow:0 6px 16px #c91e6c30}
      #besan-install-card .bic-notify{grid-column:1/-1;width:100%;border:1px solid rgba(201,30,108,.22);border-radius:13px;padding:9px 14px;background:#fff;color:#bd286d;font:800 .82rem Cairo,Tahoma,sans-serif;cursor:pointer}
      #besan-install-card .bic-install+.bic-notify{grid-row:3}
      #besan-install-card .bic-hint{grid-column:1/-1;text-align:center;color:#9a7a8b;font-size:.7rem;line-height:1.6}
      #besan-install-card .bic-hint:empty{display:none}`;
    document.head.appendChild(style);
    document.body.appendChild(card);
    card.querySelector('.bic-close').addEventListener('click', () => { card.remove(); card = null; try { sessionStorage.setItem(dismissedKey, '1'); } catch (_) {} });
    const notifyButton = card.querySelector('.bic-notify');
    if (notifyButton) notifyButton.addEventListener('click', async () => {
      const hint = card.querySelector('.bic-hint');
      try {
        if (!('Notification' in window) || !('PushManager' in window) || !('serviceWorker' in navigator)) throw new Error('المتصفح لا يدعم الإشعارات');
        if (!window.APP_CONFIG?.VAPID_PUBLIC_KEY || window.APP_CONFIG.VAPID_PUBLIC_KEY.includes('PASTE_')) throw new Error('لسه محتاجين نضيف مفتاح الإشعارات العام في config.js');
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') throw new Error('لم يتم السماح بالإشعارات من إعدادات المتصفح');
        const registration = await navigator.serviceWorker.ready;
        const key = window.APP_CONFIG.VAPID_PUBLIC_KEY;
        const normalizedKey = key.replace(/-/g, '+').replace(/_/g, '/');
        const applicationServerKey = Uint8Array.from(atob(normalizedKey + '='.repeat((4 - normalizedKey.length % 4) % 4)), c => c.charCodeAt(0));
        const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
        const client = window.BESAN_SUPABASE || window.supabase.createClient(window.APP_CONFIG.SUPABASE_URL, window.APP_CONFIG.SUPABASE_ANON_KEY);
        const phone = localStorage.getItem('user_chat_phone') || '';
        const { error } = await client.functions.invoke('push-notifications', { body: { audience: isAdmin ? 'admin' : 'customer', phone, subscription: subscription.toJSON(), action: isAdmin ? 'test' : undefined } });
        if (error) throw error;
        hint.textContent = 'تم تفعيل الإشعارات بنجاح 💗';
        notifyButton.textContent = 'الإشعارات مفعّلة ✓';
      } catch (error) { hint.textContent = error?.message || 'تعذر تفعيل الإشعارات حاليًا'; }
    });
    const installButton = card.querySelector('.bic-install');
    if (installButton) installButton.addEventListener('click', async () => {
      const hint = card.querySelector('.bic-hint');
      if (isSafariIOS) { hint.textContent = 'من قائمة المشاركة اختاري «إضافة إلى الشاشة الرئيسية»، ثم اضغطي «إضافة».'; return; }
      if (!installEvent) { hint.textContent = 'التثبيت غير متاح حاليًا من هذا المتصفح. جرّبي فتح الموقع من Chrome أو قائمة المتصفح «تثبيت التطبيق». '; return; }
      installEvent.prompt();
      const choice = await installEvent.userChoice;
      installEvent = null;
      if (choice && choice.outcome === 'accepted') { card.remove(); card = null; }
      else hint.textContent = 'مفيش مشكلة، تقدري تثبتي التطبيق في أي وقت من هنا.';
    });
  }

  window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installEvent = event; showCard(); });
  window.addEventListener('appinstalled', () => { if (card) card.remove(); card = null; });
  window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
    setTimeout(showCard, 1800);
  });
})();
