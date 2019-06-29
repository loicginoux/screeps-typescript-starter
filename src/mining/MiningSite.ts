import { TickRunner } from "TickRunner";
import { pubSub } from "utils/PubSub";
import { RoleStaticHarvester } from "roles/RoleStaticHarvester";
import { RoleTruck } from "roles/RoleTruck";
import { SpawningRequest } from "spawner/SpawningRequest";
import { Utils } from "utils/Utils";


export class MiningSite extends TickRunner {

  private harvesters: Creep[];
  private trucks: Creep[];
  private containers: StructureContainer[];
  private minHarvesters = 1;
  private minTrucks = 1;
  private minContainer = 1;


  constructor(public source: Source) {
    super()
    let miningSiteMemory = Memory.miningSites[this.source.id];
    if (miningSiteMemory) {
      this.harvesters = _.map(miningSiteMemory.harvesters, i => Game.getObjectById(i)) as Creep[];
      this.trucks = _.map(miningSiteMemory.trucks, i => Game.getObjectById(i)) as Creep[];
      this.containers = _.map(miningSiteMemory.containers, i => Game.getObjectById(i)) as StructureContainer[];
    } else {
      this.harvesters = []
      this.trucks = []
      this.containers = []
    }

  }

  preCheck(): number {
    if (this.harvestersNeeded() > 0) {
      pubSub.publish('SPAWN_REQUEST', {
        role: 'harvester',
        miningSite: this,
        priority: 1
      } as SpawningRequest)
      this.preCheckResult = ERR_NOT_ENOUGH_RESOURCES
    }

    if (this.trucksNeeded() > 0) {
      pubSub.publish('SPAWN_REQUEST', {
        role: 'truck',
        miningSite: this,
        priority: 1
      } as SpawningRequest)
      // this.preCheckResult = ERR_NOT_ENOUGH_RESOURCES
    }

    if (this.containerNeeded() > 0) {
      pubSub.publish('BUILD_CONTAINER_NEEDED', { miningSite: this })
      // containers are not mandarory, return OK

    }
    return this.preCheckResult;
  }

  harvestersNeeded(): number {
    return this.minHarvesters - this.harvesters.length;
  }

  trucksNeeded(): number {
    return this.minTrucks - this.trucks.length;
  }

  containerNeeded(): number {
    return this.minContainer - this.containers.length;
  }

  act(): void {
    _.forEach(this.harvesters, creep => {
      if (creep.isIdle) {
        RoleStaticHarvester.newTask(creep, this.source, this.containers);
      }
      creep.run()
    })
    _.forEach(this.trucks, creep => {
      if (creep.isIdle) {
        RoleTruck.newTask(creep, this.containers[0]);
      }
      creep.run()
    })

  }
}
