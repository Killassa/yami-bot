const Discord = require('discord.js');
const config = require('./config.json');
const ytdl = require('ytdl-core');
const bot = new Discord.Client();

var infos = [];


bot.on('ready', () => {
    console.log('Ready!');
    bot.user.setGame('@' + bot.user.username + " help");
    bot.guilds.array().forEach(element => {
        var PlayListYtb = [];   //Stock les URLs des musiques choisies par l'utilisateur
        var TitreYtbMusique = [];
        infos[element.id] = [PlayListYtb, TitreYtbMusique];
    })
});

bot.login(config.token);
