import { Bot, InlineKeyboard } from 'grammy'
import 'dotenv/config'

const token = process.env.BOT_TOKEN
const webAppUrl = process.env.WEBAPP_URL

if (!token) {
  throw new Error('BOT_TOKEN .env faylida yo‘q')
}

if (!webAppUrl) {
  throw new Error('WEBAPP_URL .env faylida yo‘q (HTTPS tunnel manzili)')
}

const bot = new Bot(token)

bot.command('start', async (ctx) => {
  const keyboard = new InlineKeyboard().webApp('Ilovani ochish', webAppUrl)

  await ctx.reply(
    'Uy 360 — Termizda uy sotish va ijaraga.\nXaritadan e’lonni tanlang va uy ichini 360° ko‘ring.',
    { reply_markup: keyboard },
  )
})

bot.start()
console.log('Bot ishga tushdi. Telegramda /start yuboring.')
