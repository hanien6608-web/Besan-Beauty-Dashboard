/* =====================================================================
   config.js — إعدادات الاتصال بقاعدة البيانات (الملف الوحيد اللي بتعدّليه)
   ---------------------------------------------------------------------
   1) اعملي مشروع Supabase جديد خاص بـ Besan Beauty
   2) من Project Settings > API انسخي: Project URL و anon public key
   3) الصقيهم تحت مكان الـ PLACEHOLDER
   ملحوظة: الـ anon key مصمم يكون ظاهر في المتصفح، والحماية الحقيقية
   بتيجي من سياسات الأمان (RLS) الموجودة في supabase/schema.sql
   ===================================================================== */
window.APP_CONFIG = {
    SUPABASE_URL: 'https://gagjylyqxihrwdibslfu.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_31TZOnafPpMpQL7ET7zQMQ_qaAorsTF',

    // اسم الـ bucket العام اللي بتتخزن فيه صور المنتجات (بينشئه schema.sql)
    STORAGE_BUCKET: 'product-images',

    // مفتاح Web Push العام (يُضاف بعد توليد زوج مفاتيح VAPID)
    VAPID_PUBLIC_KEY: 'PASTE_VAPID_PUBLIC_KEY_HERE',

    // أصوات التنبيه (ملفات جاهزة جوا مجلد sounds، مش محتاجة رفع)
    SOUND_ORDER: 'sounds/order.mp3',
    SOUND_CHAT: 'sounds/chat.mp3'
};
window.APP_CONFIG.STORAGE_PUBLIC_BASE = window.APP_CONFIG.SUPABASE_URL + '/storage/v1/object/public/' + window.APP_CONFIG.STORAGE_BUCKET + '/';
