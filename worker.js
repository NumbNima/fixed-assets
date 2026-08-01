export default {
  async fetch(request, env, ctx) {
    const validUser = env.APP_USER;
    const validPass = env.APP_PASS;

    // اگه هنوز APP_USER/APP_PASS تنظیم نشده، فعلاً اجازه‌ی عبور بده
    // تا سایت قفل نشه (تا وقتی تنظیمشون کنید).
    if (validUser && validPass) {
      const authHeader = request.headers.get('Authorization');
      let authorized = false;

      if (authHeader && authHeader.startsWith('Basic ')) {
        try {
          const decoded = atob(authHeader.slice(6));
          const sep = decoded.indexOf(':');
          const user = decoded.slice(0, sep);
          const pass = decoded.slice(sep + 1);
          if (user === validUser && pass === validPass) authorized = true;
        } catch (e) {
          authorized = false;
        }
      }

      if (!authorized) {
        return new Response('برای ورود به این سایت باید نام‌کاربری و رمز عبور صحیح وارد کنید.', {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="دفتر دارایی ثابت", charset="UTF-8"',
            'Content-Type': 'text/plain; charset=utf-8',
          },
        });
      }
    }

    // درخواست تأییدشده (یا هنوز رمز تنظیم نشده) -> فایل‌های استاتیک سایت سرو بشن
    return env.ASSETS.fetch(request);
  },
};
