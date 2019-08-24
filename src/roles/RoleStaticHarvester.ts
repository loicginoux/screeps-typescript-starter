import { Tasks } from 'creep-tasks/Tasks';

export class RoleStaticHarvester {
  public static newTask(creep: Creep, source: Source, container: StructureContainer): void {
    // console.log(creep.name, "new task static harv.")
    if (creep.carry.energy == 0) {
      if (creep.pos.getRangeTo(source) > 1) {
        // console.log(creep.name, "goTo", source.pos)
        creep.task = Tasks.goTo(source.pos)
      } else {
        // console.log(creep.name, "harvest", source.pos)
        creep.task = Tasks.harvest(source)
      }
    } else {
      if (creep.pos.getRangeTo(container) > 2) {
        // console.log(creep.name, "goTo", container.pos)
        creep.task = Tasks.goTo(container.pos)
      } else {
        if ((container.hits / container.hitsMax) <= 0.8) {
          // console.log(creep.name, "repair", container.pos)
          creep.task = Tasks.repair(container);
        } else {
          // console.log(creep.name, "transfer", container.pos)
          creep.task = Tasks.transfer(container)
        }
      }
    }
  }
}
