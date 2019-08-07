export class RoomDiscovery {
  memory: RoomExplorationMemory
  constructor(public room: Room, public creep: Creep) {
    if (!Memory.roomExploration) {
      Memory.roomExploration = {}
    }
    this.memory = Memory.roomExploration[this.room.name]
  }

  checkRoom() {
    let roomMemory;
    if (this.memory && this.memory.lastChecked < Game.time - 1000) {
      roomMemory = this.updateRoomInfo()
    } else {
      roomMemory = this.analyzeNewRoom()
    }
    console.log("roomMemory", JSON.stringify(roomMemory))
  }

  analyzeNewRoom(): RoomExplorationMemory {
    let roomMemory = {
      name: this.room.name,
      rangeToMainRoom: this.getRangeToMainRoom(),
      sourceKeeper: this.isSourceKeeperRoom(),
      highway: this.isHighwayRoom(),
      sources: [],
      potentialHarvestingSite: false,
      potentialDeployingSite: false,
      lastChecked: Game.time,
      mine: false
    } as RoomExplorationMemory;

    const sources: Source[] = this.room.find(FIND_SOURCES);
    roomMemory.sources = _.map(sources, source => {
      return {
        pos: source.pos,
        id: source.id
      }
    })
    const minerals = this.room.find(FIND_MINERALS);
    if (minerals.length > 0) {
      roomMemory.mineral = {
        type: minerals[0].mineralType,
        density: minerals[0].density,
        mineralAmount: minerals[0].mineralAmount,
        pos: minerals[0].pos,
        id: minerals[0].id
      }
    }

    Memory.roomExploration[this.room.name] = roomMemory

    roomMemory = this.updateRoomInfo()

    return roomMemory;
  }

  updateRoomInfo() {
    let roomMemory = Memory.roomExploration[this.room.name]
    if (this.room.controller) {
      roomMemory.ctrl = {
        level: this.room.controller.level
      }
      if (this.room.controller.owner) {
        roomMemory.ctrl.owner = this.room.controller.owner.username
      }
      if (this.room.controller.reservation) {
        roomMemory.ctrl.reserved = this.room.controller.reservation.username
      }
    }

    Memory.roomExploration[this.room.name] = roomMemory

    roomMemory.mine = this.isMine()
    roomMemory.potentialHarvestingSite = this.isPotentialHarvestingSite()
    roomMemory.potentialDeployingSite = this.isPotentialDeployingSite()

    Memory.roomExploration[this.room.name] = roomMemory

    return roomMemory
  }

  getWorldPosition(): Position | undefined {
    let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(this.room.name);
    if (parsed) {
      return { x: parseInt(parsed[1]), y: parseInt(parsed[2]) }
    }
  }

  isSourceKeeperRoom(): boolean {
    let pos = this.getWorldPosition()
    let isSK = false
    if (pos) {
      let fMod = pos.x % 10;
      let sMod = pos.y % 10;
      let isSK =
        !(fMod === 5 && sMod === 5) &&
        (fMod >= 4 && fMod <= 6) &&
        (sMod >= 4 && sMod <= 6);
    }
    return isSK
  }

  isHighwayRoom(): boolean {
    let pos = this.getWorldPosition();
    let isHw = false
    if (pos) {
      isHw = (pos.x % 10 === 0) || (pos.y % 10 === 0);
    }
    return isHw
  }

  getRangeToMainRoom(): number {
    return Game.map.getRoomLinearDistance(this.creep.memory.room, this.room.name)
  }

  isPotentialHarvestingSite(): boolean {
    let res = true
    if (this.memory.highway || this.memory.sourceKeeper) { res = false }
    if (!this.memory.mine && this.memory.ctrl && (this.memory.ctrl.owner || this.memory.ctrl.reserved)) { res = false }
    if (this.memory.rangeToMainRoom >= 2) { res = false }
    return res
  }

  isPotentialDeployingSite(): boolean {
    return false
  }

  isVisible(): boolean {
    return (Game.rooms[this.room.name] !== undefined);
  }

  isMine(): boolean {
    return _.get(Game.rooms, this.room.name + '.controller.my', false);
  }

}
