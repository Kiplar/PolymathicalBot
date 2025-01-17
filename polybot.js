// Envar For Storing Environmental Variables
var envar = require("envar");
envar.import('env.json');
const auth = envar('oauth');
const client_id = envar('client-id');

const tmi = require('twitch-js');
// To Actually run and test the bot: node index.js

// Importing intervals and functions
// 'sayHelloToPolyBot',
let intervals = [
    'sayHelloHiThink',
    'viewBotCommands',
    'helpImproveStream',
    'socialMedia',
    'discordCommunity',
    'gamblePolyPointz',
    'minecraftServerInterval',
    'subGoalMessage'
];

let intervalFunctions = intervals.map((interval) => {
    return require(`./intervals/${interval}.js`);
});

let commands = [
    'helloCommand',
    'githubCommand',
    'polyGithubCommand',
    'jak1BoardsCommand',
    'hundoBoardsCommand',
    'jakDiscordCommand',
    'jakDebugCommand',
    'retroCapCardCommand',
    'addMeDiscordCommand',
    'frankerFaceEmotes',
    'getCommandsCommand',
    'commentsCommand',
    'notesCommand',
    'uptimeCommand',
    'twitterCommand',
    'discordCommand',
    'ytCommand',
    'instaCommand'
];

let commandFunctions = commands.map((command) => {
    return require(`./commands/${command}.js`);
});

// Initialize getStartTime function
const getStartTime = require('./helpers/getStartTime.js');
// Attempt to get startTime when bot starts
getStartTime();


// ChatBot Configuration Options
const options = {
    options: {
        debug: true
    },
    connection: {
        cluster: 'aws',
        reconnect: true
    },
    identity: {
        username: 'PolymathicalBot',
        password: auth
    },
    channels: [
      'epistemicpolymath'
    ]
};

//New instance of the client with setup options
const client = new tmi.client(options);

// Allows the client to connect to Twitch
client.connect();

// When the client is on or connected say this
client.on('connected', (address, port) => {
    client.action('epistemicpolymath', 'Hey there, PolymathicalBot is now connected!');
});

// Interval Messages
setInterval(() => {
  /**
   * Math.floor() - rounds the number down to nearest whole number
   * Math.random() - generates a random decimal number if we multiply that random decimal number by a whole number we can get a range 0 - (num-1)
   * We can use this to get a random whole number the contains a range of the length of our interval functions including zero
   */
    let index = Math.floor(Math.random() * intervalFunctions.length);
    client.action('epistemicpolymath', intervalFunctions[index]());
}, 600000); // Every 10 minutes run a random command


// When a chat action happens
client.on('chat', (channel, user, message, self) => {
    // Do not listen to my own bot messages
    if (self) return;

    // Trim All Incoming Messages
    let trimmedMessage = message.trim();

    // Send command functions necessary values
    commandFunctions.forEach((command) => {
      if (typeof command === "function") {
        if (command.name === "uptimeCommand") {
            if (typeof startTime === "undefined") {
                let response = command(trimmedMessage);
                if(response){
                client.action('epistemicpolymath', response);
                }
                return;
            }
            let response = command(trimmedMessage, startTime);
            if(response) {
              client.action('epistemicpolymath', response);
            }
              return;
        }
        let response = command(trimmedMessage, user, channel);
          if(response) {
              client.action('epistemicpolymath', response);
          }
      }
    });

});
