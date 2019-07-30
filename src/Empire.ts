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
    this.roomCommanders = _.map(Game.rooms, room => {
      const roomCommander = new RoomCommander(room)
      return roomCommander
    });

    _.forEach(Game.creeps, creep => {
      if (creep.name.includes('explorer')) {
        this.explorers.push(creep)
      }
    })

    // do not forget
    super.loadData();
  }

  preCheck() {
    if (this.explorerNeeded() > 0) {
      global.pubSub.publish('SPAWN_REQUEST', {
        role: 'explorer',
        priority: 1,
        memory: {
          rangeToMainRoom: 0
        },
        room: Game.rooms[0]
      } as SpawningRequest)
    }

    super.preCheck()
    return OK;
  }

  explorerNeeded(): number {
    return 0
    // let res = 0
    // if (Game.rooms[0].controller && Game.rooms[0].controller.level > 3) {
    //   res = this.minExplorer - this.explorers.length;
    // }
    // return res
  }

  act() {
    SafeModeActivator.activeSafeModeIfNecessary()

    _.forEach(this.explorers, creep => {
      if (creep.isIdle) {
        RoleExplorer.newTask(creep);
      }
      creep.run()
    })

    super.act()
  }
}
