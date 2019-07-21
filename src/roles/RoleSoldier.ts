import { default as Tasks } from 'creep-tasks'

export class RoleSoldier {
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
}
