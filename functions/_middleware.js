// این فایل جلوی همه‌ی درخواست‌ها به سایت رو می‌گیره و رمز عبور می‌خواد.
// چون سمت سرور (Cloudflare) اجرا می‌شه، نه تو مرورگر، با دیدن کد سایت
// قابل دور زدن نیست.
//
// یوزرنیم و رمز رو اینجا ننویسید! از تنظیمات Cloudflare Pages
// (Settings > Environment variables) به‌صورت APP_USER و APP_PASS
// اضافه‌شون کنید تا مخفی بمونن.

export async function onRequest(context) {
  const { request, env } = context;

  const validUser = env.APP_USER;
  const validPass = env.APP_PASS;

  // اگه هنوز یوزر/پس تنظیم نشده، برای جلوگیری از قفل تصادفی سایت،
  // فعلاً اجازه‌ی عبور می‌ده (تا وقتی env variable ها رو ست کنید).
  if (!validUser || !validPass) {
    return context.next();
  }

  const authHeader = request.headers.get('Authorization');

  if (authHeader && authHeader.startsWith('Basic ')) {
    const encoded = authHeader.slice(6);
    let decoded = '';
    try {
      decoded = atob(encoded);
    } catch (e) {
      decoded = '';
    }
    const sepIndex = decoded.indexOf(':');
    const user = decoded.slice(0, sepIndex);
    const pass = decoded.slice(sepIndex + 1);

    if (user === validUser && pass === validPass) {
      return context.next();
    }
  }

  return new Response('برای ورود به این سایت باید نام‌کاربری و رمز عبور صحیح وارد کنید.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="دفتر دارایی ثابت", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
