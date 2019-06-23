import { Utils } from "utils/utils";
export class taskAssigner {
  static run(creep: Creep) {
    let spawn = Game.spawns['Spawn1'];

    if (creep.memory.role == 'harvester') {
      this.checkHarvester(creep);
    }
    else if (creep.memory.role == 'upgrader') {
      this.checkUpgrader(creep);
    }
    else if (creep.memory.role == 'builder') {
      this.checkBuilder(creep);
    }

  }
  static checkHarvester(creep: Creep) {
    let spawn = Game.spawns['Spawn1'];
    let structures = Utils.findStructuresThatNeedsEnergy()
    if (structures.length == 0) {
      if (Memory.creeps[creep.name]) {
        console.log(`${creep.name} switched from ${creep.memory.role} to builder`)
        Memory.creeps[creep.name].role = 'builder';
      }
    }
  }
  static checkBuilder(creep: Creep) {
    let spawn = Game.spawns['Spawn1'];
    let structures = Utils.findStructuresThatNeedsEnergy()
    if (structures.length > 0) {
      console.log(`${creep.name} switched from ${creep.memory.role} to harvester`)
      if (Memory.creeps[creep.name]) {
        Memory.creeps[creep.name].role = 'harvester';
      }
    }

  }
  static checkUpgrader(creep: Creep) {

  }

}
