-- İsim tabanlı bulut kaydı ("Troy" telefonda da Mac'te de aynı dosyayı açar).
--
-- Giriş sistemi YOK: satırlar sahipsiz (user_id sütunu yok), yani kayda erişim
-- yalnızca ismi bilmeye bağlı. Bu tabloya kişisel veri yazma — sadece oyun
-- durumu (takma ad + sayılar) girer. İleride giriş eklenince buraya user_id
-- gelip sorgular doğrulanmış kullanıcıya göre daraltılmalı.
create table if not exists saves (
  -- Aramada kullanılan biçim: kırpılmış + küçük harf ("  Troy " -> "troy").
  name_key   text primary key,
  -- Oyuncunun yazdığı hâli; ekranda bu gösterilir.
  name       text not null,
  -- store'un kalıcı dilimi (player, rivals, logs, hiz, market).
  state      jsonb not null,
  -- clockStamp(player): oyun içi geçen toplam dakika. Monoton arttığı için
  -- çakışmada "daha ileri olan kazanır" kuralını buna dayandırıyoruz — böylece
  -- yeni açılmış zayıf bir kayıt, saatlerce oynanmışın üstüne yazamaz.
  progress   bigint not null default 0,
  updated_at timestamptz not null default now()
);
