import { Tasks } from 'creep-tasks/Tasks'
import { EnergyStructure } from 'creep-tasks/utilities/helpers';

export class RoleHarvester {
  public static newTask(creep: Creep, source: Source): void {
    if (creep.carry.energy == 0) {
      if (creep.pos.getRangeTo(source) > 1) {
        creep.task = Tasks.goTo(source.pos)
      } else {
        creep.task = Tasks.harvest(source)
      }
    } else {
      const target = this.findClosestEnergyStructure(creep)
      if (target) {
        if (creep.pos.getRangeTo(target) > 1) {
          creep.task = Tasks.goTo(target.pos)
        } else {
          creep.task = Tasks.transfer(target)
        }
      } else {
        // all energy structures full, find a controller
        // const controller = creep.room.controller
        // if (controller) {
        //   if (creep.pos.getRangeTo(controller) > 1) {
        //     creep.task = Tasks.goTo(controller.pos)
        //   } else {
        //     creep.task = Tasks.upgrade(controller)
        //   }
        // }
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
