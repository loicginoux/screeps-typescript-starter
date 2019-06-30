import { default as Tasks } from 'creep-tasks'
import { Utils } from 'utils/Utils';

export class RoleHarvester {
  public static newTask(creep: Creep, source: Source): void {
    if (creep.carry.energy < creep.carryCapacity) {
      if (creep.pos.getRangeTo(source) > 1) {
        creep.task = Tasks.goTo(source.pos)
      } else {
        creep.task = Tasks.harvest(source)
      }
    } else {
      Utils.log("findClosestEnergyStructure")
      const target = this.findClosestEnergyStructure(creep)
      Utils.log("target", target)
      if (target) {
        if (creep.pos.getRangeTo(target) > 1) {
          creep.task = Tasks.goTo(target.pos)
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
