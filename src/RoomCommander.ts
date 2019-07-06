import { Spawner } from "spawner/Spawner";
import { Architect } from "Architect";
import { MiningMinister } from "mining/MiningMinister";
import { TowersManager } from "TowersManager";
import { TickRunner } from "TickRunner";
import { SpawningRequest } from "spawner/SpawningRequest";
import { RoleUpgrader } from "roles/RoleUpgrader";
import { RoleBuilder } from "roles/RoleBuilder";
import { RoomPlanner } from "room_planning/RoomPlanner";

export class RoomCommander extends TickRunner {
  spawner: Spawner;
  architect: Architect;
  miningMinister: MiningMinister;
  towersManager: TowersManager;
  roomPlanner: RoomPlanner;
  minUpgraders = 2;
  minBuilders = 2;
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
        towersManager: {}
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

    if (!this.memory.ctrlRoads) {
      let controllerEnergeySources = _.sortBy(this.room.find(FIND_SOURCES_ACTIVE), s => this.room.controller!.pos.getRangeTo(s))
      if (controllerEnergeySources.length > 0) {
        global.pubSub.publish('BUILD_ROAD_NEEDED', {
          from: this.room.controller!.pos,
          to: controllerEnergeySources[0].pos
        })
      }
      this.memory.ctrlRoads = true
    }

    if (this.roomBuildersNeeded()) {
      global.pubSub.publish('SPAWN_REQUEST', {
        role: 'builder',
        priority: 1,
        room: this.room
      } as SpawningRequest)
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
}
