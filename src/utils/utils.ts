export class Utils {
  static findStructuresThatNeedsEnergy() {
    let room = Game.rooms.sim;
    return room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_EXTENSION ||
          structure.structureType == STRUCTURE_SPAWN ||
          structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
      }
    });
  }

  static findClosestAvailablePositionTo(pos: Position): Position {

  }
}
