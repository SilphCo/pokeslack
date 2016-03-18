
import {
  sayAsPokemon
} from "./utils";

export default class PokemonBattle {

  constructor(conversation, pokemon) {

    this.conversation = conversation;
    this.pokemon = pokemon;

    this.turnIndex = 0;

  }

  start() {

    let attackingPokemon = this.pokemon[0];
    let defendingPokemon = this.pokemon[1];

    this.takeTurn(attackingPokemon, defendingPokemon);

  }

  end(winner, loser) {

    sayAsPokemon(this.conversation, loser, [
      `${loser.name} fainted! ${winner.name} won the battle!`
    ]);

  }

  takeTurn(attackingPokemon, defendingPokemon, callback) {

    if(attackingPokemon.isWild) {

      let move = attackingPokemon.determineAttackMove(defendingPokemon);

      let damage = this.determineDamage(attackingPokemon, defendingPokemon, move);

      sayAsPokemon(this.conversation, attackingPokemon, [
        `*${attackingPokemon.name}* used *${move.name}* and dealt *${damage}* damage.`
      ], false, 'Wild');

      let defendingPokemonLost = this.dealDamage(attackingPokemon, defendingPokemon, damage);

      if(defendingPokemonLost) {
        return this.end(attackingPokemon, defendingPokemon);
      }
      
      sayAsPokemon(this.conversation, defendingPokemon, [
        `*${defendingPokemon.name}* now has *${defendingPokemon.health}* HP left`
      ]);

      this.takeTurn(defendingPokemon, attackingPokemon);

    } else {

      this.conversation.ask("What move do you want to use?", (message, conversation) => {

        let moveName = message.text;
        let move;

        for(let i = 0; i < attackingPokemon.moves.length; i++) {
          if(attackingPokemon.moves[i].name === moveName) {
            move = attackingPokemon.moves[i];
            break;
          }
        }

        if(!move) {
          sayAsPokemon(attackingPokemon, [
            `${attackingPokemon.name} doesn't know ${moveName}!`
          ]);
          this.conversation.repeat();
          return conversation.next();
        }

        this.conversation.next();

        let damage = this.determineDamage(attackingPokemon, defendingPokemon, move);

        sayAsPokemon(this.conversation, attackingPokemon, [
          `*${attackingPokemon.name}* used *${move.name}* and dealt *${damage}* damage.`
        ]);

        let defendingPokemonLost = this.dealDamage(attackingPokemon, defendingPokemon, damage);

        if(defendingPokemonLost) {
          return this.end(attackingPokemon, defendingPokemon);
        }

        sayAsPokemon(this.conversation, defendingPokemon, [
          `*${defendingPokemon.name}* now has *${defendingPokemon.health}* HP left`
        ], false, 'Wild');

        this.takeTurn(defendingPokemon, attackingPokemon);

      });

    }

  }

  determineDamage(attackingPokemon, defendingPokemon, move) {
    return 50;
  }

  dealDamage(attackingPokemon, defendingPokemon, damage) {

    defendingPokemon.health -= damage;

    if(defendingPokemon.health < 1) {
      return true;
    }

    return false;

  }

}
