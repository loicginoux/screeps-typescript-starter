import { TickRunner } from "TickRunner";
import { SpawningRequest } from "spawner/SpawningRequest";
import { RoleExplorer } from "roles/RoleExplorer";
import { RoleReserver } from "roles/RoleReserver";
import { RoomDiscovery } from "utils/RoomDiscovery";
import { RoomMiningManager } from "mining/RoomMiningManager";


export class RemoteHarvestingCoordinator extends TickRunner {
  minExplorer = 1;
  roomDiscovery: RoomDiscovery
  roomMiningManagers: RoomMiningManager[]
  // reservers
  // long distance truck
  // long distance harvester
  explorers: Creep[] = [];
  reservers: Creep[] = [];
  memory: RoomMemory;

  constructor(private room: Room) {
    super()
    this.roomDiscovery = new RoomDiscovery(this.room)
  }

  employees(): any[] { return this.roomMiningManagers; }

  loadData() {
    this.initMemory()
    _.forEach(Game.creeps, creep => {
      if (creep.memory.room && creep.memory.room == this.room.name) {
        if (creep.name.includes('explorer')) {
          this.explorers.push(creep)
        }

        if (creep.name.includes('reserver')) {
          this.reservers.push(creep)
        }
      }
    })

    this.roomMiningManagers = _.map(this.visibleHarvestingRooms(), (room) => {
      return new RoomMiningManager(Game.rooms[room], true)
    })
    super.loadData();
  }


  initMemory() {
    this.memory = Memory.rooms[this.room.name];
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

    if (this.memory.remoteHarvestingOn && this.remoteHarvestingRoomWithoutReserver().length > 0) {
      global.pubSub.publish('SPAWN_REQUEST', {
        role: 'reserver',
        memory: {
          room: this.room.name,
          roomTarget: this.remoteHarvestingRoomWithoutReserver()[0]
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

    _.forEach(this.reservers, creep => {
      if (creep.isIdle) {
        RoleReserver.newTask(creep);
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

  memoryRooms() {
    return Memory.roomExploration
  }

  recalculateAllPotentialHarvestingSite() {
    for (const roomName in this.memoryRooms()) {
      this.recalculatePotentialHarvestingSite(roomName)
    }
  }

  recalculatePotentialHarvestingSite(roomName: string) {
    this.roomDiscovery.updatePotentialHarvestingSite(roomName)
  }

  remoteHarvestingRoomWithoutReserver(): string[] {
    return _.difference(this.potentialRemoteHarvestingRooms(), this.reserversRooms());
  }

  reserversRooms(): string[] {
    return _.map(this.reservers, creep => creep.memory.roomTarget)
  }

  visibleHarvestingRooms(): string[] {
    return _.intersection(_.keys(Game.rooms), this.potentialRemoteHarvestingRooms())
  }

  // W9N17,W8N16,W8N15,W9N15,W9N16,W8N17
  potentialRemoteHarvestingRooms(): string[] {
    let potentialRemoteHarvestingRooms;
    if (this.memory.forcedHarvestRooms) {
      potentialRemoteHarvestingRooms = this.memory.forcedHarvestRooms;
    } else {
      potentialRemoteHarvestingRooms = _.pluck(_.filter(this.memoryRooms(), 'potentialHarvestingSite'), 'name')
    }
    return potentialRemoteHarvestingRooms
  }

  toggleRemoteHarvesting(): boolean {
    return this.memory.remoteHarvestingOn = !this.memory.remoteHarvestingOn
  }
}
