import { Tasks } from 'creep-tasks/Tasks'

export class RoleSoldier {
  public static newTask(creep: Creep, room: Room): void {
    let hostiles = room.find(FIND_HOSTILE_CREEPS);
    if (hostiles.length > 0) {
      let target = hostiles[0];
      console.log("creep.pos.getRangeTo(target)", creep.pos.getRangeTo(target))
      if (creep.pos.getRangeTo(target) > 3) {
        console.log("travel")
        creep.travelTo(target.pos)
      } else {
        console.log("attack")
        creep.task = Tasks.attack(target)
      }
    } else if (creep.hits < creep.hitsMax) {
      creep.task = Tasks.heal(creep)
    }
  }
}
