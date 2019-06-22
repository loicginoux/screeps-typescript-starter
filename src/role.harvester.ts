export class roleHarvester {
  public static run(creep: Creep): void {
    let spawn = Game.spawns['Spawn1'];
    if (spawn.energy == spawn.energyCapacity) {
      console.log(`${creep.name} switched to builder`)
      if (Memory.creeps[creep.name]) {
        Memory.creeps[creep.name].role = 'builder';
      }
    }
    if (creep.carry.energy < creep.carryCapacity) {
      var sources = creep.room.find(FIND_SOURCES);
      if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
      }
    }
    else {
      var targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType == STRUCTURE_EXTENSION ||
            structure.structureType == STRUCTURE_SPAWN ||
            structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
        }
      });
      if (targets.length > 0) {
        if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
        }
      }
    }
    if (spawn.energy == spawn.energyCapacity) {
      creep.memory.role == null;
    }
  }
}
