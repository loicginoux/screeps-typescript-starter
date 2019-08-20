import { Tasks } from 'creep-tasks/Tasks';

export class RoleStaticHarvester {
  public static newTask(creep: Creep, source: Source, container: StructureContainer): void {
    if (creep.carry.energy == 0) {
      if (creep.pos.getRangeTo(source) > 1) {
        creep.task = Tasks.goTo(source.pos)
      } else {
        creep.task = Tasks.harvest(source)
      }
    } else {
      if (creep.pos.getRangeTo(container) > 2) {
        creep.task = Tasks.goTo(container.pos)
      } else {
        if ((container.hits / container.hitsMax) <= 0.8) {
          creep.task = Tasks.repair(container);
        } else {
          creep.task = Tasks.transfer(container)
        }
      }
    }
  }
}
