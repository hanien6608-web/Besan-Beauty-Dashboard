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

  function showCard() {
    if (card || (!isStandalone && sessionStorage.getItem(dismissedKey))) return;
    card = document.createElement('section');
    card.id = 'besan-install-card';
    card.dir = 'rtl';
    card.innerHTML = `
      <button class="bic-close" type="button" aria-label="إغلاق">×</button>
      <div class="bic-head"><img src="logo-192.png" alt="Besan Beauty"><div><strong>Besan Beauty</strong><small>${isAdmin ? 'تجربة إدارة أسهل وأسرع' : 'جمالك أقرب ليكي في كل وقت'}</small></div></div>
      <p>${isStandalone ? 'فعّلي إشعارات لوحة الإدارة لاستقبال الطلبات والرسائل حتى عند إغلاق التطبيق.' : (isAdmin ? 'ثبّتي لوحة الإدارة على جهازك للوصول السريع للطلبات والرسائل.' : 'ثبّتي تطبيق Besan Beauty واستمتعي بتجربة تسوق أسهل وأسرع 🌸')}</p>
      ${isStandalone ? '' : '<button class="bic-install" type="button">تثبيت التطبيق</button>'}
      ${isAdmin ? '<button class="bic-notify" type="button">تفعيل إشعارات الإدارة</button>' : ''}
      <small class="bic-hint" aria-live="polite">${isSafariIOS ? 'اضغطي مشاركة ثم «إضافة إلى الشاشة الرئيسية».' : 'هيظهر تأكيد التثبيت الرسمي من المتصفح.'}</small>`;
    const style = document.createElement('style');
    style.textContent = `
      #besan-install-card{position:fixed;z-index:2147483000;left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));max-width:390px;margin:auto;padding:17px 18px 14px;background:linear-gradient(145deg,#fff 0%,#fff5f9 100%);color:#482238;border:1px solid rgba(214,45,119,.18);border-radius:22px;box-shadow:0 14px 42px rgba(80,20,48,.2);font: Cairo,Tahoma,sans-serif;direction:rtl;animation:bic-in .35s ease both}
      #besan-install-card *{box-sizing:border-box}#besan-install-card .bic-head{display:flex;align-items:center;gap:11px;padding-left:28px}#besan-install-card .bic-head img{width:48px;height:48px;object-fit:cover;border-radius:14px;border:2px solid #fff;box-shadow:0 3px 12px #d62d7740}#besan-install-card .bic-head strong{display:block;color:#c21d68;font-size:1rem;font-weight:900}#besan-install-card .bic-head small{display:block;color:#8a6478;font-size:.75rem;margin-top:2px}#besan-install-card p{font-size:.83rem;line-height:1.8;margin:12px 0;color:#684457}#besan-install-card .bic-install{width:100%;border:0;border-radius:13px;padding:11px 14px;background:linear-gradient(135deg,#ec4b91,#c91e6c);color:#fff;font:800 .9rem Cairo,Tahoma,sans-serif;cursor:pointer;box-shadow:0 6px 16px #c91e6c30}#besan-install-card .bic-notify{width:100%;margin-top:8px;border:1px solid rgba(201,30,108,.22);border-radius:13px;padding:9px 14px;background:#fff;color:#bd286d;font:800 .82rem Cairo,Tahoma,sans-serif;cursor:pointer}#besan-install-card .bic-hint{display:block;text-align:center;color:#9a7a8b;font-size:.68rem;margin-top:9px;line-height:1.6}#besan-install-card .bic-close{position:absolute;left:12px;top:10px;border:0;background:#f9e5ee;color:#a34a70;border-radius:50%;width:27px;height:27px;font-size:19px;line-height:1;cursor:pointer}@keyframes bic-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}`;
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
        const { error } = await client.functions.invoke('push-notifications', { body: { audience: isAdmin ? 'admin' : 'customer', phone, subscription: subscription.toJSON() } });
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
