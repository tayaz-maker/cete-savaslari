-- Şifresiz, isim-anahtarlı ilk kayıt tasarımından (migrations/0002_saves.sql)
-- gerçek hesaba (kullanıcı adı + şifre) geçiş. O tablo hiçbir kullanıcı
-- tarafından onaylanmadan değiştiriliyor; içindeki satırlar (varsa) sahipsizdi
-- ve yeni tasarımda anlamsız, o yüzden düşürülüyor.
drop table if exists saves;

-- Hesap başına tek satır: giriş yapan kullanıcı ismini bilen değil, sadece
-- kendi hesabının sahibi kaydına erişir.
create table saves (
  user_id    text primary key references "user" ("id") on delete cascade,
  -- store'un kalıcı dilimi (player, rivals, logs, hiz, market).
  state      jsonb not null,
  -- clockStamp(player): oyun içi geçen toplam dakika, çakışma çözümü için.
  progress   bigint not null default 0,
  updated_at timestamptz not null default now()
);
