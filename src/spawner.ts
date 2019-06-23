export class spawner {
  public static run() {

    let spawn = Game.spawns['Spawn1'];
    let creeps = _.values(Game.creeps) as Creep[];

    let harvesters = _.filter(creeps, creep => creep.memory.role == 'harvester');
    let builders = _.filter(creeps, creep => creep.memory.role == 'builder');
    let upgraders = _.filter(creeps, creep => creep.memory.role == 'upgrader');
    let medics = _.filter(creeps, creep => creep.memory.role == 'medics');
    let soldiers = _.filter(creeps, creep => creep.memory.role == 'soldier');


    if (Game) {

    }
    if (spawn.room.energyAvailable > 200) {
      let creepName = `w${Game.time}`
      let role;


      if (harvesters.length + builders.length < 5) {
        role = 'harvester'
      } else if (upgraders.length < 2) {
        role = 'upgrader'
      }

      if (role) {
        console.log(`spawning ${role} ${creepName}`)
        spawn.spawnCreep([WORK, CARRY, MOVE], creepName, {
          memory: { role: role }
        } as SpawnOptions);

      }

    }
  }
}
