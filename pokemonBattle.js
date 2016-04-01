import Pokedex from 'pokedex-promise-v2';

import {
  sayAsPokemon,
  askQuestion
} from './utils';

const pokedex = new Pokedex();

export default class PokemonBattle {

  constructor (conversation, pokemon) {
    this.conversation = conversation;
    this.pokemon = pokemon;
  }

  async start () {
    let attackingPokemon = this.pokemon[0];
    let defendingPokemon = this.pokemon[1];

    await this.takeTurn(attackingPokemon, defendingPokemon);
  }

  async end (winner, loser) {
    sayAsPokemon(this.conversation, loser, [
      `${loser.name} fainted! ${winner.name} won the battle!`
    ]);
  }

  async takeTurn (attackingPokemon, defendingPokemon, callback) {
    if (attackingPokemon.isWild) {
      let move = attackingPokemon.determineAttackMove(defendingPokemon);
      this.processDamage(attackingPokemon, defendingPokemon, move);
    } else {
      let message = await askQuestion(this.conversation, 'What move do you want to use?');
      
      let move = attackingPokemon.getMove(message.text);

      if (!move) {
        sayAsPokemon(this.conversation, attackingPokemon, [
          `${attackingPokemon.name} doesn't know ${moveName}!`
        ], null, null);
        this.conversation.repeat();
        return this.conversation.next();
      }

      // this.conversation.next();

      this.processDamage(attackingPokemon, defendingPokemon, move);
    }
  }

  async determineDamage (attackingPokemon, defendingPokemon, move, callback) {
    // http://www.smogon.com/bw/articles/bw_complete_damage_formula
    // http://bulbapedia.bulbagarden.net/wiki/Damage
    let moveData;

    try {
      moveData = await pokedex.getMoveByName(move.name);
    } catch (err) {
      throw err;
    }

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

    return dmg;
  }

  async processDamage (attackingPokemon, defendingPokemon, move) {  
    try {
      var damage = await this.determineDamage(attackingPokemon, defendingPokemon, move);
    } catch (err) {
      throw err;
    }

    let finished = await this.dealDamage(attackingPokemon, defendingPokemon, move, damage);

    if (finished) {
      return this.end(attackingPokemon, defendingPokemon);
    }

    await this.takeTurn(defendingPokemon, attackingPokemon);
  }

  async dealDamage (attackingPokemon, defendingPokemon, move, damage) {
    defendingPokemon.health -= damage;

    sayAsPokemon(this.conversation, attackingPokemon, [
      `*${attackingPokemon.name}* used *${move.name}* and dealt *${damage}* damage, leaving *${defendingPokemon.name}* with *${defendingPokemon.health}* HP`
    ], false, 'Wild');

    if (defendingPokemon.health < 1) {
      return true;
    }

    return false;
  }
}
