export class taskAssigner {
  public static run() {
    let spawn = Game.spawns['Spawn1'];
    for (var name in Game.creeps) {
      var creep = Game.creeps[name];
      if (!creep.memory.role) {
        if (spawn.energy < spawn.energyCapacity) {
          console.log(`assign role harvester to ${creep.name}`)
          creep.memory.role = 'harvester'
        }
      }
    }
  }
}
