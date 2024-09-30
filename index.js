console.log('Starting up');

// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits, Partials } = require('discord.js');
const { token, guildID, roleL1ID, roleL2ID, logging_channelID, answer, contact_channel, admin1, admin2, botID } = require('./config.json');
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
            const member = await guild.members.fetch(message.author.id);
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
            if (msg == answer){ // & UUID is not in the file

                console.log(message.author + ': Correct password received');
                // Log allows for admins to see who gave the correct commands incase the bot fails to give the role and it needs to be done manually
                logging_channel.send('<@' + message.author + '>: Correct password received');

                try {
                    if (member.roles.cache.has(roleL1ID)) {
                        // If the user already has the L1 role, tell them and upgrade role
                        console.log(message.author + ': User has L1 role already, giving L2 role');
                        logging_channel.send('<@' + message.author + '>: User already has L1 role, giving L2 role');
                        member.roles.remove(roleL1ID);
                        member.roles.add(roleL2ID);

                        console.log(message.author + ': Added L2 role to user');
                        message.author.send("Congratulations on completing the quest!\nAs you have already completed one of our quests in a previous fest, your role has been upgraded to Level 2 and is now Landlubber! Keep completing more of our quests to keep levelling up!");
                    } else if (member.roles.cache.has(roleL2ID)) {
                        // If the user already has the L1 role, tell them and do nothing
                        console.log(message.author + ': User has L2 role already');
                        logging_channel.send('<@' + message.author + '>: User already has L2 role');
                        message.author.send("You already have the role for this quest, you don't need to do anything else!");
                    }
                    else {
                        // If user doesn't have the first role, give it to them and explain the mechanics of the bot to them.
                        member.roles.add(roleL1ID);
                        console.log(message.author + ': Added L1 role to user');
                        message.author.send("Congratulations on completing the quest!\nAs this is your first quest completed, you have earned the role Fancypants! Complete more quests to upgrade your role!");
                        logging_channel.send('<@' + message.author + '>: User has been given the L1 role successfully')
                    }
                } catch (err) {
                    console.log(err);
                    logging_channel.send('Errored, pinging <@' + admin1 + '>. Error message: ' + err + ' User: ' + message.author);
                    message.author.send('Error: ' + err + '\nIf you see this message please create a thread in ' + contact_channel + ' and either screenshot or copy-paste this message into it with the error.');
                }

            } else { // Make an else if for if they UUID is in the file and say that they've already completed the quest for this fest, come back next time.
                // User gave the wrong password
                console.log(message.author + ': Wrong password received');
                message.author.send("That is not the correct password.");
                logging_channel.send('<@' + message.author + '>: Wrong password received');
            }

            // Admin commands. Only 2 authorised admins are the only accounts who can run these commands.
            if (message.author == admin1 || admin2) {
                // Shutdown command
                if (message.content == 'shutdown') {
                    console.log('Shut down command triggered by ' + message.author + '. Shutting down.')
                    logging_channel.send('Shut down command triggered by <@' + message.author + '>. Shutting down.').then(() => {
                        client.destroy();
                    })
                }

                    // Remove roles for debugging
                try {
                    if (message.content == 'remove1'){ // DM the bot "remove1" to remove the "Fancypants" role from you
                        console.log('Removing L1 role from ' + message.author + '.' );
                        logging_channel.send('Removing L1 role from <@' + message.author + '>.');
                        member.roles.remove(roleL1ID);
                        message.author.send('L1 role removed');
                    }
                    if (message.content == 'remove2'){ // DM the bot "remove2" to remove the "Landlubber" role from you
                        console.log('Removing L2 role from ' + message.author + '.' );
                        logging_channel.send('Removing L2 role from <@' + message.author + '>.');
                        member.roles.remove(roleL2ID);
                        message.author.send('L2 role removed');
                    }
                } catch (err) {
                    console.log(err);
                    logging_channel.send('Errored, pinging <@' + admin1 + '>. Error message: ' + err + ' User: ' + message.author);
                    message.author.send('Error: ' + err + '\nIf you see this message please create a thread in ' + contact_channel + ' and either screenshot or copy-paste this message into it with the error.');
                }
            }
        }
    }
 });
