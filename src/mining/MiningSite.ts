import { TickRunner } from "TickRunner";
import { RoleStaticHarvester } from "roles/RoleStaticHarvester";
import { RoleHarvester } from "roles/RoleHarvester";
import { RoleTruck } from "roles/RoleTruck";
import { RoleMiningSiteBuilder } from "roles/RoleMiningSiteBuilder";
import { SpawningRequest } from "spawner/SpawningRequest";
import { u } from "utils/Utils";


export class MiningSite extends TickRunner {

  harvesters: Creep[] = [];
  trucks: Creep[] = [];
  builders: Creep[] = [];
  container?: StructureContainer | null;
  buildingContainer?: ConstructionSite | null;
  container2?: StructureContainer | null;
  buildingContainer2?: ConstructionSite | null;
  minHarvesters = 1;
  minTrucks = 1;
  minBuilders = 1;
  memory: MiningSiteMemory;


  constructor(public source: Source) {
    super()
  }

  loadData() {
    this.initMemory()
    if (this.memory) {
      this.loadCreepsFromMemory()
      this.loadContainerFromMemory()
    }
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
        if (creep.name.includes('harvester') && !harvestersid.includes(creep.id)) {
          this.harvesters.push(creep)
          harvestersid.push(creep.id)
        }
        if (creep.name.includes('truck') && !trucksid.includes(creep.id)) {
          this.trucks.push(creep)
          trucksid.push(creep.id)
        }
        if (creep.name.includes('miningSiteBuilder') && !buildersid.includes(creep.id)) {
          this.builders.push(creep)
          buildersid.push(creep.id)
        }
      }
    })
  }

  preCheck(): number {
    if (this.avoid()) {
      return -1
    }
    if (this.harvestersNeeded() > 0) {
      global.pubSub.publish('SPAWN_REQUEST', {
        role: 'harvester',
        miningSite: this,
        priority: 2
      } as SpawningRequest)
    }

    if (this.trucksNeeded() > 0) {
      global.pubSub.publish('SPAWN_REQUEST', {
        role: 'truck',
        miningSite: this,
        priority: 2
      } as SpawningRequest)
      // return OK, no need for trucks driver for harvester to start working
      // this.preCheckResult = ERR_NOT_ENOUGH_RESOURCES
    }
    if (this.builderNeeded() > 0) {
      global.pubSub.publish('SPAWN_REQUEST', {
        role: 'miningSiteBuilder',
        miningSite: this,
        priority: 1
      } as SpawningRequest)
    }

    if (this.containerNeeded()) {
      global.pubSub.publish('BUILD_CONTAINER_NEEDED', { miningSite: this, memoryKey: 'nextContainerPos' })
      // container are not mandarory, return OK
    }
    if (this.container2Needed()) {
      // global.pubSub.publish('BUILD_CONTAINER_NEEDED', { miningSite: this, memoryKey: 'nextContainerPos2' })
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

  builderNeeded(): number {
    if (!this.container && this.source.room.controller && this.source.room.controller.level > 1) {
      return this.minBuilders - this.builders.length;
    }
    return 0
  }

  // roadsNeeded(): boolean {
  //   return !!this.source.room.controller && this.source.room.controller.level > 1 && !this.memory.roads
  // }

  containerNeeded(): boolean {
    return !this.container && !this.memory.buildingContainer;
  }

  container2Needed(): boolean {
    return !this.container2 && !this.memory.buildingContainer2 && (!this.source.room.controller || this.source.room.controller.level > 2);
  }

  avoid() {
    const closeKeeper = this.source.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
    Memory.miningSites[this.source.id].avoid = closeKeeper.length > 0
    return closeKeeper.length > 0
  }

  act(): void {
    _.forEach(this.harvesters, creep => {
      if (creep.isIdle) {
        if (this.container) {
          // when container are done, creep harvest
          RoleStaticHarvester.newTask(creep, this.source, this.container);
        } else if (!this.container && this.buildingContainer) {
          // when container are not built yet, creep is building
          RoleMiningSiteBuilder.newTask(creep, this.source);
        } else {
          RoleHarvester.newTask(creep, this.source);
        }
      }
      creep.run()
    })

    _.forEach(this.trucks, creep => {
      if (creep.isIdle) {
        if (this.container) {
          RoleTruck.newTask(creep, this.container);
        } else {
          RoleHarvester.newTask(creep, this.source);
        }
      }
      creep.run()
    })

    _.forEach(this.builders, creep => {
      if (creep.isIdle) {
        // this.cleanBuildingContainersMemory()
        if (this.memory.buildingContainer && !this.container) {
          RoleMiningSiteBuilder.newTask(creep, this.source);
        } else if (this.container) {
          RoleStaticHarvester.newTask(creep, this.source, this.container);
        }
      }
      creep.run()
    })
  }

  containerFull(container: StructureContainer): boolean {
    return _.sum(container.store) == container.storeCapacity
  }

  loadContainerFromMemory(): void {
    // load containers or delete them
    if (this.memory.container) {
      this.container = Game.getObjectById(this.memory.container);
      if (!this.container) { delete (this.memory.container) }
    }
    if (this.memory.container2) {
      this.container = Game.getObjectById(this.memory.container);
      if (!this.container) { delete (this.memory.container) }
    }
    // load building containers,  or delete them
    // if just finished building, add new container to memory
    if (this.memory.buildingContainer) {
      this.buildingContainer = Game.getObjectById(this.memory.buildingContainer);
      if (!this.buildingContainer) {
        delete (this.memory.buildingContainer)
        // building container finished, keep built container in memory
        let containers = this.source.room.find(FIND_STRUCTURES, {
          filter: (i) => i.structureType == STRUCTURE_CONTAINER && i.pos.x == this.memory.nextContainerPos!.x && i.pos.y == this.memory.nextContainerPos!.y
        }) as StructureContainer[];
        if (containers.length > 0) {
          this.memory.container = containers[0].id
        }
      }
    }
    if (this.memory.buildingContainer2) {
      this.buildingContainer2 = Game.getObjectById(this.memory.buildingContainer2);
      if (!this.buildingContainer2) {
        delete (this.memory.buildingContainer2)
        // building container finished, keep built container in memory
        let containers = this.source.room.find(FIND_STRUCTURES, {
          filter: (i) => i.structureType == STRUCTURE_CONTAINER && i.pos.x == this.memory.nextContainerPos2!.x && i.pos.y == this.memory.nextContainerPos2!.y
        }) as StructureContainer[];
        if (containers.length > 0) {
          this.memory.container2 = containers[0].id
        }
      }
    }
    // add building container to memory when architect just created it on last tick
    if (this.memory.nextContainerPos && !this.memory.container) {
      const constructionSites = this.source.room.lookForAt(LOOK_CONSTRUCTION_SITES, this.memory.nextContainerPos.x, this.memory.nextContainerPos.y);
      if (constructionSites.length > 0) {
        this.memory.buildingContainer = constructionSites[0].id
      }
    }
    if (this.memory.nextContainerPos2 && !this.memory.container2) {
      const constructionSites = this.source.room.lookForAt(LOOK_CONSTRUCTION_SITES, this.memory.nextContainerPos2.x, this.memory.nextContainerPos2.y);
      if (constructionSites.length > 0) {
        this.memory.buildingContainer2 = constructionSites[0].id
      }
    }
  }
}
