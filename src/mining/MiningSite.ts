import { TickRunner } from "TickRunner";
import { pubSub } from "utils/PubSub";
import { RoleStaticHarvester } from "roles/RoleStaticHarvester";
import { RoleTruck } from "roles/RoleTruck";
export class MiningSite extends TickRunner {

  private harvesters: Creep[];
  private trucks: Creep[];
  private containers: StructureContainer[];
  private minHarvesters = 1;
  private minTrucks = 1;
  private minContainer = 1;


  constructor(private source: Source) {
    super()
    let miningSiteMemory = Memory.miningSites[this.source.id];
    this.harvesters = miningSiteMemory.harvesters.map(i => Game.creeps[i]);
    this.trucks = miningSiteMemory.trucks.map(i => Game.creeps[i]);
    this.containers = miningSiteMemory.containers.map(i => Game.getObjectById(i)) as StructureContainer[];
  }

  preCheck(): number {
    if (this.harvestersNeeded() > 0) {
      pubSub.publish('SPAWN_NEEDED', { type: 'harvester', miningSite: this })
      this.preCheckRes = ERR_NOT_ENOUGH_RESOURCES
    }

    if (this.trucksNeeded() > 0) {
      pubSub.publish('SPAWN_NEEDED', { type: 'truck', miningSite: this })
      this.preCheckRes = ERR_NOT_ENOUGH_RESOURCES
    }

    if (this.containerNeeded() > 0) {
      pubSub.publish('BUILD_CONTAINER_NEEDED', { miningSite: this })
      this.preCheckRes = ERR_NOT_ENOUGH_RESOURCES
    }
    return this.preCheckRes;
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
    this.harvesters.forEach(creep => {
      if (creep.isIdle) {
        RoleStaticHarvester.newTask(creep, this.source, this.containers);
      }
      creep.run()
    })
    this.trucks.forEach(creep => {
      if (creep.isIdle) {
        RoleTruck.newTask(creep, this.containers[0]);
      }
      creep.run()
    })

  }
}
