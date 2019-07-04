import { Spawner } from "spawner/Spawner";
import { Architect } from "Architect";
import { MiningMinister } from "mining/MiningMinister";
import { TickRunner } from "TickRunner";
import { RoomCommander } from "RoomCommander";

export class Empire extends TickRunner {
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
      this.rebuildRoomMemoryFromCreeps(creep);
      this.rebuildMiningSitesMemoryFromCreeps(creep);
    })
  }

  initRoomMemory(): void {
    if (!Memory.rooms) { Memory.rooms = {} }

    _.forEach(Game.rooms, room => {
      if (!Memory.rooms[room.name]) {
        Memory.rooms[room.name] = {
          upgraders: [],
          minUpgraders: 2,
          minBuilders: 2,
          towersManager: {}
        }
      }
    })
  }

  initMiningSitesMemory(): void {
    if (!Memory.miningSites) { Memory.miningSites = {} }
    this.buildMiningSiteContainerMemory();
  }

  rebuildRoomMemoryFromCreeps(creep: Creep) {
    let creepRoom = creep.memory.room
    if (!creepRoom) { return }

    if (!Memory.rooms[creepRoom].upgraders) { Memory.rooms[creepRoom].upgraders = [] }
    if (creepRoom && creep.name.includes('upgrader') && !Memory.rooms[creepRoom].upgraders.includes(creep.id)) {
      Memory.rooms[creepRoom].upgraders.push(creep.id)
    }

    if (!Memory.rooms[creepRoom].builders) { Memory.rooms[creepRoom].builders = [] }
    if (creepRoom && creep.name.includes('builder') && !Memory.rooms[creepRoom].builders!.includes(creep.id)) {
      Memory.rooms[creepRoom].builders!.push(creep.id)
    }
  }

  rebuildMiningSitesMemoryFromCreeps(creep: Creep) {
    let creepMiningSourceId = creep.memory.miningSourceId
    if (creepMiningSourceId) {
      if (!Memory.miningSites[creepMiningSourceId]) {
        Memory.miningSites[creepMiningSourceId] = {
          harvesters: [],
          trucks: [],
          builders: []
        }
      }
      if (creep.name.includes('harvester') && !Memory.miningSites[creepMiningSourceId].harvesters.includes(creep.id)) {
        Memory.miningSites[creepMiningSourceId].harvesters.push(creep.id)
      }
      if (creep.name.includes('truck') && !Memory.miningSites[creepMiningSourceId].trucks.includes(creep.id)) {
        Memory.miningSites[creepMiningSourceId].trucks.push(creep.id)
      }
      if (creep.name.includes('miningSiteBuilder') && !Memory.miningSites[creepMiningSourceId].builders.includes(creep.id)) {
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
            builders: []
          }
        }
      }
    })
  }

  employees(): TickRunner[] {
    return this.roomCommanders;
  }
}
