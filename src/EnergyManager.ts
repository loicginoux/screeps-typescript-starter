import { TickRunner } from "TickRunner";
import { u } from "utils/Utils";

export class EnergyManager extends TickRunner {
  memory: EnergyManagerMemory;
  containers: StructureContainer[];
  links: StructureLink[];
  storage: StructureStorage | undefined;
  spawns: StructureSpawn[];
  extensions: StructureExtension[];
  towers: StructureTower[];
  energyAvailable: Structure[];
  energyNeeded: Structure[];

  constructor(private room: Room) {
    super()
  }

  loadData() {
    this.initMemory()
    this.loadStructures();
    super.loadData();
  }

  initMemory() {
    if (!Memory.rooms[this.room.name].energyManager) {
      let roomLinks = this.room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_LINK })
      Memory.rooms[this.room.name].energyManager = {
        links: _.map(roomLinks, link => {
          let type;
          if (this.room.controller && link.pos.inRangeTo(this.room.controller.pos.x, this.room.controller.pos.y, 4)) {
            type = "to"
          }
          if (this.room.storage && link.pos.inRangeTo(this.room.storage.pos.x, this.room.storage.pos.y, 4)) {
            type = "from"
          }
          return {
            id: link.id,
            type: type
          } as LinkMemory
        })
      }
    }
    this.memory = Memory.rooms[this.room.name].energyManager;
    this.memory.links = this.memory.links || [];
    this.memory.links = this.memory.links.filter(i => !!Game.getObjectById(i.id));

  }

  loadStructures() {
    this.containers = this.room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_CONTAINER }) as StructureContainer[];
    this.storage = this.room.storage;
    this.links = this.memory.links!.map(i => Game.getObjectById(i.id)) as StructureLink[];
    this.spawns = this.room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_SPAWN }) as StructureSpawn[];
    this.extensions = this.room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_EXTENSION }) as StructureExtension[];
    this.towers = this.room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_TOWER }) as StructureTower[];

    this.energyAvailable = []
    this.energyNeeded = []

    this.containers.forEach(element => {
      if (element.store.energy > 0) {
        this.energyAvailable.push(element)
      }
    })

    this.links.forEach(link => {
      if (link.energy < link.energyCapacity && this.linkType(link) == 'from') { this.energyNeeded.push(link) }
      if (link.energy > 0 && this.linkType(link) == 'to') { this.energyAvailable.push(link) }
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

    if (this.storage && this.storage.store.energy > 0) {
      this.energyAvailable.push(this.storage)
    }

    if (this.storage && !u.isStoreFull(this.storage)) {
      this.energyNeeded.push(this.storage)
    }

    global.pubSub.publish('ENERGY_AVAILABLE', {
      structures: this.energyAvailable,
      room: this.room,
      log: false
    })

    global.pubSub.publish('ENERGY_NEEDED', {
      structures: this.energyNeeded,
      room: this.room,
      log: false
    })

  };


  preCheck(): number {
    if (this.links.length < this.optimalLinksNumber()) {
      console.log("links available, place them manually", this.room.name)
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

    return OK;
  }

  optimalLinksNumber(): number {
    let LinksAtLevel = 0
    let links_per_level = [0, 0, 0, 0, 0, 2, 3, 4, 6]
    if (this.room.controller) {
      LinksAtLevel = links_per_level[this.room.controller.level]
    }
    return LinksAtLevel;
  }

  storageNeeded(): boolean {
    return !!(!this.storage && this.room.controller && this.room.controller.level >= 4);
  }

  act() {
    this.doLinkTransfer()
  }

  doLinkTransfer() {
    // console.log("doLinkTransfer")
    this.links.forEach(link => {
      // 3% lost on transfer
      if (link.energy > 3 && this.linkType(link) == 'from') {
        // console.log("found link for tranfer", link.pos)
        let target = this.findRecipientLink(link.energy)
        if (target) {
          // console.log("found receiver link for tranfer", link.pos)
          link.transferEnergy(target)
        }
      }
    });
  }

  linkType(link: StructureLink) {
    let res = null;
    if (this.memory.links) {
      res = _.result(_.find(this.memory.links, { 'id': link.id }), 'type');
    }
    return res
  }

  findRecipientLink(amountReceived: number): StructureLink | undefined {
    return _.find(this.links, link => {
      // console.log("linkType", link.pos, this.linkType(link))
      // console.log("link.energy", link.energy, amountReceived, link.energyCapacity)
      // console.log("test", (link.energy + amountReceived) < link.energyCapacity && this.linkType(link) == 'to')
      return (link.energy + amountReceived) <= link.energyCapacity && this.linkType(link) == 'to'
    })
  }
}
