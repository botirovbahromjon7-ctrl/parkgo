const express=require('express');
const http=require('http');
const {Server}=require('socket.io');
const QRCode=require('qrcode');
const questions=require('./questions.json');
const app=express(); const server=http.createServer(app); const io=new Server(server,{pingTimeout:30000});
app.use(express.static(__dirname));
const HOST_KEY=process.env.HOST_KEY || 'parkgo2026';
let game={pin:String(Math.floor(100000+Math.random()*900000)),phase:'lobby',index:-1,endsAt:0,players:new Map(),host:null,timer:null};
const top=()=>[...game.players.values()].sort((a,b)=>b.score-a.score||a.joined-b.joined).map((p,i)=>({rank:i+1,name:p.name,score:p.score,connected:p.connected}));
function publicState(){return {pin:game.pin,phase:game.phase,index:game.index,total:questions.length,endsAt:game.endsAt,players:[...game.players.values()].map(p=>({name:p.name,connected:p.connected})),leaderboard:top()};}
function publish(){io.emit('state',publicState());}
function questionPayload(){const q=questions[game.index];return {index:game.index,total:questions.length,q:q.q,a:q.a,endsAt:game.endsAt};}
function closeQuestion(){if(game.phase!=='question')return;clearTimeout(game.timer);game.phase='reveal';io.emit('reveal',{correct:questions[game.index].correct,leaderboard:top()});publish();}
function next(){if(game.phase==='question')return false;if(game.index+1>=questions.length){game.phase='finished';publish();return true;}game.index++;game.phase='question';game.endsAt=Date.now()+20000;for(const p of game.players.values())p.answered=-1;io.emit('question',questionPayload());publish();game.timer=setTimeout(closeQuestion,20020);return true;}
app.get('/api/qr',async(req,res)=>{try{const origin=process.env.PUBLIC_URL||`${req.protocol}://${req.get('host')}`;const url=`${origin}/?pin=${game.pin}`;res.type('png');res.send(await QRCode.toBuffer(url,{width:400,margin:2,color:{dark:'#073343',light:'#FFFFFF'}}));}catch(e){res.status(500).send('QR unavailable');}});
app.get('/api/info',(req,res)=>res.json({pin:game.pin,questionCount:questions.length,limit:30}));
io.on('connection',socket=>{
 socket.emit('state',publicState());
 socket.on('host:auth',(key,cb)=>{if(key!==HOST_KEY)return cb({ok:false,error:'Boshlovchi paroli noto‘g‘ri'});socket.data.host=true;game.host=socket.id;cb({ok:true});socket.emit('state',publicState());if(game.phase==='question')socket.emit('question',questionPayload());});
 socket.on('player:join',({name,pin,token},cb)=>{
  if(String(pin)!==game.pin)return cb({ok:false,error:'O‘yin kodi noto‘g‘ri'});
  name=String(name||'').trim().slice(0,24);if(name.length<2)return cb({ok:false,error:'Ism kamida 2 ta harf bo‘lsin'});
  let p=token&&game.players.get(token);
  if(!p){if(game.phase!=='lobby')return cb({ok:false,error:'O‘yin boshlangan, yangi ishtirokchilar qabul qilinmaydi'});
    if(game.players.size>=30)return cb({ok:false,error:'30 ta joy to‘lgan'});
    if([...game.players.values()].some(v=>v.name.toLocaleLowerCase()===name.toLocaleLowerCase()))return cb({ok:false,error:'Bu ism band, boshqasini tanlang'});
    token=require('crypto').randomBytes(20).toString('hex');p={name,score:0,answered:-1,joined:Date.now(),connected:true,socketId:socket.id};game.players.set(token,p);
  }else{p.connected=true;p.socketId=socket.id;}
  socket.data.token=token;cb({ok:true,token,name:p.name});publish();if(game.phase==='question')socket.emit('question',questionPayload());
 });
 socket.on('player:answer',({choice},cb)=>{
  const p=game.players.get(socket.data.token);if(!p)return cb({ok:false,error:'Avval o‘yinga kiring'});
  if(game.phase!=='question'||Date.now()>game.endsAt)return cb({ok:false,error:'Vaqt tugagan'});
  if(p.answered!==-1)return cb({ok:false,error:'Javob allaqachon yuborilgan'});
  if(!Number.isInteger(choice)||choice<0||choice>3)return cb({ok:false,error:'Javob noto‘g‘ri'});
  p.answered=choice;const correct=choice===questions[game.index].correct;
  const points=correct?Math.max(500,Math.round(500+500*(game.endsAt-Date.now())/20000)):0;
  p.score+=points;cb({ok:true,points,correct});
  if([...game.players.values()].every(v=>v.answered!==-1))closeQuestion();
 });
 socket.on('host:next',(_,cb)=>{if(!socket.data.host)return cb({ok:false});cb({ok:next()});});
 socket.on('host:reveal',(_,cb)=>{if(!socket.data.host)return cb({ok:false});closeQuestion();cb({ok:true});});
 socket.on('host:reset',(_,cb)=>{if(!socket.data.host)return cb({ok:false});clearTimeout(game.timer);game={pin:String(Math.floor(100000+Math.random()*900000)),phase:'lobby',index:-1,endsAt:0,players:new Map(),host:socket.id,timer:null};cb({ok:true});publish();});
 socket.on('disconnect',()=>{const p=game.players.get(socket.data.token);if(p&&p.socketId===socket.id){p.connected=false;publish();}});
});
const port=process.env.PORT||3000;server.listen(port,()=>console.log(`ParkGo Quiz listening on ${port}. HOST_KEY is ${HOST_KEY==='parkgo2026'?'DEFAULT (change before public deployment)':'configured'}`));
