import { TickRunner } from "TickRunner";
import { pubSub } from "utils/PubSub";
import { RoleStaticHarvester } from "roles/RoleStaticHarvester";
import { RoleHarvester } from "roles/RoleHarvester";
import { RoleTruck } from "roles/RoleTruck";
import { RoleBuilder } from "roles/RoleBuilder";
import { SpawningRequest } from "spawner/SpawningRequest";
import { Utils } from "utils/Utils";


export class MiningSite extends TickRunner {

  private harvesters: Creep[];
  private trucks: Creep[];
  private builders: Creep[];
  private containers: StructureContainer[];
  private minHarvesters = 1;
  private minTrucks = 1;
  private minContainer = 1;
  private minBuilders = 1;
  private memory: MiningSiteMemory;


  constructor(public source: Source) {
    super()
    this.memory = Memory.miningSites[this.source.id];
  }


  loadData() {
    this.harvesters = []
    let updatedHarvesterMemory: string[] = []
    this.trucks = []
    let updatedTrucksMemory: string[] = []
    this.builders = []
    let updatedBuildersMemory: string[] = []
    this.containers = []

    if (this.memory) {
      _.forEach(this.memory.harvesters, i => {
        const creep = Game.getObjectById(i) as Creep
        if (creep) {
          this.harvesters.push(creep)
          updatedHarvesterMemory.push(creep.id)
        }
      });
      // dead creep are removed from memory
      Memory.miningSites[this.source.id].harvesters = updatedHarvesterMemory

      _.forEach(this.memory.trucks, i => {
        const creep = Game.getObjectById(i) as Creep
        if (creep) {
          this.trucks.push(creep)
          updatedTrucksMemory.push(creep.id)
        }
      });
      // dead creep are removed from memory
      Memory.miningSites[this.source.id].trucks = updatedTrucksMemory

      _.forEach(this.memory.builders, i => {
        const creep = Game.getObjectById(i) as Creep
        if (creep) {
          this.builders.push(creep)
          updatedBuildersMemory.push(creep.id)
        }
      });
      // dead creep are removed from memory
      Memory.miningSites[this.source.id].builders = updatedBuildersMemory

      this.containers = _.map(this.memory.containers, i => Game.getObjectById(i)) as StructureContainer[];
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
      this.preCheckResult = ERR_NOT_ENOUGH_RESOURCES
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

    if (this.containerNeeded() > 0) {
      pubSub.publish('BUILD_CONTAINER_NEEDED', { miningSite: this })
      // containers are not mandarory, return OK
    }

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

  containerNeeded(): number {
    return this.minContainer - this.containers.length - this.memory.buildingContainers.length;
  }

  avoid() {
    const closeKeeper = this.source.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
    Memory.miningSites[this.source.id].avoid = closeKeeper.length > 0
    return closeKeeper.length > 0
  }

  act(): void {
    _.forEach(this.harvesters, creep => {
      if (creep.isIdle) {
        if (this.containers.length > 0) {
          RoleStaticHarvester.newTask(creep, this.source, this.containers);
        } else {
          RoleHarvester.newTask(creep, this.source);
        }
      }
      creep.run()
    })

    _.forEach(this.trucks, creep => {
      if (creep.isIdle) {
        if (this.containers.length > 0) {
          RoleTruck.newTask(creep, this.containers);
        } else {
          RoleHarvester.newTask(creep, this.source);
        }

      }
      creep.run()
    })

    _.forEach(this.builders, creep => {
      if (creep.isIdle) {
        if (this.memory.buildingContainers.length > 0) {
          RoleBuilder.newTask(creep, this.source);
        }
      }
      creep.run()
    })

  }
}
