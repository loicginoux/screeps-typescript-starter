import { default as Tasks } from 'creep-tasks'

export class RoleBuilder {
  public static newTask(creep: Creep): void {
    if (creep.carry.energy < creep.carryCapacity) {
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
    } else {
      let targets = creep.room.find(FIND_CONSTRUCTION_SITES) as ConstructionSite[]
      if (targets.length > 0) {
        if (creep.pos.getRangeTo(targets[0]) > 1) {
          creep.task = Tasks.goTo(targets[0])
        } else {
          creep.task = Tasks.build(targets[0])
        }
      }
    }
  }
}
