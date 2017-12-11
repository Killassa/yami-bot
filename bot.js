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

bot.login(token);

bot.on('message', message => {
    if (message.content.startsWith('<@'+ bot.user.id +'>')) {
        var args = message.content.split(' '); //Split le message envoyé par l'utilisateur en plusieurs parties
        var cmd = args[1];      //Récupère la 2ème partie du message
        var suffix = args[2];   //Récupère la 3ème partie du message
        var ChannelVocale = message.member.voiceChannel;    //Récupère le channel dans lequel se trouve l'utilisateur envoyant le message
        var Dossier;    //Variable pour stocker le dossier dans lequel nous devons chercher l'image
        var Extension;

        switch(cmd) {

            //Joue une musique en fonction d'une url youtube donnée
            case 'play':
                if(testYtbUrl(suffix))
                {
                    var TitreYtb;
                    if (!ChannelVocale){
                        return message.reply(`Please be in a voice channel first!`);
                    }
                    else{
                        ytdl.getInfo(suffix, function(err, info){
                            TitreYtb = info.title;
                        
                            const embed = new Discord.RichEmbed()
                            .setTitle('Now Playing :')
                            .setColor('#FEFE01')
                            .setDescription(orangeColor(TitreYtb));

                            ChannelVocale.join()
                                .then(connection => {
                                    message.channel.send(embed).then(() => {
                                        const stream = ytdl(suffix, { filter: 'audioonly' });
                                        const dispatcher = connection.playStream(stream, {seek: 0, volume: (5/100)});
                                    });
                                }).catch(console.log);
                        });
                    }
                }
                else
                {
                    message.channel.send(greenColor('This isn\'t a valid URL!'));
                }
            break;

            //Quitte le salon vocal
            case 'leave':
                if (!bot.voiceConnections){
                    message.channel.send(greenColor('I\'m not in a channel. Baka!'));
                }
                else{
                    bot.voiceConnections.forEach( call => {
                        if(call.channel.guild.id == message.guild.id)
                        {
                            call.disconnect();
                        }
                    });
                    message.channel.send(greenColor('See you later!'));
                }
            break;

            //Affiche le contenu de la playlist
            case 'list':
                var MaPlayList = "";
                var TitreMusique;
                var idx = 0;
                
                infos[message.guild.id][1].forEach(element => {
                    idx++;
                    MaPlayList += idx + ". " + element + "\n";
                });

                if(MaPlayList == "")
                {
                    message.channel.send(greenColor('Your playlist is empty!'));
                }
                else
                {
                    message.channel.send(greenColor('Your playlist : \n \n' + MaPlayList));
                }
            break;

            //Démarre la playlist
            case 'playlist':
                var TitreYtb;
                var NumeroMusique = TryParseInt(suffix, 0);

                if (NumeroMusique == 0)
                {
                    message.channel.send(greenColor('The parameter must be a number!'));
                }    
                else
                {
                    NumeroMusique -= 1
                    MusiqueChoisie = infos[message.guild.id][0][NumeroMusique]
                    if (!ChannelVocale){
                        return message.reply(greenColor(`Please be in a voice channel first!`));
                    }
                    else{
                        ytdl.getInfo(MusiqueChoisie, function(err, info){
                            TitreYtb = info.title

                            const embed = new Discord.RichEmbed()
                            .setTitle('Now Playing: ' + TitreYtb)
                            .setColor('#FEFE01')
                            .setDescription(orangeColor(TitreYtb));
                        
                        ChannelVocale.join()
                            .then(connection => {
                                message.channel.send(embed).then(() => {
                                    const stream = ytdl(MusiqueChoisie, { filter: 'audioonly' });
                                    const dispatcher = connection.playStream(stream, {seek: 0, volume: (5/100)});
                                });
                            }).catch(console.log);
                        });
                    }
                }           
            break;

            //Ajouter une musique à la playlist
            case 'addplaylist':
                try
                {
                    if(testYtbUrl(suffix))
                    {
                        infos[message.guild.id][0].push(suffix);
                        message.channel.send(greenColor('Music added with success!'));
                        console.log(infos[message.guild.id][0])

                        ytdl.getInfo(suffix, function(err, info){
                            var temp = info.title
                            infos[message.guild.id][1].push(temp);
                        });
                    }
                    else
                    {
                        message.channel.send(greenColor('This isn\'t a valid URL!'));
                    }
                }
                catch(e)
                {
                    message.channel.send(greenColor('This isn\'t a valid URL!'));
                }
                
            break;

            //Enlever une musique à la playlist
            case 'delplaylist':
                var NumeroMusique = TryParseInt(suffix, 0);

                if (NumeroMusique == 0)
                {
                    message.channel.send(greenColor('The parameter must be a number!'));
                }    
                else
                {
                    NumeroMusique -= 1
                    infos[message.guild.id][0].splice(NumeroMusique, 1);
                    infos[message.guild.id][1].splice(NumeroMusique, 1);
                    message.channel.send(greenColor('Music deleted with success!'));
                    console.log(infos[message.guild.id][0])
                }           
            break;

            //Affiche l'avatar du bot
            case 'avatar':
                message.channel.sendFile('./Images/Avatar/YamiAvatar.jpg');
            break;

            //Affiche la liste des commandes
            case 'help':
                getBotInfo(message);
            break;

            //Explique le fonctionnement de la commande
            case 'commandinfo':
                getCommandInfo(message, suffix);
            break;
            
            //Affiche aléatoirement une image de yami
            case 'yami':
                Dossier = 'Yami';
                Extension = '.jpg';
                getImageDir(message, Dossier, 37, 'Just a pic of me', Extension);
            break;

            //Affiche aléatoirement une image de nekogirl
            case 'nekogirl':
                Dossier = 'Nekogirl';
                Extension = '.jpg';
                getImageDir(message, Dossier, 12, 'Just a pic of a nekogirl', Extension);
            break;

            //Affiche aléatoirement une image de chat
            case 'neko':
                Dossier = 'Neko';
                Extension = '.jpg';
                getImageDir(message, Dossier, 14, 'Just a pic of a neko', Extension);
            break;

            //Affiche aléatoirement une scène de "baka"
            case 'tsundere':
                Dossier = 'Tsundere';
                Extension = '.gif';
                getImageDir(message, Dossier, 14, 'Just a gif of a tsundere', Extension);
            break;

            //Affiche aléatoirement une scène de "insult"
            case 'insult':
                Dossier = 'Insult';
                Extension = '.gif';
                getImageDir(message, Dossier, 14, 'Just a gif of an insult', Extension);
            break;

            //Affiche aléatoirement une scène de "kiss"
            case 'kiss':
                Dossier = 'Kiss';
                Extension = '.gif';
                getImageDir(message, Dossier, 14, 'Just a gif of a kiss', Extension);
            break;

            //Demander à Yami d'écrire et supprime le message utilisateur après
            case 'dwrite':
                var MonMessage = "";
                var index = 0;

                message.delete();

                args.forEach(element => {
                    if(index >= 2)
                    {
                        MonMessage += element + " ";
                    }
                    index++;
                });

                message.channel.send(MonMessage);
            break;

            //Si la commande n'exite pas
            default :
                const embed = new Discord.RichEmbed()
                .setTitle('This is not one of my commands.')
                .setAuthor('Yami.', bot.user.avatarURL)
                .setColor('#FEFE01');
                return message.channel.send({embed});
        }
    }
});

//Fonction wrap du texte
function wrap(text) {
	return '```\n' + text.replace(/`/g, '`' + String.fromCharCode(8203)) + '\n```';
};

//Fonction qui change la couleur du texte en vert
function greenColor(text) {
    return '```css\n' + text.replace(/`/g, '`' + String.fromCharCode(8203)) + '\n```';
};

//Fonction qui change la couleur du texte en orange
function orangeColor(text) {
    return '```http\n' + text.replace(/`/g, '`' + String.fromCharCode(8203)) + '\n```';
};

//Fontion qui change la couleur du texte en turquoise
function turquoiseColor(test) {
    return '```dsconfig\n' + text.replace(/`/g, '`' + String.fromCharCode(8203)) + '\n```'; 
};

///Fonction qui retourne la liste des commandes
function getBotInfo(message) {
    var retourLigne = '\n';

    const embed = new Discord.RichEmbed()
        .setTitle('Here you can see all my commands :')
        .setAuthor('Hi! I\'m Yami.', bot.user.avatarURL)
        .setColor('#FEFE01')
        .setDescription('Details of my commands with commandinfo.')
        .addBlankField(true)
        .addField('**YAMI**', orangeColor('help, avatar, commandinfo'))
        .addBlankField(true)
        .addField('**MUSIC**', orangeColor('play, leave, list, playlist, addplaylist, delplaylist'))
        .addBlankField(true)
        .addField('**IMAGE**', orangeColor('yami, nekogirl, neko, tsundere, insult, kiss'))
        .addBlankField(true)
        .addField('**FUN**', orangeColor('dwrite'));

    return message.channel.send({embed});
}

//Fonction qui explique de manière détaillée une commande
function getCommandInfo(message, suffix) {
    var CommandExist = true;
    var CommandExplication = '';

    switch(suffix) {            
        case 'play':
            CommandExplication = "Just write my name + play and add the url of a youtube's music like : \n@Yami play yourUrl";
        break;


        case 'leave':
            CommandExplication = 'Just write my name + leave like : \n@Yami leave';
        break;


        case 'list':
            CommandExplication = 'Just write my name + list like : \n@Yami list';
        break;


        case 'playlist':
            CommandExplication = 'Just write my name + playlist and add the number of the playlist like : \n@Yami playlist 1';
        break;

        
        case 'addplaylist':
            CommandExplication = 'Just write my name + addplaylist and add the youtube url : \n@Yami addplaylist YourUrl';
        break;


        case 'delplaylist':
            CommandExplication = 'Just write my name + delplaylist and add the number of the playlist like : \n@Yami delplaylist 1';
        break;
        

        case 'avatar':
            CommandExplication = 'Just write my name + avatar like : \n@Yami avatar';
        break;


        case 'help':
            CommandExplication = 'Just write my name + help like : \n@Yami help';
        break;

        
        case 'commandinfo':
            CommandExplication = 'Just write my name + commandinfo and then specify the command you want to look for like : \n@Yami commandinfo commandinfo';
        break;


        case 'yami':
            CommandExplication = 'Just write my name + yami like : \n@Yami yami';
        break;
        
        
        case 'nya':
            CommandExplication = 'Just write my name + nya like : \n@Yami nya';
        break;


        case 'neko':
            CommandExplication = 'Just write my name + neko like : \n@Yami neko';
        break;


        case 'tsundere':
            CommandExplication = 'Just write my name + tsundere like : \n@Yami tsundere';
        break;


        case 'insult':
            CommandExplication = 'Just write my name + insult like : \n@Yami insult \nYou can also do this like that : \n@Yami insult @Rito';
        break;


        case 'kiss':
            CommandExplication = 'Just write my name + kiss like : \n@Yami kiss';
        break;


        case 'dwrite':
            CommandExplication = 'Just write my name + dwrite and add your message like : \n@Yami dwrite I\m Yami';
        break;


        default:
            CommandExist = false;
    }        

    if(CommandExist == true){
        const embed = new Discord.RichEmbed()
            .setTitle('Here is the detail of my ' + suffix + ' command :')
            .setAuthor('Yami.', bot.user.avatarURL)
            .setColor('#FEFE01')
            .addBlankField(true)
            .addField(suffix, orangeColor(CommandExplication));

        return message.channel.send({embed});
    }
    else{
        const embed = new Discord.RichEmbed()
            .setTitle('This is not one of my commands.')
            .setAuthor('Yami.', bot.user.avatarURL)
            .setColor('#FEFE01');
        return message.channel.send({embed});
    }
}

//Fonction qui détermine aléatoirement une image à afficher en fonction du dossier défini
function getImageDir(message, directory, nombre, title, extension){

    var random = Math.floor((Math.random() * nombre) + 1);
    var image = 'http://phmspiuo.preview.infomaniak.website/' + directory + '/' + directory + '%20(' + random + ')' + extension;

    const embed = new Discord.RichEmbed()
    .setTitle(title)
    .setAuthor('Yami.', bot.user.avatarURL)
    .setColor('#FEFE01')
    .setImage(image);

    return message.channel.send({embed})
}

//Fonction qui permet de retourner une erreur si la valeur n'est pas un int
function TryParseInt(str, defaultValue) {
    var retValue = defaultValue;
    if(str !== null) {
        if(str.length > 0) {
            if (!isNaN(str)) {
                retValue = parseInt(str);
            }
        }
    }
    return retValue;
}

//Fonction pour test l'url youtube
function testYtbUrl(url) {
    return ytdl.validateURL(url);
}
