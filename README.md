# TLab — Çete Savaşları

İstanbul yeraltı simülasyonu. Kayıt tarayıcıda (localStorage); isteğe bağlı e-posta hesabı ile bulut.

18+ kurgusal içerik. Gerçek kumar, uyuşturucu veya şiddet teşviki değil.

## Geliştirme

```
npm install
npm run dev
```

Önizleme `0.0.0.0:8080`.

```
npm run typecheck
npm run build
```

## Ortam

Değer yazma; isimler:

- `DATABASE_URL` — Postgres (yoksa PGLite)
- `BETTER_AUTH_URL` — Better Auth kök URL
- `BETTER_AUTH_SECRET` — oturum imzası
- `VITE_AUTH_ENABLED` — hesap kapısı

Oyun hesabı Supabase üzerindedir (`VITE_SUPABASE_URL` / publishable key, istemci).

## Yayın

GitHub `main` → Vercel. Force-push kapalı tutulmalı (`OPS.md`).

## Oyun

`/` katalog. `/cete-savaslari` oyun. `?sekme=` derin bağlantı. `?ref=` davet.
