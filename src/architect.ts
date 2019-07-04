import { Utils } from "utils/Utils";

export class Architect {
  constructor(private room: Room) {
    global.pubSub.subscribe('BUILD_CONTAINER_NEEDED', this.buildContainer.bind(this))
    global.pubSub.subscribe('BUILD_ROAD_NEEDED', this.buildRoad.bind(this))
    global.pubSub.subscribe('TOWER_REQUEST', this.buildTower.bind(this))
  }

  buildContainer(...args: any[]): number {
    console.log("buildContainer")
    const miningSite = args[0].miningSite
    let position = args[0].position
    if (!position) {
      position = this.findContainerPositionForSource(miningSite.source)
    }
    let res = -1
    if (position) {
      res = Game.rooms[this.room.name].createConstructionSite(position.x, position.y, STRUCTURE_CONTAINER);
      Utils.log(`createConstructionSite container ${res}`)
      if (res == OK) {
        miningSite.memory.nextContainerPos = position
      }
    }
    return res
  }

  findContainerPositionForSource(source: Source): Position | null {
    let closeRoad = source.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: i => i.structureType === STRUCTURE_ROAD
    })[0];
    if (closeRoad) {
      return closeRoad.pos;
    }
    else {
      const terrains = this.lookForAround(LOOK_TERRAIN, source.pos)
      const firstPlain = _.find(terrains, (t) => t.terrain == 'plain')
      if (firstPlain) {
        return firstPlain
      }
    }
    return null
  }

  lookForAround(type: LookConstant, pos: RoomPosition) {
    return this.room.lookForAtArea(type, pos.y - 1, pos.x - 1, pos.y + 1, pos.x + 1, true)
  }

  buildRoad(...args: any[]): number {
    const from = args[0].from as RoomPosition
    const to = args[0].to as RoomPosition

    if (from.roomName != to.roomName && from.roomName == this.room.name) { return -1 }
    const pathSteps = this.room.findPath(from, to, {
      ignoreCreeps: true,
      maxRooms: 1
    })
    _.forEach(pathSteps, (step) => {
      this.room.createConstructionSite(step.x, step.y, STRUCTURE_ROAD)
    })
    return OK
  }

  buildTower(...args: any[]): number {
    const room = Game.rooms[args[0].roomName]
    let position = args[0].position
    if (!position) {
      position = this.findPositionForTower(room)
    }
    let res = -1
    if (position) {
      res = room.createConstructionSite(position.x, position.y, STRUCTURE_TOWER);
      Utils.log(`createConstructionSite tower ${res}`)
      if (res == OK) {
        Memory.rooms[room.name].towersManager.nextTowerPos = position
      }
    }
    return res
  }

  findPositionForTower(room: Room): Position {
    return { x: 1, y: 1 } as Position
  }
}
