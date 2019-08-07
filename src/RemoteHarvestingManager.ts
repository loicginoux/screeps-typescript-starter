import { TickRunner } from "TickRunner";
import { SpawningRequest } from "spawner/SpawningRequest";
import { RoleExplorer } from "roles/RoleExplorer";
// import { Spawner } from "spawner/Spawner";
// import { Architect } from "Architect";
// import { MiningMinister } from "mining/MiningMinister";
// import { RoomDefenseManager } from "defense/RoomDefenseManager";
// import { TowersManager } from "TowersManager";
// import { EnergyManager } from "EnergyManager";
// import { RoleUpgrader } from "roles/RoleUpgrader";
// import { RoleTruck } from "roles/RoleTruck";
// import { RoomPlanner } from "room_planning/RoomPlanner";
// import { u } from 'utils/Utils';
// import { EnergyStructure } from "creep-tasks/utilities/helpers";


export class RemoteHarvestingManager extends TickRunner {
  minExplorer = 1;

  // reservers
  // long distance truck
  // long distance harvester
  explorers: Creep[] = [];

  constructor(private room: Room) {
    super()
  }


  loadData() {
    _.forEach(Game.creeps, creep => {
      if (creep.memory.room && creep.memory.room == this.room.name) {
        if (creep.name.includes('explorer')) {
          this.explorers.push(creep)
        }
      }
    })
    super.loadData();
  }


  initMemory() {

  }


  preCheck(): number {
    if (this.explorersNeeded() > 0) {
      global.pubSub.publish('SPAWN_REQUEST', {
        role: 'explorer',
        memory: {
          room: this.room.name
        },
        priority: 1,
        room: this.room
      } as SpawningRequest)
    }

    if (this.remoteHarvestingRoomWithoutReserver().length > 0) {
      global.pubSub.publish('SPAWN_REQUEST', {
        role: 'reserver',
        memory: {
          room: this.room.name,
          roomTarget: this.remoteHarvestingRoomWithoutReserver()[0].name
        },
        priority: 1,
        room: this.room
      } as SpawningRequest)
    }

    super.preCheck()
    return OK;
  }

  act() {
    _.forEach(this.explorers, creep => {
      if (creep.isIdle) {
        RoleExplorer.newTask(creep);
      }
      creep.run()
    })

    super.act()
  }

  explorersNeeded(): number {
    let res = 0
    if (this.room.controller && this.room.controller.level > 3) {
      res = this.minExplorer - this.explorers.length;
    }
    return res
  }

  remoteHarvestingRoomWithoutReserver(): Room[] {
    return []
  }
}
