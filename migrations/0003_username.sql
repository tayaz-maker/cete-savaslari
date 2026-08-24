-- Better Auth "username" plugin columns (kullanıcı adı + şifre girişi).
-- Plugin, kaydolurken username'i normalize edip ("Troy" -> "troy") burada
-- saklar; displayUsername kullanıcının yazdığı hâldir.
alter table "user" add column if not exists "username" text;
alter table "user" add column if not exists "displayUsername" text;
create unique index if not exists "user_username_unique" on "user" ("username");
