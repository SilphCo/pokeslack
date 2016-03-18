import fs from "fs";

import Botkit from "botkit";

import Pokemon from "./pokemon";
import PokemonBattle from "./pokemonBattle";

const controller = Botkit.slackbot({
  debug: false
});

controller.spawn({
  token: fs.readFileSync('./token').toString()
}).startRTM();

const listenMethods = [ 'direct_message', 'direct_mention', 'mention' ];

controller.hears('gen', listenMethods, function(bot, message) {

  bot.startConversation(message, function(err, conversation) {

    if(err) {
      return bot.reply(message, err.toString());
    }

    let wildPokemon = messageToPokemon(message, true);

    wildPokemon.bootstrap().then(function() {

      sayAsPokemon(conversation, wildPokemon, [
        `A level *${wildPokemon.level} ${wildPokemon.name}* appeared. It has *${wildPokemon.health}* HP.`
      ], true, 'Wild');

      askPlayerForPokemon(bot, conversation, function(err, pokemon) {

        if(err) {
          console.error("Error asking player for pokemon:", err);
          return;
        }

        console.log('starting battle..');

        let battle = new PokemonBattle(conversation, [ pokemon, wildPokemon ]);

        battle.start();

      });

    }).catch(function(err) {
      console.error(err);
      conversation.say(err.toString());
    });

  });

});

function sayAsPokemon(conversation, pokemon, msg = [], sayMoves = false, owner) {

  if(!Array.isArray(msg)) {
    msg = [ msg ];
  }

  if(sayMoves) {
    let moves = [];
    if(pokemon.moves.length > 0) {
      msg.push("It knows: " + pokemon.moves.map(function(m) {
        return `_${m.move.name}_`;
      }).join(', '));
    } else {
      msg.push("It doesn't know any moves!");
    }
  }

  let user = pokemon.name;

  if(owner) {
    user = `${owner} ${user}`;
  }

  conversation.say({
    text:     msg.join("\n"),
    username: user,
    icon_url: pokemon.pic
  });

}

function messageToPokemon(message, isWild) {

  let _ = message.text.split(" ");
  _.shift();

  let [ name, level ] = _;

  return new Pokemon(name, level, isWild);

}

function askPlayerForPokemon(bot, conversation, callback) {

  conversation.ask("What pokemon do you want to use? (type 'chose <id> <level>')", function(message, conversation) {

    if(message.text.split(' ')[0] !== 'chose') {
      conversation.repeat();
      return conversation.next();
    }

    let pokemon = messageToPokemon(message);

    pokemon.bootstrap().then(function() {

      sayAsPokemon(conversation, pokemon, [
        `You chose a level *${pokemon.level}* *${pokemon.name}*`
      ], true);

      conversation.next();

      return callback(null, pokemon);

    });

  });

}
