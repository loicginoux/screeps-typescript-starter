import { default as Tasks } from 'creep-tasks'
// import { EnergyStructure } from 'creep-tasks/utilities/helpers';

export class RoleTruck {
  public static newTask(creep: Creep, containers: StructureContainer[]): void {
    if (creep.carry.energy < creep.carryCapacity) {
      if (creep.pos.getRangeTo(containers[0]) > 2) {
        creep.task = Tasks.goTo(containers[0].pos)
      } else {
        creep.task = Tasks.withdraw(containers[0])
      }
    } else {
      let targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType == STRUCTURE_EXTENSION ||
            structure.structureType == STRUCTURE_SPAWN ||
            structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
        }
      }) as EnergyStructure[];
      if (targets.length > 0) {
        if (creep.pos.getRangeTo(targets[0]) > 1) {
          creep.task = Tasks.goTo(targets[0])
        } else {
          creep.task = Tasks.transfer(targets[0])
        }
      }
    }
  }
}
