import Pokemon from './pokemon';

export function sayAsPokemon (conversation, pokemon, msg = [], sayMoves = false, owner) {
  if (!Array.isArray(msg)) {
    msg = [ msg ];
  }

  if (sayMoves) {
    if (pokemon.moves.length > 0) {
      msg.push('It knows: ' + pokemon.moves.map(function (m) {
        return `_${m.move.name}_`;
      }).join(', '));
    } else {
      msg.push('It doesn\'t know any moves!');
    }
  }

  let user = pokemon.name;

  if (owner) {
    user = `${owner} ${user}`;
  }

  conversation.say({
    text: msg.join('\n'),
    username: user,
    icon_url: pokemon.pic
  });
}

export function messageToPokemon (message, isWild) {
  let _ = message.text.split(' ');
  _.shift();

  let [ name, level ] = _;

  return new Pokemon(name, level, isWild);
}

export function askPlayerForPokemon (bot, conversation, callback) {
  conversation.ask('What pokemon do you want to use? (type \'chose <id> <level>\')', function (message, conversation) {
    if (message.text.split(' ')[0] !== 'chose') {
      conversation.repeat();
      return conversation.next();
    }

    let pokemon = messageToPokemon(message);

    pokemon.bootstrap().then(function () {
      sayAsPokemon(conversation, pokemon, [
        `You chose a level *${pokemon.level}* *${pokemon.name}*`
      ], true);

      conversation.next();

      return callback(null, pokemon);
    }).catch(callback);
  });
}
