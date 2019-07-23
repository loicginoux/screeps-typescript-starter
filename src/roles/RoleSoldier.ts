import { Tasks } from 'creep-tasks/Tasks'

export class RoleSoldier {
  public static newTask(creep: Creep, room: Room): void {
    let hostiles = room.find(FIND_HOSTILE_CREEPS);
    if (hostiles.length > 0) {
      let target = hostiles[0];
      if (creep.hits < (creep.hitsMax / 2)) {
        creep.task = Tasks.heal(creep)
      } else if (creep.pos.getRangeTo(target) > 1) {
        creep.task = Tasks.goTo(target.pos)
      } else {
        creep.task = Tasks.attack(target)
      }
    }
  }
}
