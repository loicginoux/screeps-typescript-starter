import { TickRunner } from "TickRunner";
import { u } from "utils/Utils";

export class EnergyManager extends TickRunner {
  memory: EnergyManagerMemory;
  containers: StructureContainer[] = [];
  links: StructureLink[] = [];
  storages: StructureStorage[] = [];
  spawns: StructureSpawn[] = [];
  extensions: StructureExtension[] = [];
  towers: StructureTower[] = [];
  energyAvailable: Structure[] = [];
  energyNeeded: Structure[] = [];
  // droppedEnergies: Resource[];

  constructor() {
    super()
    // global.pubSub.subscribe('ASSIGNED_ENERGY_TARGET', this.assignCreepToEnergyTarget.bind(this))
    // global.pubSub.subscribe('UNASSIGNED_ENERGY_TARGET', this.unassignCreepToEnergyTarget.bind(this))
  }

  loadData() {
    this.initMemory()
    _.forEach(Game.rooms, (room) => {
      this.loadStructures(room);
    })

    this.calculateEnergyNeededAndAvailable();

    super.loadData();
  }

  initMemory() {
    if (!Memory.energyManager) { Memory.energyManager = { assignation: {} } }
    if (!Memory.energyManager.assignation) { Memory.energyManager.assignation = {} }

    this.memory = Memory.energyManager;

    let memoryLinks: LinkMemory[] = []
    _.forEach(Game.rooms, (room, roomName) => {
      let roomLinks = room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_LINK })
      // console.log("roomLinks", JSON.stringify(roomLinks))
      let roomMemory = _.map(roomLinks, link => {
        let type;
        if (room.controller && link.pos.inRangeTo(room.controller.pos.x, room.controller.pos.y, 4)) {
          type = "to"
        }
        if (room.storage && link.pos.inRangeTo(room.storage.pos.x, room.storage.pos.y, 4)) {
          type = "from"
        }
        return {
          id: link.id,
          type: type
        } as LinkMemory
      })
      memoryLinks = memoryLinks.concat(roomMemory)
      // this.memory.links = this.memory.links.filter(i => !!Game.getObjectById(i.id));
    })
    this.memory.links = memoryLinks
  }

  loadStructures(room: Room) {
    this.containers = this.containers.concat(room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_CONTAINER }) as StructureContainer[]);
    if (room.storage) {
      this.storages = this.storages.concat([room.storage]);
    }
    this.links = this.links.concat(this.memory.links!.map(i => Game.getObjectById(i.id)) as StructureLink[]);
    this.spawns = this.spawns.concat(room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_SPAWN }) as StructureSpawn[]);
    this.extensions = this.extensions.concat(room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_EXTENSION }) as StructureExtension[]);
    this.towers = this.towers.concat(room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_TOWER }) as StructureTower[]);
    // this.droppedEnergies = this.room.find(FIND_DROPPED_RESOURCES, { filter: (i) => i.resourceType == 'energy' }) as Resource[];

  };

  calculateEnergyNeededAndAvailable() {
    this.energyAvailable = []
    this.energyNeeded = []

    this.containers.forEach(element => {
      if (element.store.energy > 0) {
        this.energyAvailable.push(element)
      }
    })

    this.links.forEach(link => {
      if (link.energy < link.energyCapacity && u.linkType(link) == 'from') { this.energyNeeded.push(link) }
      if (link.energy > 0 && u.linkType(link) == 'to') { this.energyAvailable.push(link) }
    })

    this.towers.forEach(element => {
      if (element.energy < element.energyCapacity) { this.energyNeeded.push(element) }
    })

    this.spawns.forEach(element => {
      if (element.energy < element.energyCapacity) { this.energyNeeded.push(element) }
    })

    this.extensions.forEach(element => {
      if (element.energy < element.energyCapacity) { this.energyNeeded.push(element) }
    })

    this.storages.forEach(storage => {
      if (storage && storage.store.energy > 0) {
        this.energyAvailable.push(storage)
      }

      if (storage && !u.isStoreFull(storage)) {
        this.energyNeeded.push(storage)
      }
    })


    global.pubSub.publish('ENERGY_AVAILABLE', {
      structures: this.energyAvailable,
      log: false
    })

    global.pubSub.publish('ENERGY_NEEDED', {
      structures: this.energyNeeded,
      log: false
    })

  }

  assignCreepToEnergyTarget(...args: any[]) {
    const creep = args[0].creep;
    const target = args[0].target;
    if (!this.memory.assignation[target.id]) { this.memory.assignation[target.id] = [] }
    if (this.memory.assignation[target.id].indexOf(creep.id) == -1) {
      this.memory.assignation[target.id].push(creep.id)
    }
  }

  // unassignCreepToEnergyTarget(...args: any[]) {
  //   const creep = args[0].creep;
  //   const target = args[0].target;
  //   if (!this.memory.assignation[target.id]) { this.memory.assignation[target.id] = [] }
  //   // remove current Creep
  //   this.memory.assignation[target.id] = _.filter(this.memory.assignation[target.id], (id) => {
  //     return id != creep.id
  //   });
  //   // clean other creeps
  //   this.memory.assignation[target.id] = _.filter(this.memory.assignation[target.id], (id) => {
  //     const creep: Creep | null = Game.getObjectById(id)
  //     if (creep) {
  //       if (creep.memory.task) {
  //         return creep.memory.task.name == "goTo" && creep.memory.task._target._pos == target.pos
  //       } else {
  //         return false
  //       }
  //     } else {
  //       return false
  //     }
  //   });

  //   console.log("unassignCreepToEnergyTarget", target.id, creep.id, this.memory.assignation[target.id])
  // }

  // static getCreepsAssignedToEnergyTarget(s: Structure): Creep[] {
  //   let creeps: Creep[] = [];
  //   if (Memory.energyManager && Memory.energyManager.assignation && Memory.energyManager.assignation[s.id]) {
  //     Game.rooms[s.pos.roomName].visual.text(JSON.stringify(Memory.energyManager.assignation[s.id]), s.pos.x + 1, s.pos.y)
  //     creeps = _.map(Memory.energyManager.assignation[s.id], (id) => Game.getObjectById(id) as Creep)
  //   }
  //   return creeps;
  // }

  // cleanAssignation(id?: string) {
  //   if (id) {
  //     Memory.energyManager.assignation[id] = []
  //   } else {
  //     Memory.energyManager.assignation = {}

  //   }
  // }

  // showAssignations() {
  //   _.forEach(Game.rooms, (room) => {
  //     _.forEach(room.find(FIND_STRUCTURES).filter(i => i.structureType == STRUCTURE_CONTAINER), (cont) => {
  //       if (Memory.energyManager && Memory.energyManager.assignation && Memory.energyManager.assignation[cont.id]) {
  //         room.visual.text(JSON.stringify(Memory.energyManager.assignation[cont.id]), cont.pos.x + 1, cont.pos.y)
  //       }
  //     })
  //   })
  // }
  // preCheck(): number {

  //   return OK;
  // }



  // act() {

  // }



}
