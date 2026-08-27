# OPS — tariklab.com

## Git

`main` force-push kilitli tutulacak. Vercel GitHub `main` dalından yayınlar.
Geçmişi ezme; revert veya ileri commit.

## Cloudflare WAF

`/api/auth/*` için IP başına 10 istek / 60 sn (Better Auth + sunucu Map ile
aynı tavan). Cloudflare’de rate-limit kuralı:

- Eşleşme: `http.request.uri.path` starts with `/api/auth/`
- Eşik: 10 istek / dakika / IP
- Aşım: 429

## Plausible

`tariklab.com` için Plausible proje aç, snippet’i site head’ine ekle
(`window.plausible`). DSN/key kodda yok; `track()` varsa Plausible’a
iletmekle yetinir. Olaylar: `yas_onay`, `karakter_olusturuldu`,
`ilk_is_yapildi`, `hesap_acildi`, `sezon_tamamlandi`, `liderlik_goruldu`.

## Neon / migration

`npm run build` içinde `scripts/migrate.mjs` çalışır. `DATABASE_URL` yoksa
atlanır. Sıkı ortamda `GROK_STRICT_MIGRATE=1` ile URL yoksa exit 1.
Uygulanan dosyalar `_migrations` tablosunda. Şema kırmayan ek kolon +
varsayılan.

## SMTP

`noreply@tariklab.com` için domain DNS + Resend + Supabase SMTP panelde.
Kod gizli anahtar taşımaz.
