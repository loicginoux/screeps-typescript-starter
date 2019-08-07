import { Tasks } from 'creep-tasks/Tasks'
import { EnergyStructure } from 'creep-tasks/utilities/helpers';
import { Spawner } from 'spawner/Spawner';
import { u } from "utils/Utils";


export class RoleTruck {
  public static newTask(creep: Creep, availableEnergyStructures: EnergyStructure[], neededEnergyStructures: EnergyStructure[]): void {
    // creep has no evergy, go to container 1 get some
    if (creep.carry.energy == 0) {
      u.whileCheckForDroppedEnergy(creep, () => {
        this.getEnergy(creep, availableEnergyStructures, neededEnergyStructures);
      })
    } else {
      let structure = this.transferEnergy(creep, neededEnergyStructures)
      if (!structure) {
        u.tryBuilding(creep);
      }
    }
  }

  public static getEnergy(creep: Creep, availableEnergyStructures: EnergyStructure[], neededEnergyStructures: EnergyStructure[]): void {
    let neededEnergyStructure = this.firstNeededEnergyStructure(creep, neededEnergyStructures)
    let priorities = [
      STRUCTURE_STORAGE,
      STRUCTURE_CONTAINER
    ]
    // when the only structure that needs energy is the storage
    // it will do storage -> storage, with a change of priority it does containers -> storage
    if (neededEnergyStructure && neededEnergyStructure.structureType == STRUCTURE_STORAGE) {
      priorities = [
        STRUCTURE_CONTAINER,
        STRUCTURE_STORAGE
      ]
    }
    if (creep.name == "truck_1207674") { console.log("priorities", priorities) }
    // filter first structures includes in priorities
    availableEnergyStructures = _.filter(availableEnergyStructures, i => _.includes(priorities, i.structureType))
    // we then sort by:
    // priority
    // then for same structure, we use first the ones full enough
    // then by range
    availableEnergyStructures = availableEnergyStructures.sort((a: any, b: any) => {
      let res = u.compareValues(priorities.indexOf(a.structureType), priorities.indexOf(b.structureType))
      if (res === 0) {
        let aFullEnough = 1
        if (a.store.energy >= creep.carryCapacity) {
          aFullEnough = 0
        }
        let bFullEnough = 1
        if (b.store.energy >= creep.carryCapacity) {
          bFullEnough = 0
        }
        res = u.compareValues(aFullEnough, bFullEnough)
        if (res === 0) {
          res = u.compareValues(creep.pos.getRangeTo(a), creep.pos.getRangeTo(b))
        }
      }
      return res;
    })
    if (availableEnergyStructures.length > 0) {
      if (creep.name == "truck_1207674") {
        console.log("availableEnergyStructures", availableEnergyStructures)
        console.log(creep.name, creep.carry.energy, "getEnergy", availableEnergyStructures[0].structureType, availableEnergyStructures[0].pos)
      }
      if (creep.pos.getRangeTo(availableEnergyStructures[0]) > 1) {
        // creep.task = Tasks.goTo(availableEnergyStructures[0])
        creep.travelTo(availableEnergyStructures[0])
      } else {
        creep.task = Tasks.withdraw(availableEnergyStructures[0])
      }
    } else {
      // else get from source directly
      let sources = creep.room.find(FIND_SOURCES_ACTIVE) as Source[]
      sources = _.sortBy(sources, s => creep.pos.getRangeTo(s))
      if (sources.length > 0) {
        if (creep.pos.getRangeTo(sources[0]) > 1) {
          // creep.task = Tasks.goTo(sources[0])
          creep.travelTo(sources[0])
        } else {
          creep.task = Tasks.harvest(sources[0])
        }
      }
    }
  }

  public static transferEnergy(creep: Creep, neededEnergyStructures: EnergyStructure[]) {
    let neededEnergyStructure = this.firstNeededEnergyStructure(creep, neededEnergyStructures)
    // console.log("neededEnergyStructure", neededEnergyStructure)
    // get from containers first
    if (neededEnergyStructure) {
      if (creep.name == "truck_1207674") {
        console.log(creep.name, creep.carry.energy, "transferEnergy", neededEnergyStructures[0].structureType, neededEnergyStructures[0].pos)
      }
      if (creep.pos.getRangeTo(neededEnergyStructure) > 1) {
        // creep.task = Tasks.goTo(neededEnergyStructure)
        creep.travelTo(neededEnergyStructure)
      } else {
        creep.task = Tasks.transfer(neededEnergyStructure)
      }
    }
    return neededEnergyStructure
  }

  public static firstNeededEnergyStructure(creep: Creep, neededEnergyStructures: EnergyStructure[]) {
    const priorities = [
      STRUCTURE_TOWER,
      STRUCTURE_SPAWN,
      STRUCTURE_EXTENSION,
      STRUCTURE_LINK,
      STRUCTURE_STORAGE,
    ]

    // sort by priority and then range
    neededEnergyStructures = _.filter(neededEnergyStructures, i => _.includes(priorities, i.structureType))
    neededEnergyStructures = neededEnergyStructures.sort((a: any, b: any) => {
      let res = u.compareValues(priorities.indexOf(a.structureType), priorities.indexOf(b.structureType))
      return res === 0
        ? u.compareValues(creep.pos.getRangeTo(a), creep.pos.getRangeTo(b))
        : res;
    })
    // console.log("truck neededEnergyStructures[0]", creep.pos, neededEnergyStructures[0].structureType, neededEnergyStructures[0].pos)
    return neededEnergyStructures[0]
  }


}
