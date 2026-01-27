# 🚀 دليل النشر - Deployment Guide

## نظرة عامة

التطبيق منشور على **GitHub Pages** ويعمل تلقائياً عند كل `push` إلى فرع `main`.

## 🔗 الروابط المهمة

- **رابط الإنتاج:** [https://geelstation.github.io/haqebetalmouslim/](https://geelstation.github.io/haqebetalmouslim/)
- **Repository:** [https://github.com/geelstation/haqebetalmouslim](https://github.com/geelstation/haqebetalmouslim)
- **GitHub Actions:** [https://github.com/geelstation/haqebetalmouslim/actions](https://github.com/geelstation/haqebetalmouslim/actions)

## 📋 متطلبات النشر

### 1. إعدادات GitHub Repository

تأكد من تفعيل GitHub Pages:

1. اذهب إلى **Settings** → **Pages**
2. في قسم **Source**، اختر **GitHub Actions**
3. سيتم استخدام workflow الموجود في `.github/workflows/deploy.yml`

### 2. إعدادات Firebase (للميزات الديناميكية)

إذا كنت تستخدم Firebase:

1. أنشئ ملف `src/firebase/config.js` (انسخ من `config.example.js`)
2. أضف بيانات Firebase الخاصة بك
3. **مهم:** لا تُضف `config.js` إلى Git (موجود في `.gitignore`)

## 🔄 عملية النشر التلقائي

### Workflow التلقائي

عند كل `push` إلى `main`:

1. **Build Step:**
   ```bash
   npm ci
   npm run build
   ```

2. **Deploy Step:**
   - يتم رفع مجلد `dist/` إلى GitHub Pages
   - التطبيق يصبح متاحاً على الرابط المباشر

### ملف Workflow

الموقع: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write
```

## 🛠️ النشر اليدوي

### 1. البناء المحلي

```bash
# تثبيت المكتبات
npm install

# بناء التطبيق
npm run build
```

### 2. اختبار البناء محلياً

```bash
# تشغيل سيرفر محلي لاختبار dist/
npx serve dist
```

سيفتح على `http://localhost:3000`

### 3. الرفع اليدوي

```bash
# commit التغييرات
git add .
git commit -m "تحديث التطبيق"

# رفع إلى GitHub
git push origin main
```

سيبدأ GitHub Actions تلقائياً في النشر.

## ⚙️ إعدادات Vite

### Base Path

في `vite.config.js`:

```javascript
export default defineConfig({
  base: '/haqebetalmouslim/',  // اسم الـ repository
  // ...
})
```

**مهم:** إذا غيرت اسم الـ repository، حدّث `base` هنا.

## 📱 PWA Configuration

### Manifest

في `public/manifest.json`:

```json
{
  "start_url": "/haqebetalmouslim/",
  "scope": "/haqebetalmouslim/",
  // ...
}
```

### Service Worker

في `public/sw.js` - يدير الـ caching للعمل offline.

## 🔍 التحقق من النشر

### 1. فحص GitHub Actions

1. اذهب إلى **Actions** tab
2. تحقق من آخر workflow run
3. يجب أن يكون ✅ خضراء

### 2. فحص الموقع المباشر

افتح: [https://geelstation.github.io/haqebetalmouslim/](https://geelstation.github.io/haqebetalmouslim/)

### 3. فحص Console للأخطاء

افتح Developer Tools (F12) → Console
- يجب ألا تكون هناك أخطاء حمراء
- تحقق من تحميل جميع الملفات

## 🐛 حل المشاكل الشائعة

### مشكلة: الصفحة فارغة (Blank Page)

**السبب:** مشكلة في `base` path

**الحل:**
```javascript
// vite.config.js
base: '/haqebetalmouslim/'  // يجب أن يطابق اسم الـ repo
```

### مشكلة: 404 على الملفات

**السبب:** routing issue

**الحل:**
1. تأكد من وجود `.htaccess` في `public/`
2. تأكد من نسخه إلى `dist/` عند البناء

### مشكلة: Manifest غير محمّل

**السبب:** paths غير صحيحة في manifest

**الحل:**
```json
// public/manifest.json
{
  "start_url": "/haqebetalmouslim/",
  "icons": [
    {
      "src": "/haqebetalmouslim/favicon.svg"
    }
  ]
}
```

### مشكلة: Build فشل على GitHub Actions

**الأسباب المحتملة:**
1. أخطاء في الكود
2. مكتبات مفقودة في `package.json`
3. Node version غير متوافقة

**الحل:**
1. فحص logs في Actions tab
2. تشغيل `npm run build` محلياً للتحقق
3. إصلاح الأخطاء و push مرة أخرى

## 📊 مراقبة الأداء

### Analytics

- يمكن إضافة Google Analytics
- Firebase Analytics مدمج (إذا كان Firebase مُفعّل)

### Performance

فحص الأداء:
1. افتح DevTools → Lighthouse
2. شغّل Performance audit
3. حسّن بناءً على التوصيات

## 🔐 الأمان

### Environment Variables

لا تُضف معلومات حساسة في الكود:

```bash
# استخدم GitHub Secrets للمعلومات الحساسة
Settings → Secrets and variables → Actions → New secret
```

### Firebase Security Rules

تأكد من تحديث `firestore.rules` للحماية:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // قواعد الأمان هنا
  }
}
```

## 📝 Checklist قبل النشر

- [ ] تشغيل `npm run build` محلياً بنجاح
- [ ] اختبار على `npx serve dist`
- [ ] فحص Console للأخطاء
- [ ] تحديث `CHANGELOG.md`
- [ ] تحديث رقم الإصدار في `package.json`
- [ ] Commit & Push
- [ ] مراقبة GitHub Actions
- [ ] اختبار الموقع المباشر

## 🔄 التحديثات المستقبلية

### نشر إصدار جديد

1. حدّث الكود
2. حدّث رقم الإصدار:
   ```json
   // package.json
   "version": "2.2.0"
   ```
3. حدّث `CHANGELOG.md`
4. Commit & Push
5. (اختياري) أنشئ Release Tag على GitHub

### Rollback

إذا حدثت مشكلة:

```bash
# العودة لآخر commit يعمل
git revert HEAD
git push origin main
```

أو من GitHub:
1. Actions → اختر آخر deployment ناجح
2. Re-run workflow

## 📞 الدعم

إذا واجهت مشاكل:

1. **GitHub Issues:** افتح issue جديد
2. **Discussions:** ناقش في GitHub Discussions
3. **Logs:** تحقق من GitHub Actions logs

---

**آخر تحديث:** يناير 27, 2026
