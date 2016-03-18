
export default class PokemonBattle {

  constructor(conversation, pokemon) {

    this.conversation = conversation;
    this.pokemon = pokemon;

    this.turnIndex = 0;

  }

  start() {

    let attackingPokemon = this.pokemon[1];
    let defendingPokemon = this.pokemon[0];

    console.log('taking turn...');

    this.takeTurn(attackingPokemon, defendingPokemon);

  }

  end(winner, loser) {
    this.conversation.say(`Battle ended, ${winner.name} defeated ${loser.name}`);
  }

  takeTurn(attackingPokemon, defendingPokemon) {

    if(attackingPokemon.isWild) {

      let move = attackingPokemon.determineAttackMove(defendingPokemon);

      let damage = this.determineDamage(attackingPokemon, defendingPokemon, move);

      this.conversation.say(`${attackingPokemon.name} used ${move.name} and dealt ${damage} damage.`);

      let defendingPokemonLost = this.dealDamage(attackingPokemon, defendingPokemon, damage);

      if(defendingPokemonLost) {
        return this.end(attackingPokemon, defendingPokemon);
      }
      
      this.conversation.say(`${defendingPokemon.name} now has ${defendingPokemon.health} HP left`);

      this.conversation.say('next turn..');

      // this.takeTurn(defendingPokemon, attackingPokemon);

    } else {

      console.log('not wild');  

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
