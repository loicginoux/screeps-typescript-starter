import { TickRunner } from "TickRunner";
import { pubSub } from "utils/PubSub";
import { RoleStaticHarvester } from "roles/RoleStaticHarvester";
import { RoleHarvester } from "roles/RoleHarvester";
import { RoleTruck } from "roles/RoleTruck";
import { RoleBuilder } from "roles/RoleBuilder";
import { SpawningRequest } from "spawner/SpawningRequest";
import { Utils } from "utils/Utils";


export class MiningSite extends TickRunner {

  harvesters: Creep[] = [];
  trucks: Creep[] = [];
  builders: Creep[] = [];
  container?: StructureContainer | null;
  buildingContainer?: ConstructionSite | null;
  minHarvesters = 1;
  minTrucks = 1;
  minBuilders = 1;
  memory: MiningSiteMemory;


  constructor(public source: Source) {
    super()
    this.memory = Memory.miningSites[this.source.id];
  }


  loadData() {
    if (this.memory) {

      this.instanciateObjectsFromMemory<Creep>(this.harvesters, 'harvesters')
      this.instanciateObjectsFromMemory<Creep>(this.trucks, 'trucks')
      this.instanciateObjectsFromMemory<Creep>(this.builders, 'builders')
      // this.instanciateObjectsFromMemory<StructureContainer>(this.container, 'container')
      this.loadContainerState()
    }
  }

  preCheck(): number {
    if (this.avoid()) {
      return -1
    }
    if (this.harvestersNeeded() > 0) {
      pubSub.publish('SPAWN_REQUEST', {
        role: 'harvester',
        miningSite: this,
        priority: 2
      } as SpawningRequest)
    }

    if (this.trucksNeeded() > 0) {
      pubSub.publish('SPAWN_REQUEST', {
        role: 'truck',
        miningSite: this,
        priority: 2
      } as SpawningRequest)
      // return OK, no need for trucks driver for harvester to start working
      // this.preCheckResult = ERR_NOT_ENOUGH_RESOURCES
    }

    if (this.builderNeeded() > 0) {
      pubSub.publish('SPAWN_REQUEST', {
        role: 'builder',
        miningSite: this,
        priority: 1
      } as SpawningRequest)
    }

    if (this.containerNeeded()) {
      pubSub.publish('BUILD_CONTAINER_NEEDED', { miningSite: this })
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
    if (this.source.room.controller && this.source.room.controller.level > 1) {
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

  avoid() {
    const closeKeeper = this.source.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
    Memory.miningSites[this.source.id].avoid = closeKeeper.length > 0
    return closeKeeper.length > 0
  }

  act(): void {
    _.forEach(this.harvesters, creep => {
      if (creep.isIdle) {
        // when container are done, creep is static
        if (this.container) {
          RoleStaticHarvester.newTask(creep, this.source, this.container);
          // when container are not built yet, creep is building
        } else if (!this.container && this.buildingContainer) {
          RoleBuilder.newTask(creep, this.source);
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
          RoleBuilder.newTask(creep, this.source);
        } else if (this.container) {
          RoleStaticHarvester.newTask(creep, this.source, this.container);
        }
      }
      creep.run()
    })
  }

  // this.instanciateObjectsFromMemory<Creep>(this.harvesters, 'harvesters')
  // loop through memory object via memoryKey
  // remove from memory when object undefined
  // add objects to instanceObject
  instanciateObjectsFromMemory<T>(objects: T[], memoryKey: string): void {
    this.memory[memoryKey] = _.reduce(this.memory[memoryKey] as string[], (out: string[], id: string) => {
      const object = Game.getObjectById(id) as T
      if (object) {
        out.push(id);
        objects.push(object)
      }
      return out;
    }, []) as string[];
  }

  loadContainerState(): void {
    console.log("this.memory.container", this.memory.container)
    if (this.memory.container) {
      this.container = Game.getObjectById(this.memory.container);
      console.log("container", this.container)
      if (!this.container) {
        delete (this.memory.container)
      }
    }
    if (this.memory.buildingContainer) {
      this.buildingContainer = Game.getObjectById(this.memory.buildingContainer);
      if (!this.buildingContainer) {
        delete (this.memory.buildingContainer)
      }
    }
    if (this.memory.nextContainerPos) {
      const look = this.source.room.lookAt(this.memory.nextContainerPos.x, this.memory.nextContainerPos.y);
      _.forEach(look, (lookObject) => {
        if (lookObject.type == LOOK_CONSTRUCTION_SITES) {
          this.memory.buildingContainer = lookObject.constructionSite!.id
          delete (this.memory.nextContainerPos)
        }
      });
    }
  }
}
