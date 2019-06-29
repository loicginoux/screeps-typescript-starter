import { default as Tasks } from 'creep-tasks'

export class RoleHarvester {
  public static newTask(creep: Creep, source: Source): void {
    if (creep.carry.energy < creep.carryCapacity) {
      if (creep.pos.getRangeTo(source) > 1) {
        creep.task = Tasks.goTo(source.pos)
      } else {
        creep.task = Tasks.harvest(source)
      }
    } else {
      if (creep.pos.getRangeTo(bestContainer) > 1) {
        creep.task = Tasks.goTo(source.pos)
      } else {
        creep.task = Tasks.transfer(bestContainer)
      }
    }
  }
}
