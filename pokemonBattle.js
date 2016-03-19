import Pokedex from 'pokedex-promise-v2';

import {
  sayAsPokemon
} from './utils';

const pokedex = new Pokedex();

export default class PokemonBattle {

  constructor (conversation, pokemon) {
    this.conversation = conversation;
    this.pokemon = pokemon;
  }

  start () {
    let attackingPokemon = this.pokemon[0];
    let defendingPokemon = this.pokemon[1];

    this.takeTurn(attackingPokemon, defendingPokemon);
  }

  end (winner, loser) {
    sayAsPokemon(this.conversation, loser, [
      `${loser.name} fainted! ${winner.name} won the battle!`
    ]);
  }

  takeTurn (attackingPokemon, defendingPokemon, callback) {
    if (attackingPokemon.isWild) {
      let move = attackingPokemon.determineAttackMove(defendingPokemon);

      this.determineDamage(attackingPokemon, defendingPokemon, move, (err, damage) => {
        if (err) {
          throw err;
        }

        console.log('damage:', damage);

        sayAsPokemon(this.conversation, attackingPokemon, [
          `*${attackingPokemon.name}* used *${move.name}* and dealt *${damage}* damage.`
        ], false, 'Wild');

        let defendingPokemonLost = this.dealDamage(attackingPokemon, defendingPokemon, damage);

        if (defendingPokemonLost) {
          return this.end(attackingPokemon, defendingPokemon);
        }

        sayAsPokemon(this.conversation, defendingPokemon, [
          `*${defendingPokemon.name}* now has *${defendingPokemon.health}* HP left`
        ]);

        this.takeTurn(defendingPokemon, attackingPokemon);
      });
    } else {
      this.conversation.ask('What move do you want to use?', (message, conversation) => {
        let moveName = message.text;
        let move;

        for (let i = 0; i < attackingPokemon.moves.length; i++) {
          if (attackingPokemon.moves[i].name === moveName) {
            move = attackingPokemon.moves[i];
            break;
          }
        }

        if (!move) {
          sayAsPokemon(this.conversation, attackingPokemon, [
            `${attackingPokemon.name} doesn't know ${moveName}!`
          ], null, null);
          this.conversation.repeat();
          return this.conversation.next();
        }

        // this.conversation.next();

        this.determineDamage(attackingPokemon, defendingPokemon, move, (err, damage) => {
          if (err) {
            throw err;
          }

          console.log('damage:', damage);

          sayAsPokemon(this.conversation, attackingPokemon, [
            `*${attackingPokemon.name}* used *${move.name}* and dealt *${damage}* damage.`
          ]);

          let defendingPokemonLost = this.dealDamage(attackingPokemon, defendingPokemon, damage);

          if (defendingPokemonLost) {
            return this.end(attackingPokemon, defendingPokemon);
          }

          sayAsPokemon(this.conversation, defendingPokemon, [
            `*${defendingPokemon.name}* now has *${defendingPokemon.health}* HP left`
          ], false, 'Wild');

          this.takeTurn(defendingPokemon, attackingPokemon);
        });
      });
    }
  }

  determineDamage (attackingPokemon, defendingPokemon, move, callback) {
    // http://www.smogon.com/bw/articles/bw_complete_damage_formula
    // http://bulbapedia.bulbagarden.net/wiki/Damage

    pokedex.getMoveByName(move.name).then((moveData) => {
      console.log('moveData:', moveData.id);

      let isSpecial = false; // determine this

      let attackPower = isSpecial ? attackingPokemon.stats.attack : attackingPokemon.stats.spAttack;
      let defensePower = isSpecial ? defendingPokemon.stats.defense : defendingPokemon.stats.spDefense;

      this.conversation.say([
        'attackPower ' + attackPower,
        'defensePower ' + defensePower,
        'move power ' + moveData.power
      ].join('\n'));

      this.conversation.next();

      let dmg = 50;

      // let dmg = (((2 * attackingPokemon.level) / 5 + 2) * moveData.power * attackPower / defensePower / 50 + 2);

      return callback(null, dmg);
    }).catch(callback);
  }

  dealDamage (attackingPokemon, defendingPokemon, damage) {
    defendingPokemon.health -= damage;

    if (defendingPokemon.health < 1) {
      return true;
    }

    return false;
  }
}
