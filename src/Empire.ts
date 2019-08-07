import { TickRunner } from "TickRunner";
import { RoomCommander } from "RoomCommander";
import { SafeModeActivator } from "utils/SafeModeActivator";
import { SpawningRequest } from "spawner/SpawningRequest";
import { RoleExplorer } from "roles/RoleExplorer";

export class Empire extends TickRunner {
  roomCommanders!: RoomCommander[];
  minExplorer = 1;
  explorers: Creep[] = [];

  employees(): TickRunner[] { return this.roomCommanders; }

  // build memory data from creeps roles (including newly spawned)
  // build memory data from finished construction sites
  loadData(): void {
    this.roomCommanders = []
    _.forEach(Game.rooms, room => {
      let firstSpawner = room.find(FIND_MY_STRUCTURES, {
        filter: i => i.structureType === STRUCTURE_SPAWN
      }) as StructureSpawn[];
      if (firstSpawner[0]) {
        if (!Memory.mainRoomName) {
          Memory.mainRoomName = room.name
        }
        this.roomCommanders.push(new RoomCommander(room))
      }
    });

    // do not forget
    super.loadData();
  }

  preCheck() {


    super.preCheck()
    return OK;
  }

  act() {
    SafeModeActivator.activeSafeModeIfNecessary()

    super.act()
  }
}
