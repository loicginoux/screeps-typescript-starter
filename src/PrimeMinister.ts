import { Spawner } from "spawner/Spawner";
import { Architect } from "Architect";
import { MiningMinister } from "mining/MiningMinister";
import { TickRunner } from "TickRunner";
import { RoomCommander } from "RoomCommander";
export class PrimeMinister extends TickRunner {
  roomCommanders!: RoomCommander[];

  // build memory data from creeps roles (including newly spawned)
  // build memory data from finished construction sites
  loadData(): void {
    this.buildMemory()


    this.roomCommanders = _.map(Game.rooms, room => {
      const roomCommander = new RoomCommander(room)
      return roomCommander
    });
    // do not forget
    super.loadData();
  }

  buildMemory(): void {
    this.initMiningSitesMemory();
    this.initRoomMemory();

    _.forEach(Game.creeps, creep => {
      this.rebuildMRoomMemoryFromCreeps(creep);
      this.rebuildMiningSitesMemoryFromCreeps(creep);
    })
  }

  initRoomMemory(): void {
    if (!Memory.rooms) { Memory.rooms = {} }

    _.forEach(Game.rooms, room => {
      if (!Memory.rooms[room.name]) {
        Memory.rooms[room.name] = {
          upgraders: [],
          minUpgraders: 2
        }
      }
    })
  }

  initMiningSitesMemory(): void {
    if (!Memory.miningSites) { Memory.miningSites = {} }
    this.buildMiningSiteContainerMemory();
  }

  rebuildMRoomMemoryFromCreeps(creep: Creep) {
    let creepRoom = creep.memory.room
    if (creepRoom && creep.name.includes('upgrader') && !Memory.rooms[creepRoom].upgraders.includes(creep.id)) {
      Memory.rooms[creepRoom].upgraders.push(creep.id)
    }
  }

  rebuildMiningSitesMemoryFromCreeps(creep: Creep) {
    let creepMiningSourceId = creep.memory.miningSourceId
    if (creepMiningSourceId) {
      if (!Memory.miningSites[creepMiningSourceId]) {
        Memory.miningSites[creepMiningSourceId] = {
          harvesters: [],
          trucks: [],
          containers: [],
          builders: [],
          buildingContainers: []
        }
      }
      if (creep.name.includes('harvester') && !Memory.miningSites[creepMiningSourceId].harvesters.includes(creep.id)) {
        Memory.miningSites[creepMiningSourceId].harvesters.push(creep.id)
      }
      if (creep.name.includes('truck') && !Memory.miningSites[creepMiningSourceId].trucks.includes(creep.id)) {
        Memory.miningSites[creepMiningSourceId].trucks.push(creep.id)
      }
      if (creep.name.includes('builder') && !Memory.miningSites[creepMiningSourceId].builders.includes(creep.id)) {
        Memory.miningSites[creepMiningSourceId].builders.push(creep.id)
      }
    }
  }

  buildMiningSiteContainerMemory() {
    _.forEach(Game.rooms, room => {
      var sources = room.find(FIND_SOURCES);
      for (var sourceIndex in sources) {
        var source = sources[sourceIndex];
        if (!Memory.miningSites[source.id]) {
          Memory.miningSites[source.id] = {
            harvesters: [],
            trucks: [],
            containers: [],
            builders: [],
            buildingContainers: []
          }
        } else if (Memory.miningSites[source.id].containers.length == 0 || Memory.miningSites[source.id].buildingContainers.length == 0) {
          const closeContainer: StructureContainer = source.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: i => i.structureType === "container"
          })[0] as any;
          if (closeContainer) {
            Memory.miningSites[source.id].containers.push(closeContainer.id)
          }
        }
      }
    })
  }

  employees(): any[] {
    return this.roomCommanders;
  }
}
