import { default as Tasks } from 'creep-tasks'
// import { EnergyStructure } from 'creep-tasks/utilities/helpers';

export class RoleTruck {
  public static newTask(creep: Creep, container: StructureContainer): void {
    if (creep.carry.energy < creep.carryCapacity) {
      if (creep.pos.getRangeTo(container) > 2) {
        creep.task = Tasks.goTo(container.pos)
      } else {
        creep.task = Tasks.withdraw(container)
      }
    } else {
      let target = this.findClosestEnergyStructure(creep)
      if (target) {
        if (creep.pos.getRangeTo(target) > 1) {
          creep.task = Tasks.goTo(target)
        } else {
          creep.task = Tasks.transfer(target)
        }
      } else {
        // all energy structures full, find a controller
        const controller = creep.room.controller
        if (controller) {
          if (creep.pos.getRangeTo(controller) > 1) {
            creep.task = Tasks.goTo(controller.pos)
          } else {
            creep.task = Tasks.upgrade(controller)
          }
        }
      }
    }
  }
  public static findClosestEnergyStructure(creep: Creep): EnergyStructure {
    return creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_EXTENSION ||
          structure.structureType == STRUCTURE_SPAWN ||
          structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
      }
    })[0] as EnergyStructure;
  }
}
