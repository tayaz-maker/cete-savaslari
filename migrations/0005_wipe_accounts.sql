-- One-shot: tariklab.com üzerindeki bütün üyelikleri ve bulut kayıtları sil.
-- Better Auth tabloları + saves. verification token'ları da gider.
-- CASCADE: session, account, saves "user".id'ye bağlı.

truncate table "verification";
truncate table "user" cascade;
