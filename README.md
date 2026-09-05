# Uy 360

Telegram Mini App: Termiz xaritasi, sotuv/ijara e’lonlari va 360° uy ko‘rinishi.

## Ishga tushirish

```bash
npm install
npm run dev
```

Brauzerda `http://localhost:5173` — xarita, pin, card va 360° shu yerda tekshiriladi.

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

## E’lon qo‘shish

[`src/data/listings.json`](src/data/listings.json) ga yangi obyekt qo‘shing. 360° rasm **equirectangular** bo‘lishi kerak (odatda 2:1, Insta360 / Ricoh Theta). Oddiy telefon rasmi 360 bo‘lmaydi.

Rasmlar: `public/images/` (cover), `public/pano/` (panorama).
