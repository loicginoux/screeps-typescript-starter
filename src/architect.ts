import { u } from "utils/Utils";

export class Architect {
  constructor(private room: Room) {
    global.pubSub.subscribe('BUILD_CONTAINER_NEEDED', this.buildContainer.bind(this))
    global.pubSub.subscribe('BUILD_ROAD_NEEDED', this.buildRoad.bind(this))
    global.pubSub.subscribe('TOWER_REQUEST', this.buildTower.bind(this))
    global.pubSub.subscribe('BUILD_EXTENSION', this.buildExtensions.bind(this))
    global.pubSub.subscribe('BUILD_STORAGE', this.buildStorage.bind(this))
  }

  buildContainer(...args: any[]): number {
    console.log("buildContainer")
    const miningSite = args[0].miningSite
    let position = args[0].position
    let memoryKey = args[0].memoryKey
    if (!position) {
      position = this.findContainerPositionForSource(miningSite.source)
    }
    let res = -1
    if (position) {
      res = Game.rooms[this.room.name].createConstructionSite(position.x, position.y, STRUCTURE_CONTAINER);
      u.log(`createConstructionSite container ${res}`)
      if (res == OK) {
        miningSite.memory[memoryKey] = position
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
      maxRooms: 1,
      ignore: [from, to] // do not create road on start and end point
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
      u.log(`createConstructionSite tower ${res}`)
      if (res == OK) {
        Memory.rooms[room.name].towersManager.nextTowerPos = position
      }
    }
    return res
  }

  findPositionForTower(room: Room): Position {
    return { x: 1, y: 1 } as Position
  }

  buildExtensions(...args: any[]): number {
    console.log("buildExtensions", args)
    let near = args[0].near
    let extensionCount = args[0].extensionCount
    let room = args[0].room
    let res = -1
    if (extensionCount > 0 && room && near) {
      let spotsFound = this.findEmptySpotsNear(room, near, extensionCount)
      console.log("spotsFound", JSON.stringify(spotsFound))
      spotsFound.forEach((spot: Position) => {
        room.createConstructionSite(spot.x, spot.y, STRUCTURE_EXTENSION)
      });
    }
    return res;
  }

  buildStorage(...args: any[]): number {
    let near = args[0].near
    let room = args[0].room
    console.log("buildStorage", near, room)
    let res = -1
    if (room && near) {
      let spotsFound = this.findEmptySpotsNear(room, near, 1)
      console.log("spotsFound", JSON.stringify(spotsFound))
      spotsFound.forEach((spot: Position) => {
        room.createConstructionSite(spot.x, spot.y, STRUCTURE_STORAGE)
      });
    }
    return res;
  }

  //
  // JSON.stringify(mainRoom.architect.findEmptySpotsNear(mainRoom.room, Game.spawns.Spawn1.pos, 3))
  findEmptySpotsNear(room: Room, near: Position, spotsNumber = 0): Position[] {
    let center = near
    let emptySpots = [] as Position[];
    if (!room || !near) {
      return emptySpots
    }
    let allFound = false
    console.log("center", center.x, center.y)
    for (let range = 1; range < 50; range++) {
      if (allFound) { break }
      for (let i = range * -1; i <= range; i++) {
        if (allFound) { break }
        for (let j = range * -1; j <= range; j++) {
          if (allFound) { break }
          let spot = {
            x: center.x + i,
            y: center.y + j
          }
          // https://stackoverflow.com/questions/17813807/get-the-closest-squares-in-a-grid-like-system
          // just to be sure to not pass again to same spot bettween 2 iterations of 'range'
          let spotRange = Math.abs(center.y - spot.y) + Math.abs(center.x - spot.x)
          console.log("spot", spot.x, spot.y, center.x, center.y, "range:", spotRange)
          if (spotRange == range) {
            // avoid walls and structures
            let somethingAtThisSpot = room.lookAt(spot.x, spot.y)
              .find(i => i.type === LOOK_STRUCTURES || (i.type === LOOK_TERRAIN && i.terrain === "wall"));
            if (somethingAtThisSpot) {
              continue;
            } else {
              emptySpots.push(spot)
              // loop terminator
              allFound = (emptySpots.length == spotsNumber)
            }
          }
        }
      }
    }
    return emptySpots
  }
}
