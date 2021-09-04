const express = require("express");
const passport = require("passport");
const { Strategy } = require("passport-discord");
const session = require("express-session");
const ejs = require("ejs")
const { Client, Intents, Permissions } = require('discord.js')
const client = new Client({ intents: Object.values(Intents.FLAGS).reduce((p, c) => p + c, 0)})
const app = express();
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({
  databasePath:"./veritabani.json"
});

passport.serializeUser((user, done) => {
  done(null, user);
 });
 

 passport.deserializeUser((obj, done) => {
     done(null, obj);
 });
let strategy = new Strategy({
  clientID: "855397112815943721",
  clientSecret: "n_KQQIXWWocSV0ftfHy1canYFj0iSVI2",
  callbackURL: "http://localhost:3000/callback",
  scope: ["identify", "guilds"]
}, (accesToken, refreshToken, profile, done) => {
  process.nextTick( () => done(null, profile))
})

passport.use(strategy)
app.set('view engine', 'ejs')
app.engine("ejs", ejs.renderFile);
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.get("/giris", passport.authenticate("discord", {
  scopes: ["identify", "guilds"] }))
app.get("/callback", passport.authenticate("discord", {
  failureRedirect: "/hata" 
}), (req, res) => {
      res.redirect("/");
});
app.get('/cikis', function(req, res){
  req.logout();
  res.redirect('/');
});


app.get('/', function(req, res){
res.render("index", {user: req.user, client: client})
});
app.get('/panel', async function(req, res){
    if (req.user) {
    res.render("panel", {user: req.user, perms: Permissions, client: client}) } else { res.redirect("/giris") }
});
app.get('/panel/:guildID', async function(req, res){
  if (req.user) {
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.redirect("/panel");
    const member = guild.members.cache.get(req.user.id);
    if (!member) return res.redirect("/panel");
    if (!member.permissions.has("MANAGE_GUILD")) {
      return res.redirect("/panel");
    }
  res.render("ayar", {user: req.user, perms: Permissions, client, guild, alert: null, db}) } else { res.redirect("/giris") }
});

app.post('/panel/:guildID', async function(req, res){
  if (req.user) {
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.redirect("/panel");
    const member = guild.members.cache.get(req.user.id);
    if (!member) return res.redirect("/panel");
    if (!member.permissions.has("MANAGE_GUILD")) {
      return res.redirect("/panel");
    }
  if (req.body.sifirla =="evet") { db.delete(guild.id) }
    if (req.body.cik == "evet") {
     guild.leave()
     res.redirect("/panel")
    } else {
      if (req.body.otorol ) { db.set(guild.id + ".otorol", req.body.otorol) 
      res.render("ayar", {user: req.user, perms: Permissions, client: client, guild, alert: "Ayarlarınız başarıyla kaydedildi!", db})  } else { 
       if (req.body.prefix ) { db.set(guild.id + ".prefix", req.body.prefix) 
       res.render("ayar", {user: req.user, perms: Permissions, client: client, guild, alert: "Ayarlarınız başarıyla kaydedildi!", db}) 
      } else { 
      res.render("ayar", {user: req.user, perms: Permissions, client: client, guild, alert: "Ayarlarınız başarıyla kaydedildi!", db})  }}}
  } else { res.redirect("/giris") }
});
const listener = app.listen(3000, (err) => {
    if (err) throw err;
    console.log("site başladı")
})
client.on('messageCreate', message => {
  if (message.content.startsWith("+" + "yardım")) {
    message.reply(message.guild.roles.cache.find(r => r.id === "869250081424031806").name);
  }
});
client.on('guildMemberAdd', (kullanici) => {
  if (db.get(kullanici.guild.id + ".otorol")) {
   kullanici.roles.add(db.get(kullanici.guild.id + ".otorol"))
  } else {}
});

client.login("ODU1Mzk3MTEyODE1OTQzNzIx.YMx4pA.sqfyj58Frx7tlxtRLwDuuQmgqVM")