export class spawner {
  public static run() {
    let rolesPosition = ['harvester', 'harvester', 'builder', 'upgrader'];
    let spawn = Game.spawns['Spawn1'];
    let creepsCounter = Object.keys(Game.creeps).length;
    if (spawn.room.energyAvailable > 200 && creepsCounter < 10) {
      let rand = Math.floor(Math.random() * 1000)
      let whatToSpawn = rand % rolesPosition.length
      let role = rolesPosition[whatToSpawn]
      let creepName = `w${rand}`
      console.log(`spawning ${role} ${creepName}`)
      let ret = spawn.spawnCreep([WORK, CARRY, MOVE], creepName, {
        memory: { role: role }
      } as SpawnOptions);
      if (ret != OK) {
        console.log(`spawning ret error: ${ret}`)
      }
    }
  }
}
