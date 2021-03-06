import { TickRunner } from "TickRunner";
import { RoleStaticHarvester } from "roles/RoleStaticHarvester";
import { RoleHarvester } from "roles/RoleHarvester";
import { RoleMiningSiteTruck } from "roles/RoleMiningSiteTruck";
import { RoleMiningSiteBuilder } from "roles/RoleMiningSiteBuilder";
import { SpawningRequest } from "spawner/SpawningRequest";
import { EnergyStructure } from "creep-tasks/utilities/helpers";
import { u } from 'utils/Utils';
import { profiler } from "utils/profiler";

export class MiningSite extends TickRunner {

  harvesters: Creep[] = [];
  trucks: Creep[] = [];
  builders: Creep[] = [];
  containers: StructureContainer[];
  buildingContainers: ConstructionSite[];
  minHarvesters = 1;
  memory: MiningSiteMemory;
  minTrucks = 1;
  availableEnergySources: EnergyStructure[];
  neededEnergySources: EnergyStructure[];
  truckRole = 'miningSiteTruck';
  harvesterRole = 'harvester';

  constructor(public source: Source) {
    super()
    global.pubSub.subscribe('ENERGY_AVAILABLE', this.storeAvailabelEnergySources.bind(this))
    global.pubSub.subscribe('ENERGY_NEEDED', this.storeNeededEnergySources.bind(this))
  }

  storeAvailabelEnergySources(...args: any[]) {
    console.log("test1", this.source.id)
    this.availableEnergySources = _.filter(args[0].structures, (s) => s.room.name == this.source.room.name);
  }

  storeNeededEnergySources(...args: any[]) {
    this.neededEnergySources = _.filter(args[0].structures, (s) => s.room.name == this.source.room.name);
  }

  loadData() {
    // console.log("loadData mining site", this.source.id)
    this.initMemory()
    if (this.memory) {
      this.loadCreepsFromMemory()
    }
    this.loadContainers()
    super.loadData();
  }

  initMemory() {
    if (!Memory.miningSites) { Memory.miningSites = {} }
    if (!Memory.miningSites[this.source.id]) { Memory.miningSites[this.source.id] = {} }
    this.memory = Memory.miningSites[this.source.id]
  }

  loadCreepsFromMemory() {
    // add new spawned creep to mining site memory
    let harvestersid: any[] = []
    let trucksid: any[] = []
    let buildersid: any[] = []
    _.forEach(Game.creeps, creep => {
      if (creep.memory.miningSourceId && creep.memory.miningSourceId == this.source.id) {
        if (creep.name.includes(this.harvesterRole) && !harvestersid.includes(creep.id)) {
          this.harvesters.push(creep)
          harvestersid.push(creep.id)
        }
        if (creep.name.includes(this.truckRole) && !trucksid.includes(creep.id)) {
          this.trucks.push(creep)
          trucksid.push(creep.id)
        }
      }
    })
  }

  preCheck(): number {
    // console.log("preCheck mining site")
    if (this.avoid()) {
      return -1
    }
    if (this.harvestersNeeded() > 0) {
      global.pubSub.publish('SPAWN_REQUEST', {
        role: this.harvesterRole,
        memory: {
          miningSourceId: this.source.id,
        },
        room: this.source.room,
        priority: 10,
        log: false
      } as SpawningRequest)
    }

    if (this.trucksNeeded() > 0) {
      global.pubSub.publish('SPAWN_REQUEST', {
        role: this.truckRole,
        memory: {
          miningSourceId: this.source.id,
        },
        room: this.source.room,
        priority: 2,
        log: false
      } as SpawningRequest)
      // return OK, no need for trucks driver for harvester to start working
      // this.preCheckResult = ERR_NOT_ENOUGH_RESOURCES
    }

    if (this.containerNeeded()) {
      global.pubSub.publish('BUILD_CONTAINER_NEEDED', { miningSite: this, memoryKey: 'nextContainerPos' })
      // container are not mandarory, return OK
    }

    // if (this.roadsNeeded()) {
    //   pubSub.publish('BUILD_ROAD_NEEDED', { from: this.source.pos, to: this.source.room.controller!.pos })
    //   Memory.miningSites[this.source.id].roads = true
    // }
    return this.preCheckResult;
  }

  harvestersNeeded(): number { return this.minHarvesters - this.harvesters.length; }

  trucksNeeded(): number { return this.minTrucks - this.trucks.length; }

  containerNeeded(): boolean {
    return this.containers.length < 1 && !this.memory.nextContainerPos;
  }

  avoid() {
    const closeKeeper = this.source.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
    Memory.miningSites[this.source.id].avoid = closeKeeper.length > 0
    return closeKeeper.length > 0
  }

  act(): void {
    _.forEach(this.harvesters, this.harvesterAction.bind(this))
    _.forEach(this.trucks, this.truckAction.bind(this))
  }

  harvesterAction(creep: Creep) {
    if (creep.isIdle) {
      if (this.containers.length) {
        // when container are done, creep harvest
        RoleStaticHarvester.newTask(creep, this.source, this.containers[0]);
      } else if (this.containers.length == 0 && this.buildingContainers) {
        // when container are not built yet, creep is building
        RoleMiningSiteBuilder.newTask(creep, this.source);
      } else {
        RoleHarvester.newTask(creep, this.source);
      }
    }
    creep.run()
  }

  truckAction(creep: Creep) {
    if (creep.isIdle) {
      if (this.containers.length) {
        RoleMiningSiteTruck.newTask(creep, this.availableEnergySources, this.neededEnergySources);
      } else {
        RoleHarvester.newTask(creep, this.source);
      }
    }
    creep.run()
  }

  containerFull(container: StructureContainer): boolean {
    return _.sum(container.store) == container.storeCapacity
  }

  getEmptyContainer(): StructureContainer {
    return this.containers.sort((a: StructureContainer, b: StructureContainer) => {
      return u.compareValues(a.store.energy, b.store.energy);
    })[0]
  }

  // in range of 3 sorted by empty first
  loadContainers(): void {
    // load containers or delete them
    this.containers = this.source.pos.findInRange(FIND_STRUCTURES, 3, {
      filter: i => i.structureType === STRUCTURE_CONTAINER
    }).sort((a: any, b: any) => {
      return u.compareValues(a.store.energy, b.store.energy);
    }) as StructureContainer[];

    this.buildingContainers = this.source.pos.findInRange(FIND_CONSTRUCTION_SITES, 3, {
      filter: i => i.structureType === STRUCTURE_CONTAINER
    })

    // allow to rebuild destroyed container
    if (this.containers.length == 0 && this.buildingContainers.length == 0 && this.memory.nextContainerPos) {
      this.memory.nextContainerPos = undefined
    }
    // console.log("this.containers", this.containers.length, this.buildingContainers.length)
  }
}

profiler.registerClass(MiningSite, "MiningSite");
