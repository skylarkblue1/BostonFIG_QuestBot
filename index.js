console.log('Starting up');

// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits, Partials } = require('discord.js');
const { token, guildID, roleID, logging_channelID, answer, contact_channel, admin1, admin2, botID } = require('./config.json');
const { ChannelType } = require('discord-api-types/v10')

const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel,
        Partials.Message
    ]
  })

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Logging into Discord
client.login(token);

client.on(Events.MessageCreate, async (message) => {

    if (message.channel.type == ChannelType.DM) {
        // Checking if the message is from the bot
        if (message.author != botID) {

            // Main Feature

            // Get the required channels, member and server information
            let guild = await client.guilds.fetch(guildID);
            let member = guild.members.cache.get(message.author.id);
            let logging_channel = client.channels.cache.get(logging_channelID);

            try {
                // Alert to say message was gotten for debugging reasons if an issue occurs
                // If statement is to check if the inputted message is too long for the bot to repost into the logging channel as it'll crash trying to post a 2k+ character message
                if (message.content.length > 1960) {
                    console.log(message.author + ': Dm received but is too long to post in logging channel. Full message: ' + message.content);
                    logging_channel.send('<@' + message.author + '>: Dm received but is too long to post in logging channel. Check log file for full message.');
                } else {
                    console.log(message.author + ': Dm received!');
                    logging_channel.send('<@' + message.author + '>: DM Received: ' + message.content);
                }

            } catch (err) {
                console.log(err);
                logging_channel.send('Errored, pinging <@' + admin1 + '>. Error message: ' + err + ' User: ' + message.author);
                message.author.send('Error: ' + err + '\nIf you see this message please create a thread in ' + contact_channel + ' and either screenshot or copy-paste this message into it with the error.');
            }

            // Allows users to input the answer in any case they want without it erroring
            let msg = message.content.toLowerCase();
            if (msg == answer){

                console.log(message.author + ': Correct password received');
                // Log allows for admins to see who gave the correct commands incase the bot fails to give the role and it needs to be done manually
                logging_channel.send('<@' + message.author + '>: Correct password received');

                try {
                    if (member.roles.cache.has(roleID)) {
                        // If the user already has the role, tell them and do nothing else
                        console.log(message.author + ': User has role already');
                        message.author.send("You already have the role for this quest, you don't need to do anything else!");
                        logging_channel.send('<@' + message.author + '>: User already has role');
                    } else {
                        // If user doesn't have the role, give it to them and explain the mechanics of the bot to them.
                        member.roles.add(roleID);
                        console.log(message.author + ': Added role to user');
                        message.author.send("Congratulations on completing the quest!\nAs this is your first quest completed, you have earned the role Fancypants! Complete more quests to upgrade your role!");
                        logging_channel.send('<@' + message.author + '>: User has been given the role successfully')
                    }
                } catch (err) {
                    console.log(err);
                    logging_channel.send('Errored, pinging <@' + admin1 + '>. Error message: ' + err + ' User: ' + message.author);
                    message.author.send('Error: ' + err + '\nIf you see this message please create a thread in ' + contact_channel + ' and either screenshot or copy-paste this message into it with the error.');
                }

            } else {
                // User gave the wrong password
                console.log(message.author + ': Wrong password received');
                message.author.send("That is not the correct password.");
                logging_channel.send('<@' + message.author + '>: Wrong password received');
            }

            // Shutdown command. Only 2 authorised admins are the only accounts who can run this command
            if (message.author == admin1 || admin2) {
                if (message.content == 'shutdown') {
                    console.log('Shut down command triggered by ' + message.author + '. Shutting down.')
                    logging_channel.send('Shut down command triggered by <@' + message.author + '>. Shutting down.').then(() => {
                        client.destroy();
                    })
                }
            }
        }
    }
 });
