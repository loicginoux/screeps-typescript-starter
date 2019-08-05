import { Spawner } from "spawner/Spawner";
import { Architect } from "Architect";
import { MiningMinister } from "mining/MiningMinister";
import { RoomDefenseManager } from "defense/RoomDefenseManager";
import { TowersManager } from "TowersManager";
import { EnergyManager } from "EnergyManager";
import { TickRunner } from "TickRunner";
import { SpawningRequest } from "spawner/SpawningRequest";
import { RoleUpgrader } from "roles/RoleUpgrader";
import { RoleBuilder } from "roles/RoleBuilder";
import { RoleTruck } from "roles/RoleTruck";
import { RoomPlanner } from "room_planning/RoomPlanner";
import { u } from 'utils/Utils';
import { EnergyStructure } from "creep-tasks/utilities/helpers";


export class RoomCommander extends TickRunner {
  spawner: Spawner;
  architect: Architect;
  miningMinister: MiningMinister;
  roomDefenseManager: RoomDefenseManager;
  towersManager: TowersManager;
  energyManager: EnergyManager;
  roomPlanner: RoomPlanner;
  minUpgraders = 3;
  minBuilders = 2;
  minTrucks = 2;
  // extensionsNeededCount: number | null;
  upgraders: Creep[] = [];
  builders: Creep[] = [];
  trucks: Creep[] = [];
  memory: RoomMemory;
  availableEnergySources: EnergyStructure[];
  neededEnergySources: EnergyStructure[];

  constructor(private room: Room) {
    super()
    this.spawner = new Spawner(this.room)
    this.architect = new Architect(this.room)
    this.miningMinister = new MiningMinister(this.room)
    this.towersManager = new TowersManager(this.room)
    this.energyManager = new EnergyManager(this.room)
    this.roomDefenseManager = new RoomDefenseManager(this.room)
    this.roomPlanner = new RoomPlanner(this.room)
    global.pubSub.subscribe('ENERGY_AVAILABLE', this.storeAvailabelEnergySources.bind(this))
    global.pubSub.subscribe('ENERGY_NEEDED', this.storeNeededEnergySources.bind(this))
  }

  employees(): any[] {
    return [this.spawner, this.miningMinister, this.towersManager, this.roomDefenseManager, this.energyManager];
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
        towersManager: {},
        defenseManager: {},
        energyManager: {},
        extensions: 0
      }
    }
    this.roomPlanner.initMemory()
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
        if (creep.name.includes('truck')) {
          this.trucks.push(creep);
        }
      }
    })
  }

  preCheck(): number {
    if (this.upgradersNeeded() > 0) {
      global.pubSub.publish('SPAWN_REQUEST', {
        role: 'upgrader',
        memory: {
          room: this.room.name
        },
        priority: (this.room.controller ? this.room.controller.level : 1),
        room: this.room
      } as SpawningRequest)
    }

    if (this.trucksNeeded() > 0) {
      global.pubSub.publish('SPAWN_REQUEST', {
        role: 'truck',
        memory: {
          room: this.room.name
        },
        priority: 2
      } as SpawningRequest)
      // return OK, no need for trucks driver for harvester to start working
      // this.preCheckResult = ERR_NOT_ENOUGH_RESOURCES
    }

    // build roads to controller
    // if destroyed will be rebuilt every 1000
    // if (!this.memory.ctrlRoads || u.every(1000)) {
    //   this.roomPlanner.buildControllerRoads()
    //   this.memory.ctrlRoads = true
    // }

    // if ((!this.memory.sourceRoads || u.every(1000)) && this.room.controller && this.room.controller.level >= 3) {
    //   this.roomPlanner.buildSourceRoads()
    //   this.memory.sourceRoads = true
    // }

    if (this.cityConstructionsNeeded()) {
      this.roomPlanner.createConstructionSites(this.room.controller!.level)
      this.memory.cityConstructionLevel = this.room.controller!.level
    }

    if (this.roomBuildersNeeded()) {
      global.pubSub.publish('SPAWN_REQUEST', {
        role: 'builder',
        memory: {
          room: this.room.name
        },
        priority: 1,
        room: this.room
      } as SpawningRequest)
    }

    // if (this.extensionsNeeded() > 0) {
    //   let firstSpawner = this.room.find(FIND_MY_STRUCTURES, {
    //     filter: i => i.structureType === STRUCTURE_SPAWN
    //   }) as StructureSpawn[];
    //   if (firstSpawner[0]) {
    //     global.pubSub.publish('BUILD_EXTENSION', {
    //       near: firstSpawner[0].pos,
    //       extensionCount: this.extensionsNeeded(),
    //       room: this.room,
    //     })
    //   }
    // }
    super.preCheck()
    return OK;
  }

  act() {
    if (this.roomPlanner && this.roomPlanner.memory && this.roomPlanner.memory.plans.roads.length == 0) {
      this.roomPlanner.planCity()
    }
    this.roomPlanner.drawCity();

    _.forEach(this.upgraders, creep => {
      if (creep.isIdle) {
        RoleUpgrader.newTask(creep, this.availableEnergySources);
      }
      creep.run()
    })

    _.forEach(this.trucks, creep => {
      if (creep.isIdle) {
        RoleTruck.newTask(creep, this.availableEnergySources, this.neededEnergySources);
      }
      creep.run()
    })

    _.forEach(this.builders, creep => {
      if (creep.isIdle) {
        RoleBuilder.newTask(creep, this.availableEnergySources);
      }
      creep.run()
    })

    super.act()
  }

  finalize() {
    u.displayVisualRoles(this.room);
    super.finalize()
  }

  storeAvailabelEnergySources(...args: any[]) { this.availableEnergySources = args[0].structures; }
  storeNeededEnergySources(...args: any[]) { this.neededEnergySources = args[0].structures; }

  upgradersNeeded(): number { return this.minUpgraders - this.upgraders.length; }

  trucksNeeded(): number { return this.minTrucks - this.trucks.length; }

  roomBuildersNeeded(): boolean {
    return !!this.memory.ctrlRoads && ((this.minBuilders - this.builders.length) > 0);
  }

  cityConstructionsNeeded(): boolean | undefined {
    // return false;
    return this.room.controller && (!this.memory.cityConstructionLevel || this.room.controller.level > this.memory.cityConstructionLevel);
  }

  // extensionsNeeded(): number {
  //   if (this.extensionsNeededCount) {
  //     return this.extensionsNeededCount
  //   }
  //   let extensions = this.room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_EXTENSION }) as StructureExtension[];
  //   this.extensionsNeededCount = 0
  //   let extensionsAtLevel = 0
  //   let extensions_per_level = [0, 0, 5, 10, 20, 30, 40, 50, 60]
  //   if (this.room.controller) {
  //     extensionsAtLevel = extensions_per_level[this.room.controller.level]
  //     this.extensionsNeededCount = extensionsAtLevel - extensions.length
  //   }
  //   return this.extensionsNeededCount;
  // }


}
