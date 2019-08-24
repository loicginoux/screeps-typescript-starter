import { u } from "utils/utils"
export class RoomDiscovery {
  memory: RoomExplorationMemory
  constructor(public room: Room, public creep?: Creep) {
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
    // console.log("roomMemory", JSON.stringify(roomMemory))
  }

  analyzeNewRoom(): RoomExplorationMemory {
    let roomMemory = {
      name: this.room.name,
      nearestCity: {
        room: this.creep!.memory.room,
        range: this.getRangeToCity()
      },
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
        level: this.room.controller.level,
        pos: this.room.controller.pos
      }
      if (this.room.controller.owner) {
        roomMemory.ctrl.owner = this.room.controller.owner.username
      }
      if (this.room.controller.reservation) {
        roomMemory.ctrl.reserved = this.room.controller.reservation.username
      }
    }

    const range = this.getRangeToCity()
    if (!roomMemory.nearestCity || (roomMemory.nearestCity && !roomMemory.nearestCity.range) || (roomMemory.nearestCity && range && roomMemory.nearestCity.range && roomMemory.nearestCity.range > range)) {
      roomMemory.nearestCity = {
        room: this.room.name,
        range: range
      }
    }

    Memory.roomExploration[this.room.name] = roomMemory

    roomMemory.mine = this.isMine()
    this.updatePotentialHarvestingSite(this.room.name)
    this.updatePotentialDeployingSite(this.room.name)

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
    console.log("isSourceKeeperRoom", this.room.name, "world pos", JSON.stringify(pos), "is SK", isSK)
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

  getRangeToCity(): number | undefined {
    if (this.creep) {
      const route = Game.map.findRoute(this.creep.memory.room, this.room.name)
      if (typeof (route) != "number") {
        return route.length
      }
    }
  }

  updatePotentialHarvestingSite(roomName: string): boolean {
    let res = true

    let roomMemo = Memory.roomExploration[roomName]
    const isNotPracticable = roomMemo.highway || roomMemo.sourceKeeper
    const myBase = roomMemo.mine
    const ownedByOther = roomMemo.ctrl && roomMemo.ctrl.owner && roomMemo.ctrl.owner != u.me()
    const reservedByOther = roomMemo.ctrl && roomMemo.ctrl.reserved && roomMemo.ctrl.reserved != u.me()
    const closeToCity = (roomMemo.nearestCity && roomMemo.nearestCity.range && roomMemo.nearestCity.range < 2)
    if (isNotPracticable || myBase || ownedByOther || reservedByOther || !closeToCity) { res = false }
    Memory.roomExploration[roomName].potentialHarvestingSite = res
    return res
  }

  // // mainRoom.remoteHarvestingCoordinator.roomDiscovery.doMigration()
  // // update memory state to new model
  // // can be deleted after first run
  // doMigration() {
  //   _.forEach(Memory.roomExploration, function (roomMemo) {
  //     roomMemo.nearestCity = { room: "W9N16", range: roomMemo.rangeToMainRoom }
  //     Memory.roomExploration[roomMemo.name] = roomMemo
  //   })
  // }

  updatePotentialDeployingSite(roomName: string): boolean {
    Memory.roomExploration[roomName].potentialDeployingSite = false
    return false
  }

  isVisible(): boolean {
    return (Game.rooms[this.room.name] !== undefined);
  }

  isMine(): boolean {
    return _.get(Game.rooms, this.room.name + '.controller.my', false);
  }

}
