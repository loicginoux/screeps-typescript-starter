import { default as Tasks } from 'creep-tasks'

export class RoleBuilder {
  public static newTask(creep: Creep): void {
    if (creep.carry.energy < creep.carryCapacity) {
      let containers = creep.room.find(FIND_STRUCTURES, {
        filter: (i) => i.structureType == STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] > 0
      }) as StructureContainer[];
      containers = _.sortBy(containers, s => creep.pos.getRangeTo(s))
      // get from containers first
      if (!!containers) {
        if (creep.pos.getRangeTo(containers[0]) > 1) {
          creep.task = Tasks.goTo(containers[0])
        } else {
          creep.task = Tasks.withdraw(containers[0])
        }
      } else {
        // else get from source directly
        let sources = creep.room.find(FIND_SOURCES_ACTIVE) as Source[]
        sources = _.sortBy(sources, s => creep.pos.getRangeTo(s))
        if (!!sources) {
          if (creep.pos.getRangeTo(sources[0]) > 1) {
            creep.task = Tasks.goTo(sources[0])
          } else {
            creep.task = Tasks.harvest(sources[0])
          }
        }
      }
    } else {
      let target = creep.room.find(FIND_CONSTRUCTION_SITES) as ConstructionSite[]
      if (!!target) {
        if (creep.pos.getRangeTo(target[0]) > 1) {
          creep.task = Tasks.goTo(target[0])
        } else {
          creep.task = Tasks.build(target[0])
        }
      }
    }
  }
}
