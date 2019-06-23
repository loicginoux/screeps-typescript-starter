import { ErrorMapper } from "utils/ErrorMapper";
import { roleHarvester } from "roles/harvester";
import { roleUpgrader } from "roles/upgrader";
import { roleBuilder } from "roles/builder";
import { spawner } from "spawner";
import { taskAssigner } from "taskAssigner";
import { Architect } from "Architect";

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  // console.log(`Current game tick is ${Game.time}`);
  let spawn = Game.spawns['Spawn1'];
  // console.log(`spawn energy ${spawn.energy}/${spawn.energyCapacity}`);

  spawner.run();
  // taskAssigner.run();

  // var tower = Game.getObjectById('TOWER_ID');
  // if(tower) {
  //   var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
  //     filter: (structure) => structure.hits < structure.hitsMax
  //   });

  //   if(closestDamagedStructure) {
  //     tower.repair(closestDamagedStructure);
  //   }

  //   var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
  //   if(closestHostile) {
  //     tower.attack(closestHostile);
  //   }
  // }

  for (var name in Game.creeps) {
    var creep = Game.creeps[name];
    // reassign task if needed
    taskAssigner.run(creep)
    if (creep.memory.role == 'harvester') {
      roleHarvester.run(creep);
    }
    if (creep.memory.role == 'upgrader') {
      roleUpgrader.run(creep);
    }
    if (creep.memory.role == 'builder') {
      roleBuilder.run(creep);
    }
  }

  Architect.runForAllRooms();

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
});
