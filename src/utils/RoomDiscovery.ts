export class RoomDiscovery {
  constructor(public room: Room) { }

  checkRoom() {
    // analyze current room
    // if room in memory
    // // update room discovery
    // else save unknown room
    // loop through exits rooms
    // // check if room name exists in memory
    // // save room discovery as unknown if not in memory
    // if good for harvesting send message to base
    // if good for deploying send message to base
  }

  analyzeRoom(): RoomExplorationMemory {
    let roomMemory = {
      name: this.room.name,
      rangeToMainRoom: this.getRangeToMainRoom(),
      checked: true,
      exitRooms: this.findExitRooms(),
      sourceKeeper: this.isSourceKeeperRoom(),
      highway: this.isHighwayRoom(),
      nbSource: this.room.find(FIND_SOURCES).length,
      potentialHarvestingSite: this.isPotentialHarvestingSite(),
      potentialDeployingSite: this.isPotentialDeployingSite(),
    } as RoomExplorationMemory;

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

    const minerals = this.room.find(FIND_MINERALS);
    if (minerals.length > 0) {
      roomMemory.mineral = {
        type: minerals[0].mineralType,
        density: minerals[0].density,
        mineralAmount: minerals[0].mineralAmount
      }
    }
    return roomMemory;
  }

  findExitRooms(): string[] {
    let rooms: string[] = [];
    let pos = this.getWorldPosition()

    const exitNames = [FIND_EXIT_RIGHT, FIND_EXIT_BOTTOM, FIND_EXIT_LEFT, FIND_EXIT_TOP];
    const exitTilesByDirection = exitNames.map(name => this.room.find(name));
    _.forEach(exitTilesByDirection, exitTiles => {
      creep.pos.findClosestByPath(FIND_MY_SPAWNS)
    })
    let adjacentReachableRooms = [
    ]

    return rooms
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
    return 0
  }

  isPotentialHarvestingSite(): boolean {
    return false
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
