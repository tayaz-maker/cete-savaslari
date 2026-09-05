type SendInput = {
  to: string;
  subject: string;
  html: string;
};

function fromAddress() {
  return (
    process.env.EMAIL_FROM?.trim() ||
    "Çete Savaşları <beth.t@example.com>"
  );
}

export async function sendAppEmail(input: SendInput): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    console.warn(
      "[mail] RESEND_API_KEY yok — doğrulama/reset maili gönderilmedi.",
      input.subject,
      input.to,
    );
    return;
  }
  const { Resend } = await import("resend");
  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from: fromAddress(),
    to: input.to,
    subject: input.subject,
    html: input.html,
  });
  if (error) {
    console.error("[mail] Resend hata:", error);
    throw new Error("Mail gönderilemedi. Biraz sonra tekrar dene.");
  }
}

export function mailShell(title: string, body: string, href: string, cta: string) {
  return `<!doctype html>
<html lang="tr">
<body style="margin:0;background:#0e0c0b;color:#efe8de;font-family:Georgia,serif;padding:32px">
  <div style="max-width:480px;margin:0 auto">
    <p style="letter-spacing:.2em;text-transform:uppercase;font-size:11px;color:#b7a894">Çete Savaşları</p>
    <h1 style="font-size:28px;margin:8px 0 16px">${title}</h1>
    <p style="line-height:1.5;color:#d9cfc0">${body}</p>
    <p style="margin:28px 0">
      <a href="${href}" style="display:inline-block;background:#c4a574;color:#1a140f;text-decoration:none;padding:12px 18px;border-radius:8px">${cta}</a>
    </p>
    <p style="font-size:12px;color:#8a7d6c">Link açılmazsa tarayıcıya yapıştır:<br>${href}</p>
  </div>
</body>
</html>`;
}
