import { Spawner } from "spawner/Spawner";
import { Architect } from "Architect";
import { MiningMinister } from "mining/MiningMinister";
import { TowersManager } from "TowersManager";
import { TickRunner } from "TickRunner";
import { SpawningRequest } from "spawner/SpawningRequest";
import { RoleUpgrader } from "roles/RoleUpgrader";
import { RoleBuilder } from "roles/RoleBuilder";
import { RoomPlanner } from "room_planning/RoomPlanner";
import { u } from 'utils/Utils';


export class RoomCommander extends TickRunner {
  spawner: Spawner;
  architect: Architect;
  miningMinister: MiningMinister;
  towersManager: TowersManager;
  roomPlanner: RoomPlanner;
  minUpgraders = 2;
  minBuilders = 4;
  extensionsNeededCount: number | null;
  upgraders: Creep[] = [];
  builders: Creep[] = [];
  memory: RoomMemory;

  constructor(private room: Room) {
    super()
    this.spawner = new Spawner(this.room)
    this.architect = new Architect(this.room)
    this.miningMinister = new MiningMinister(this.room)
    this.towersManager = new TowersManager(this.room)
    this.roomPlanner = new RoomPlanner(this.room)
  }

  employees(): any[] {
    return [this.spawner, this.miningMinister, this.towersManager];
  }

  loadData() {
    this.initMemory()
    if (this.memory) {
      this.loadCreepsFromMemory();
    }
    super.loadData();
  }


  initMemory() {
    if (!Memory.rooms) { Memory.rooms = {} }
    if (!Memory.rooms[this.room.name]) {
      Memory.rooms[this.room.name] = {
        minUpgraders: 2,
        minBuilders: 2,
        towersManager: {},
        extensions: 0
      }
    }
    this.memory = Memory.rooms[this.room.name];
  }

  loadCreepsFromMemory() {

    // add new spawned creep to mining site memory
    let upgradersid: any[] = []
    let buildersid: any[] = []
    _.forEach(Game.creeps, creep => {
      if (creep.memory.room && creep.memory.room == this.room.name) {
        if (creep.name.includes('upgrader') && !upgradersid.includes(creep.id)) {
          this.upgraders.push(creep)
          upgradersid.push(creep.id)
        }
        if (creep.name.includes('builder') && !buildersid.includes(creep.id)) {
          this.builders.push(creep)
          buildersid.push(creep.id)
        }
      }
    })
  }

  preCheck(): number {
    if (this.upgradersNeeded() > 0) {
      global.pubSub.publish('SPAWN_REQUEST', {
        role: 'upgrader',
        priority: Game.gcl.level,
        room: this.room
      } as SpawningRequest)
    }

    // build roads to controller
    // if destroyed will be rebuilt every 1000
    if (!this.memory.ctrlRoads || u.every(1000)) {
      this.roomPlanner.buildControllerRoads()
      this.memory.ctrlRoads = true
    }

    if (this.roomBuildersNeeded()) {
      global.pubSub.publish('SPAWN_REQUEST', {
        role: 'builder',
        priority: 1,
        room: this.room
      } as SpawningRequest)
    }
    console.log("this.extensionsNeeded()", this.extensionsNeeded())
    if (this.extensionsNeeded() > 0) {
      let firstSpawner = this.room.find(FIND_MY_STRUCTURES, {
        filter: i => i.structureType === STRUCTURE_SPAWN
      }) as StructureSpawn[];
      if (firstSpawner[0]) {
        global.pubSub.publish('BUILD_EXTENSION', {
          near: firstSpawner[0].pos,
          extensionCount: this.extensionsNeeded(),
          room: this.room,
        })
      }
    }

    super.preCheck()
    return OK;
  }

  act() {
    _.forEach(this.upgraders, creep => {
      if (creep.isIdle) {
        RoleUpgrader.newTask(creep);
      }
      creep.run()
    })

    _.forEach(this.builders, creep => {
      if (creep.isIdle) {
        RoleBuilder.newTask(creep);
      }
      creep.run()
    })

    super.act()
  }

  upgradersNeeded(): number {
    return this.minUpgraders - this.upgraders.length;
  }

  roomBuildersNeeded(): boolean {
    return !!this.memory.ctrlRoads && ((this.minBuilders - this.builders.length) > 0);
  }

  extensionsNeeded(): number {
    if (this.extensionsNeededCount) {
      return this.extensionsNeededCount
    }
    this.extensionsNeededCount = 0
    let extensions_per_level = [0, 0, 5, 10, 20, 30, 40, 50, 60]
    if (this.room.controller) {
      this.extensionsNeededCount = extensions_per_level[this.room.controller.level]
      if (!this.memory.extensions) {
        this.memory.extensions = 0
      }
      this.extensionsNeededCount -= this.memory.extensions
    }
    return this.extensionsNeededCount;
  }
}
