# ParkGo Quiz Battle

Bir martalik ParkGo taqdimoti uchun real vaqt viktorinasi. 15 savol, 30 ishtirokchi, 20 soniya, tezlikka asoslangan 500–1000 ball, jonli reyting, QR-kod, TOP-3.

## Lokal ishga tushirish
1. Node.js 18+ o‘rnating.
2. Terminalda `npm install` va `npm start` bajaring.
3. Brauzerda `http://localhost:3000/host.html` oching. Boshlovchi paroli: `parkgo2026` (faqat lokal test uchun).
4. Telefonlardan ulanish uchun sayt internetga joylashtirilishi kerak. Lokal kompyuterdagi `localhost` telefonlarda ishlamaydi.

## Internetga joylash (Render)
1. Ushbu papkani GitHub reposiga yuklang.
2. Render.com → New → Web Service → GitHub reposini tanlang (yoki Blueprint uchun render.yaml dan foydalaning).
3. Build command: `npm install`; Start command: `npm start`; Free plan mumkin.
4. Environment variables: `HOST_KEY` = o‘zingiz yaratgan uzun, maxfiy parol. Parolni ishtirokchilarga bermang.
5. Deploy tugagach `https://SIZNING-SAYTINGIZ.onrender.com/host.html` ni oching va HOST_KEY ni kiriting.
6. Proyektorda QR-kod va PIN chiqadi. Ishtirokchilar QR skanerlab, ismlarini kiritadi. Boshlovchi "O‘yinni boshlash" tugmasini bosadi.

## Muhim cheklovlar
- O‘yin holati server xotirasida saqlanadi. Server qayta ishga tushsa, ballar va o‘yin yo‘qoladi.
- Render bepul servis uyquga ketishi mumkin; tadbirdan 10 daqiqa oldin saytni ochib, sinov o‘tkazing.
- Bir dona server instance bilan ishlating (bir nechta instance xotirasi umumiy emas).
- 30 ishtirokchi chegarasi dasturda qo‘yilgan; bir vaqtda 30 kishi ishlashini real tarmoq va hostingda oldindan sinab ko‘ring.
- Sayt avtomatik internetga joylashtirilmagan; haqiqiy QR faqat sayt ochiq URLga joylangach ishlaydi.
- Savollar `questions.json` faylida. Savollar avvalgi ParkGo viktorinasidan olingan.
