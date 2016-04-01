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

    (async function() {
      let wildPokemon = messageToPokemon(message, true);

      try {
        await wildPokemon.bootstrap();
      } catch (err) {
        throw err;
      }

      sayAsPokemon(conversation, wildPokemon, [
        `A level *${wildPokemon.level} ${wildPokemon.name}* appeared. It has *${wildPokemon.health}* HP.`
      ], true, 'Wild');

      let pokemon = await askPlayerForPokemon(bot, conversation);

      console.log('starting battle..');

      let battle = new PokemonBattle(conversation, [ pokemon, wildPokemon ]);

      await battle.start();
    }());
  });
});

process.on('uncaughtException', function (err) {
  console.log(err);
  console.log(err.stack);
});
