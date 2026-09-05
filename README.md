# Uy 360

Telegram Mini App: Termiz xaritasi, sotuv/ijara e’lonlari va 360° uy ko‘rinishi.

## Ishga tushirish

```bash
npm install
npm run dev
```

Brauzerda `http://localhost:5173` — xarita, pin, card va 360° shu yerda tekshiriladi.

Internetdagi manzil (GitHub Pages): https://appleikhtiyorbal-hub.github.io/y/

## Telegram bot

1. [@BotFather](https://t.me/BotFather) da bot oching, token oling.
2. `.env.example` ni `.env` qilib nusxalang.
3. Mini App **faqat HTTPS** da ochiladi. Lokal uchun tunnel:

```bash
npx cloudflared tunnel --url http://localhost:5173
```

4. `.env` ga yozing:

```
BOT_TOKEN=...
WEBAPP_URL=https://....trycloudflare.com
```

5. BotFather → bot → `/newapp` yoki Menu Button → Mini App URL.
6. `npm run bot`, keyin Telegramda `/start` → **Ilovani ochish**.

## Admin panel

Saytda: https://appleikhtiyorbal-hub.github.io/y/#/admin  
yoki **Uy 360** sarlavhasini 5 marta bosing.

GitHub Personal Access Token kerak (`repo` huquqi). Token faqat brauzerda saqlanadi. Saqlagach Actions `gh-pages` ni 1–2 daqiqada yangilaydi.

360° rasm **equirectangular** bo‘lishi kerak (Insta360 / Ricoh Theta). Oddiy telefon rasmi 360 bo‘lmaydi.
