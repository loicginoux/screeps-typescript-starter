export class taskAssigner {
  public static run(creep: Creep) {
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
  public static checkHarvester(creep: Creep) {
    let spawn = Game.spawns['Spawn1'];
    if (spawn.energy == spawn.energyCapacity) {
      if (Memory.creeps[creep.name]) {
        console.log(`${creep.name} switched from ${creep.memory.role} to builder`)
        Memory.creeps[creep.name].role = 'builder';
      }
    }
  }
  public static checkBuilder(creep: Creep) {
    let spawn = Game.spawns['Spawn1'];
    if (spawn.energy < spawn.energyCapacity) {
      console.log(`${creep.name} switched from ${creep.memory.role} to harvester`)
      if (Memory.creeps[creep.name]) {
        Memory.creeps[creep.name].role = 'harvester';
      }
    }

  }
  public static checkUpgrader(creep: Creep) {

  }
}
