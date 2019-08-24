import { StoreStructure } from "creep-tasks/utilities/helpers";
import { Tasks } from "creep-tasks/Tasks";

class Utils {
  static log(...args: any[]): void {
    if (Memory.debug > 0) {
      _.map(args, (arg, i) => {
        console.log('arg:', i, JSON.stringify(arg))
      })

    }
  }

  static me(): string | undefined {
    let creep: Creep | undefined = _.find(Game.creeps)
    if (creep) {
      return creep.owner.username
    }
  }

  static displayVisualRoles() {
    const roles: any = {
      "truck": '🚚',
      "miningSiteTruck": '🚛',
      "remoteMiningSiteTruck": '🚎',
      "harvester": '🔨',
      "remoteHarvester": '💣',
      "builder": '🚜',
      "explorer": '👁️',
      "upgrader": '🚀',
      "reserver": '💋',
      "soldier": '🔪',
      "ranged_attack": '🔫',
      "dismantler": '🔧'
    }
    const roleKeys = _.keys(roles)
    _.forEach(Game.creeps, creep => {
      const role = creep.name.split('_')[0]
      const icon = roles[role] || ''
      if (icon) {
        Game.rooms[creep.pos.roomName].visual.text(icon, creep.pos.x, creep.pos.y + 0.1, { font: 0.4 })
      }

    });
  }

  static capitalizeFirstLetter(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  static every(freq: number): boolean {
    return Game.time % freq === 0
  }

  // ascending order
  static compareValues(v1: number, v2: number): number {
    return (v1 > v2)
      ? 1
      : (v1 < v2 ? -1 : 0);
  };

  static reset() {
    // reset structures
    // mainRoom.room.find(FIND_STRUCTURES).map(i => i.destroy());mainRoom.room.find(FIND_CONSTRUCTION_SITES).map(i => i.remove());
    // mainRoom.room.find(FIND_CONSTRUCTION_SITES).map(i => i.remove());mainRoom.memory.fortressRoadsLevel = 0
    _.forEach(Game.rooms, room => {
      return room.find(FIND_STRUCTURES).map(i => i.destroy())
    })
    // reset memory
    RawMemory.set('{}');
    Memory.creeps = {};
    Memory.rooms = {};
    Memory.flags = {};
    Memory.spawns = {};
  }

  static isStoreFull(structure: StoreStructure) {
    const currentlyStored = _.sum(_.values(structure.store))
    return currentlyStored == structure.storeCapacity
  }

  // when creep is moving it checks for energy, if he does not found, he run the callback function
  // used when creep is empty and move to get energy
  // only get energy when the amount is worth it (>80% of creep carry capacity)
  static whileCheckForDroppedEnergy(creep: Creep, callback: () => any) {
    var energyDroppedPoints = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 5);
    energyDroppedPoints = _.sortBy(energyDroppedPoints, a => -1 * a.amount)
    let found = false
    if (energyDroppedPoints.length && creep.carry.energy == 0 && energyDroppedPoints[0].amount >= creep.carryCapacity * 0.8) {
      console.log(creep.name, 'found', energyDroppedPoints[0].amount, 'energy at', energyDroppedPoints[0].pos);
      if (creep.pickup(energyDroppedPoints[0]) == ERR_NOT_IN_RANGE) {
        creep.task = Tasks.goTo(energyDroppedPoints[0])
      };
      found = true
    }
    if (!found) {
      callback();
    }
  }

  static tryBuilding(creep: Creep): ConstructionSite {
    let target = u.findConstructionSite(creep)
    if (target) {
      if (creep.pos.getRangeTo(target) > 1) {
        creep.task = Tasks.goTo(target)
      } else {
        creep.task = Tasks.build(target)
      }
    }
    return target
  }

  static findConstructionSite(creep: Creep): ConstructionSite {
    let targets = creep.room.find(FIND_CONSTRUCTION_SITES) as ConstructionSite[]
    const priorities = [
      STRUCTURE_SPAWN,
      STRUCTURE_TOWER,
      STRUCTURE_EXTENSION,
      STRUCTURE_ROAD,
      STRUCTURE_CONTAINER,
      STRUCTURE_RAMPART,
      STRUCTURE_WALL,
      STRUCTURE_STORAGE,
      STRUCTURE_LINK,
      STRUCTURE_OBSERVER,
      STRUCTURE_POWER_BANK,
      STRUCTURE_POWER_SPAWN,
      STRUCTURE_EXTRACTOR,
      STRUCTURE_LAB,
      STRUCTURE_TERMINAL,
      STRUCTURE_NUKER,
      STRUCTURE_PORTAL,
    ]
    if (targets) {
      targets = targets.sort((a: any, b: any) => {
        let res = u.compareValues(priorities.indexOf(a.structureType), priorities.indexOf(b.structureType))
        return res === 0
          ? u.compareValues(creep.pos.getRangeTo(a), creep.pos.getRangeTo(b))
          : res;
      })
    }
    return targets[0]
  }

  static linkType(link: StructureLink) {
    let res = null;
    if (Memory.energyManager.links) {
      res = _.result(_.find(Memory.energyManager.links, { 'id': link.id }), 'type');
    }
    return res
  }

}

export const u = Utils;
