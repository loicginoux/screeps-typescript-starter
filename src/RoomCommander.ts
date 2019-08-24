import { Spawner } from "spawner/Spawner";
import { RoomMiningManager } from "mining/RoomMiningManager";
import { RoomDefenseManager } from "defense/RoomDefenseManager";
import { TowersManager } from "TowersManager";
import { TickRunner } from "TickRunner";
import { SpawningRequest } from "spawner/SpawningRequest";
import { RoleUpgrader } from "roles/RoleUpgrader";
import { RoleBuilder } from "roles/RoleBuilder";
import { RoleTruck } from "roles/RoleTruck";
import { RoomPlanner } from "room_planning/RoomPlanner";
import { u } from 'utils/Utils';
import { EnergyStructure } from "creep-tasks/utilities/helpers";
import { RemoteHarvestingCoordinator } from "RemoteHarvestingCoordinator";


export class RoomCommander extends TickRunner {
  spawner: Spawner;

  roomMiningManager: RoomMiningManager;
  roomDefenseManager: RoomDefenseManager;
  towersManager: TowersManager;
  roomPlanner: RoomPlanner;
  remoteHarvestingCoordinator: RemoteHarvestingCoordinator;
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
  links: StructureLink[] = [];

  constructor(private room: Room) {
    super()
    this.spawner = new Spawner(this.room)
    this.roomMiningManager = new RoomMiningManager(this.room)
    this.towersManager = new TowersManager(this.room)
    this.roomDefenseManager = new RoomDefenseManager(this.room)
    this.roomPlanner = new RoomPlanner(this.room)
    this.links = room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_LINK }) as StructureLink[]
    this.remoteHarvestingCoordinator = new RemoteHarvestingCoordinator(this.room)
    global.pubSub.subscribe('ENERGY_AVAILABLE', this.storeAvailabelEnergySources.bind(this))
    global.pubSub.subscribe('ENERGY_NEEDED', this.storeNeededEnergySources.bind(this))
  }

  employees(): any[] {
    return [
      this.spawner,
      this.roomMiningManager,
      this.remoteHarvestingCoordinator,
      this.towersManager,
      this.roomDefenseManager,
    ];
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
        remoteHarvestingOn: true,
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
        room: this.room,
        log: false
      } as SpawningRequest)
    }

    if (this.trucksNeeded() > 0) {
      global.pubSub.publish('SPAWN_REQUEST', {
        role: 'truck',
        memory: {
          room: this.room.name
        },
        priority: 2,
        room: this.room,
        log: false
      } as SpawningRequest)
      // return OK, no need for trucks driver for harvester to start working
      // this.preCheckResult = ERR_NOT_ENOUGH_RESOURCES
    }

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
        room: this.room,
        log: false
      } as SpawningRequest)
    }

    if (this.storageNeeded()) {
      let firstSpawner = this.room.find(FIND_MY_STRUCTURES, {
        filter: i => i.structureType === STRUCTURE_SPAWN
      }) as StructureSpawn[];
      if (firstSpawner[0]) {
        global.pubSub.publish('BUILD_STORAGE', {
          near: firstSpawner[0].pos,
          room: this.room,
        })
      }
    }

    if (this.linksLevel5Needed()) {
      // 2 links available
      global.pubSub.publish('BUILD_LINK', {
        near: this.room.storage!.pos,
        room: this.room,
      })
      global.pubSub.publish('BUILD_LINK', {
        near: this.room.controller!.pos,
        room: this.room,
      })
    }

    // if (this.linksLevel6Needed()) {
    //   const sources = this.room.find(FIND_SOURCES);
    //   global.pubSub.publish('BUILD_LINK', {
    //     near: sources[0].pos,
    //     room: this.room,
    //   })
    // }

    // if (this.linksLevel7Needed()) {
    //   const sources = this.room.find(FIND_SOURCES);
    //   if (sources.length >= 2) {
    //     global.pubSub.publish('BUILD_LINK', {
    //       near: sources[1].pos,
    //       room: this.room,
    //     })
    //   }
    // }
    if (this.linksLevel8Needed()) {
      console.log("2 more links available... USE IT")
    }

    // if (this.links.length < this.optimalLinksNumber()) {
    //   console.log("links available, place them manually or setup to/from")
    // }

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

  storageNeeded(): boolean { return !!(!this.room.storage && this.room.controller && this.room.controller.level >= 4); }

  linksLevel5Needed(): boolean { return !!(this.room.storage && this.room.controller && this.room.controller.level >= 5 && this.links.length == 0); }
  linksLevel6Needed(): boolean { return !!(this.room.storage && this.room.controller && this.room.controller.level >= 6 && this.links.length == 2); }
  linksLevel7Needed(): boolean { return !!(this.room.storage && this.room.controller && this.room.controller.level >= 7 && this.links.length == 3); }
  linksLevel8Needed(): boolean { return !!(this.room.storage && this.room.controller && this.room.controller.level >= 8 && this.links.length == 4); }

  // optimalLinksNumber(): number {
  //   let LinksAtLevel = 0
  //   let links_per_level = [0, 0, 0, 0, 0, 2, 3, 4, 6]
  //   if (this.room.controller) {
  //     LinksAtLevel = links_per_level[this.room.controller.level]
  //   }
  //   return LinksAtLevel;
  // }

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

    this.doLinkTransfer();

    super.act()
  }

  // finalize() {
  //   // u.displayVisualRoles(this.room);
  //   super.finalize()
  // }

  storeAvailabelEnergySources(...args: any[]) {
    this.availableEnergySources = _.filter(args[0].structures, (s) => s.room.name == this.room.name);
  }

  storeNeededEnergySources(...args: any[]) {
    this.neededEnergySources = _.filter(args[0].structures, (s) => s.room.name == this.room.name);
  }

  upgradersNeeded(): number {
    let res = this.minUpgraders - this.upgraders.length
    // only spawn upgraders when enough energy
    if (this.room.energyAvailable / this.room.energyCapacityAvailable <= 0.5) {
      res = 0
    } else if (this.room.storage && this.room.storage.store.energy < 1000) {
      let res = 1 - this.upgraders.length
    }
    return res;
  }

  trucksNeeded(): number { return this.minTrucks - this.trucks.length; }

  roomBuildersNeeded(): boolean {
    return (this.minBuilders - this.builders.length) > 0;
  }

  cityConstructionsNeeded(): boolean | undefined {
    // return false;
    return this.room.controller && (!this.memory.cityConstructionLevel || this.room.controller.level > this.memory.cityConstructionLevel);
  }

  doLinkTransfer() {
    // console.log("doLinkTransfer")
    this.links.forEach(link => {
      // 3% lost on transfer
      if (link.energy > 3 && u.linkType(link) == 'from') {
        // console.log("found link for tranfer", link.pos)
        let target = this.findRecipientLink(link.energy)
        if (target) {
          // console.log("found receiver link for tranfer", link.pos)
          link.transferEnergy(target)
        }
      }
    });
  }

  findRecipientLink(amountReceived: number): StructureLink | undefined {
    return _.find(this.links, link => {
      // console.log("linkType", link.pos, this.linkType(link))
      // console.log("link.energy", link.energy, amountReceived, link.energyCapacity)
      // console.log("test", (link.energy + amountReceived) < link.energyCapacity && this.linkType(link) == 'to')
      return (link.energy + amountReceived) <= link.energyCapacity && u.linkType(link) == 'to'
    })
  }

  getProgress() {
    const room = this.room.name;
    Memory.lastProgress = Memory.lastProgress || 0;
    Memory.lastCheckTime = Memory.lastCheckTime || 0;
    const perTick = (Game.rooms[room].controller!.progress - Memory.lastProgress) / (Game.time - Memory.lastCheckTime);
    console.log('Progress:', perTick);
    Memory.lastCheckTime = Game.time;
    Memory.lastProgress = Game.rooms[room].controller!.progress;
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
