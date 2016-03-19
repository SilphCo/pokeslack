import Pokedex from 'pokedex-promise-v2';

const pokedex = new Pokedex();

const NUM_MOVES = 4;

class Pokemon {

  constructor (uId = 0, level = 1, isWild = false) {
    if (uId === 0) {
      // randomise
      uId = Math.floor(Math.random() * 600);
    }

    // This level determines a bunch
    // of statistics, and moves the
    // pokemon may get.
    this.level = level;

    if (this.level > 100) {
      this.level = 100;
    } else if (this.level < 1) {
      this.level = 1;
    }

    this.moves = [];
    this._moves = {};

    this.name = 'unknown';
    this.id = 0;
    this.pic = null;

    this.health = 100;

    this.isWild = isWild;

    this.stats = {
      attack: 10,
      spAttack: 10,
      defense: 10,
      spDefense: 10
    };

    this.uId = uId.toString().toLowerCase().trim();
  }

  async bootstrap () {
    try {
      await this.fetchData();
      this.assignMoves();
    } catch (e) {
      throw e;
    }
  }

  async fetchData () {
    try {
      this.data = await pokedex.getPokemonByName(this.uId);
      // hax until PR gets merged
      if (this.data.statusCode !== undefined && this.data.statusCode !== 200) {
        throw new Error();
      }
      this.name = this.data.name;
      this.id = this.data.id;
      this.pic = this.data.sprites.front_default;
    } catch (e) {
      throw new Error(`${this.uId} is not a valid pokemon name or id!`);
    }
  }

  determineValidMoves () {
    return this.data.moves.filter((move) => {
      return move.version_group_details.some((learnDetail) => {
        return learnDetail.move_learn_method.name === 'level-up' && this.level >= learnDetail.level_learned_at;
      });
    });
  }

  assignMoves () {
    let possibleMoves = this.determineValidMoves();
    for (let i = 0; i < NUM_MOVES; i++) {
      if (possibleMoves.length === 0) break;
      let index = Math.floor(Math.random() * possibleMoves.length);
      let move = possibleMoves[index];
      move.name = move.move.name; // HACK
      this.moves.push(move);
      this._moves[move.name] = move;
      possibleMoves.splice(index, 1);
    }
  }

  determineAttackMove () {
    let moveIndex = Math.floor(Math.random() * this.moves.length);
    let move = this.moves[moveIndex];
    return move;
  }

}

export default Pokemon;
