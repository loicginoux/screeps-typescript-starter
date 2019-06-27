import { Tasks } from "creep-Tasks/Tasks";

export class RoleStaticHarvester {
  public static newTask(creep: Creep, source: Source, containers: StructureContainer[]): void {
    if (creep.carry.energy < creep.carryCapacity) {
      if (creep.pos.getRangeTo(source) > 1) {
        creep.task = Tasks.goTo(source.pos)
      } else {
        creep.task = Tasks.harvest(source)
      }
    } else {
      let bestContainer = containers[0]
      if (creep.pos.getRangeTo(bestContainer) > 1) {
        creep.task = Tasks.goTo(source.pos)
      } else {
        creep.task = Tasks.transfer(bestContainer)
      }
    }
  }
}
