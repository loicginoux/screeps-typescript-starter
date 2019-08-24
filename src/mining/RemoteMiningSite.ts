import { RoleHarvester } from "roles/RoleHarvester";
import { RoleRemoteMiningSiteTruck } from "roles/RoleRemoteMiningSiteTruck";
import { RoleMiningSiteBuilder } from "roles/RoleMiningSiteBuilder";
import { MiningSite } from "mining/MiningSite";
import { RoomDiscovery } from "utils/RoomDiscovery";

import { u } from 'utils/Utils';
import { spawn } from "child_process";

export class RemoteMiningSite extends MiningSite {
  truckRole = 'remoteMiningSiteTruck';
  harvesterRole = 'remoteHarvester';
  minTrucks = 2;

  preCheck(): number {
    if (this.roadsNeeded()) {
      const roomDiscovery = new RoomDiscovery(this.source.room)
      const cityRoom = Game.rooms[roomDiscovery.memory.nearestCity.room]
      if (cityRoom) {
        let spawner = cityRoom.find(FIND_MY_STRUCTURES, {
          filter: i => i.structureType === STRUCTURE_SPAWN
        }) as StructureSpawn[];
        if (spawner[0]) {
          global.pubSub.publish('BUILD_ROAD_NEEDED', { from: this.source.pos, to: spawner[0].pos })
          Memory.miningSites[this.source.id].roads = true
        }
      }
    }
    super.preCheck()
    return OK;
  }

  roadsNeeded(): boolean {
    return !!this.source.room.controller && (!this.memory.roads || u.every(1000))
  }

  truckAction(creep: Creep) {
    if (creep.isIdle) {
      if (this.containers.length) {
        RoleRemoteMiningSiteTruck.newTask(creep, this.availableEnergySources, this.neededEnergySources);
      } else if (this.containers.length == 0 && this.buildingContainers) {
        // when container are not built yet, creep is building
        RoleMiningSiteBuilder.newTask(creep, this.source);
      } else {
        RoleHarvester.newTask(creep, this.source);
      }
    }
    creep.run()
  }

  // only get energy from remote rooms (not in bases)
  storeAvailabelEnergySources(...args: any[]) {
    this.availableEnergySources = _.filter(args[0].structures, (s) => _.indexOf(Memory.mainRooms, s.room.name) == -1)
    // this.availableEnergySources = _.filter(args[0].structures, (s) => _.includes(this.containers.map(i => i.id), s.id))
  }

  // only transfer energy to base rooms
  storeNeededEnergySources(...args: any[]) {
    this.neededEnergySources = _.filter(args[0].structures, (s) => _.indexOf(Memory.mainRooms, s.room.name) != -1)
  }

}
