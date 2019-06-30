import { default as Tasks } from 'creep-tasks'
import { Utils } from 'utils/Utils';

export class RoleUpgrader {
  public static newTask(creep: Creep): void {

    let energySources = _.sortBy(creep.room.find(FIND_SOURCES_ACTIVE), s => creep.pos.getRangeTo(s))

    if (energySources.length > 0 && creep.carry.energy < creep.carryCapacity) {
      if (creep.pos.getRangeTo(energySources[0]) > 1) {
        creep.task = Tasks.goTo(energySources[0].pos)
      } else {
        creep.task = Tasks.harvest(energySources[0])
      }
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
