import { Tasks } from 'creep-tasks/Tasks'
import { u } from "utils/Utils";
import { RoomDiscovery } from "utils/RoomDiscovery";


export class RoleReserver {
  public static newTask(creep: Creep): void {
    // console.log(creep.name, creep.room.name, creep.memory.roomTarget)
    if (creep.room.name != creep.memory.roomTarget) {
      if (Memory.roomExploration[creep.memory.roomTarget] && Memory.roomExploration[creep.memory.roomTarget].ctrl) {
        const ctrlPos = Memory.roomExploration[creep.memory.roomTarget].ctrl!.pos
        creep.task = Tasks.goTo(new RoomPosition(ctrlPos.x, ctrlPos.y, ctrlPos.roomName))
      }
    } else {
      const room = Game.rooms[creep.memory.roomTarget]
      if (room.controller) {
        // if (!room.controller.sign || (room.controller.sign.username != creep.owner.username)) {
        if ((!room.controller.sign || room.controller.sign.text != "🚩 veni vidi vici 🚩") && creep.signController(room.controller, "🚩 veni vidi vici 🚩") == ERR_NOT_IN_RANGE) {
          creep.travelTo(room.controller);
        }
        // }
        if (creep.reserveController(room.controller) == ERR_NOT_IN_RANGE) {
          creep.travelTo(room.controller);
        }
      }
    }
  }
}
