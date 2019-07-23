import { Tasks } from 'creep-tasks/Tasks'

export class RoleUpgrader {
  public static newTask(creep: Creep): void {

    if (creep.carry.energy == 0) {
      this.getEnergy(creep);
    } else {
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


  public static getEnergy(creep: Creep): void {
    let containers = creep.room.find(FIND_STRUCTURES, {
      filter: (i) => i.structureType == STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] > 0
    }) as StructureContainer[];
    containers = _.sortBy(containers, s => creep.pos.getRangeTo(s))

    // get from containers first
    if (containers.length > 0) {
      if (creep.pos.getRangeTo(containers[0]) > 1) {
        creep.task = Tasks.goTo(containers[0])
      } else {
        creep.task = Tasks.withdraw(containers[0])
      }
    } else {
      // else get from source directly
      let sources = creep.room.find(FIND_SOURCES_ACTIVE) as Source[]
      sources = _.sortBy(sources, s => creep.pos.getRangeTo(s))
      if (sources.length > 0) {
        if (creep.pos.getRangeTo(sources[0]) > 1) {
          creep.task = Tasks.goTo(sources[0])
        } else {
          creep.task = Tasks.harvest(sources[0])
        }
      }
    }
  }
}
