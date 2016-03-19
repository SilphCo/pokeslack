import fs from 'fs';

import Botkit from 'botkit';

import PokemonBattle from './pokemonBattle';

import {
  sayAsPokemon,
  messageToPokemon,
  askPlayerForPokemon
} from './utils';

const controller = Botkit.slackbot({
  debug: false
});

controller.spawn({
  token: fs.readFileSync('./token').toString()
}).startRTM();

const listenMethods = [ 'direct_message', 'direct_mention', 'mention' ];

controller.hears('gen', listenMethods, function (bot, message) {
  bot.startConversation(message, function (err, conversation) {
    if (err) {
      return bot.reply(message, err.toString());
    }

    let wildPokemon = messageToPokemon(message, true);

    wildPokemon.bootstrap().then(function () {
      sayAsPokemon(conversation, wildPokemon, [
        `A level *${wildPokemon.level} ${wildPokemon.name}* appeared. It has *${wildPokemon.health}* HP.`
      ], true, 'Wild');

      askPlayerForPokemon(bot, conversation, function (err, pokemon) {
        if (err) {
          console.error('Error asking player for pokemon:', err);
          return;
        }

        console.log('starting battle..');

        let battle = new PokemonBattle(conversation, [ pokemon, wildPokemon ]);

        battle.start();
      });
    }).catch(function (err) {
      console.error(err);
      conversation.say(err.toString());
    });
  });
});

process.on('uncaughtException', function (err) {
  console.log(err);
  console.log(err.stack);
});
