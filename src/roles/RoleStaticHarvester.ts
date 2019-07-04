import { default as Tasks } from 'creep-tasks'

export class RoleStaticHarvester {
  public static newTask(creep: Creep, source: Source, container: StructureContainer): void {
    if (creep.carry.energy < creep.carryCapacity) {
      if (creep.pos.getRangeTo(source) > 1) {
        creep.task = Tasks.goTo(source.pos)
      } else {
        creep.task = Tasks.harvest(source)
      }
    } else {
      if (creep.pos.getRangeTo(container) > 2) {
        creep.task = Tasks.goTo(source.pos)
      } else {
        creep.task = Tasks.transfer(container)
      }
    }
  }
}
