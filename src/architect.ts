import { u } from "utils/Utils";
import { RoomPlanner } from "room_planning/RoomPlanner";
import { stringify } from "querystring";

export class Architect {
  constructor() {
    global.pubSub.subscribe('BUILD_CONTAINER_NEEDED', this.buildContainer.bind(this))
    global.pubSub.subscribe('BUILD_ROAD_NEEDED', this.buildRoad.bind(this))
    global.pubSub.subscribe('TOWER_REQUEST', this.buildTower.bind(this))
    global.pubSub.subscribe('BUILD_EXTENSION', this.buildExtensions.bind(this))
    global.pubSub.subscribe('BUILD_STORAGE', this.buildStorage.bind(this))
    global.pubSub.subscribe('BUILD_LINK', this.buildLink.bind(this))
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
    // console.log("position", JSON.stringify(position))
    if (position) {
      res = Game.rooms[miningSite.source.room.name].createConstructionSite(position.x, position.y, STRUCTURE_CONTAINER);
      // console.log(`createConstructionSite container ${res}`)
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
      let spot = this.lookForContainerSpotAround(source.pos, 2)
      console.log("lookForContainerSpotAround", spot)
      if (spot) {
        return spot
      }
    }
    return null
  }

  lookForContainerSpotAround(pos: RoomPosition, range = 1): RoomPosition | undefined {

    const looks = Game.rooms[pos.roomName].lookAtArea(pos.y - range, pos.x - range, pos.y + range, pos.x + range)
    let spots: RoomPosition[] = [];
    for (const y in looks) {
      if (looks.hasOwnProperty(y)) {
        const xs = looks[y];
        for (const x in xs) {
          // console.log("x", x)
          if (xs.hasOwnProperty(x)) {
            const lookObjects = xs[x];
            // console.log("lookObjects", lookObjects)
            let available = true
            _.forEach(lookObjects, (lookObject) => {
              if ((lookObject.type == LOOK_TERRAIN && lookObject.terrain == "wall") || lookObject.type == LOOK_STRUCTURES || lookObject.type == LOOK_CONSTRUCTION_SITES) {
                available = false
                return false;
              }
            })
            if (available) {
              spots.push(new RoomPosition(parseInt(x), parseInt(y), pos.roomName))
            }
          }
        }
      }
    }
    spots = _.sortBy(spots, s => {
      return s.findInRange(FIND_CONSTRUCTION_SITES, 1).length * -1
    })
    console.log("spots", spots)
    return spots[0]
  }


  buildRoad(...args: any[]): number {
    const from = args[0].from as RoomPosition
    const to = args[0].to as RoomPosition

    // if (from.roomName != to.roomName && from.roomName == this.room.name) { return -1 }
    // const pathSteps = this.room.findPath(from, to, {
    //   ignoreCreeps: true,
    //   maxRooms: 3
    // })
    // // remove last step to not build road on arrival
    // pathSteps.pop();

    // let points = pathSteps.map(ps => new RoomPosition(ps.x, ps.y, "W11N11"))
    // new RoomVisual('W11N11').poly(points);

    let pathSteps = PathFinder.search(from, to, {
      plainCost: 2,
      swampCost: 10,
      roomCallback: (roomName) => {
        let room = Game.rooms[roomName];
        // In this example `room` will always exist, but since
        // PathFinder supports searches which span multiple rooms
        // you should be careful!
        if (!room) return false;
        let costs = new PathFinder.CostMatrix;

        room.find(FIND_STRUCTURES).forEach((struct) => {
          if (struct.structureType === STRUCTURE_ROAD) {
            // Favor roads over plain tiles
            costs.set(struct.pos.x, struct.pos.y, 1);
          } else if (struct.structureType !== STRUCTURE_CONTAINER &&
            (struct.structureType !== STRUCTURE_RAMPART ||
              !struct.my)) {
            // Can't walk through non-walkable buildings
            costs.set(struct.pos.x, struct.pos.y, 0xff);
          }
        });

        if (Memory.rooms[room.name] && Memory.rooms[room.name].roomPlanner) {
          let roomPlannerMemo = Memory.rooms[room.name].roomPlanner
          // planned roads shoulld be prioritized
          _.forEach(roomPlannerMemo.plans.roads, structure => {
            costs.set(structure.pos[0], structure.pos[1], 1);
          })
          // planned structures should not be walkable
          _.forEach(roomPlannerMemo.plans.structures, structure => {
            costs.set(structure.pos[0], structure.pos[1], 0xff);
          })
        }

        return costs;
      }
    });


    _.forEach(pathSteps.path, (step) => {
      Game.rooms[step.roomName].createConstructionSite(step.x, step.y, STRUCTURE_ROAD)
    })
    return OK
  }

  buildTower(...args: any[]): number {
    const room = Game.rooms[args[0].roomName]
    const near = args[0].near
    let res = -1
    if (room && near) {
      let spotsFound = this.findEmptySpotsNear(room, near, 1)
      console.log("spotsFound", JSON.stringify(spotsFound))
      if (spotsFound.length > 0) {
        res = room.createConstructionSite(spotsFound[0].x, spotsFound[0].y, STRUCTURE_TOWER)
        // if (res == OK) {
        //   Memory.rooms[room.name].towersManager.nextTowerPos = spotsFound[0]
        // }

      }
    }
    return res
  }

  findPositionForTower(room: Room): Position {
    return { x: 1, y: 1 } as Position
  }

  buildExtensions(...args: any[]): number {
    // console.log("buildExtensions", JSON.stringify(args))
    let near = args[0].near
    let extensionCount = args[0].extensionCount
    let room = args[0].room
    let res = -1
    if (extensionCount > 0 && room && near) {
      let spotsFound = this.findEmptySpotsNear(room, near, extensionCount)
      // console.log("spotsFound", JSON.stringify(spotsFound))
      spotsFound.forEach((spot: Position) => {
        room.createConstructionSite(spot.x, spot.y, STRUCTURE_EXTENSION)
      });
    }
    return res;
  }

  buildStorage(...args: any[]): number {
    let near = args[0].near
    let room = args[0].room
    // console.log("buildStorage", near, room)
    let res = -1
    if (room && near) {
      let spotsFound = this.findEmptySpotsNear(room, near, 1)
      // console.log("spotsFound", JSON.stringify(spotsFound))
      spotsFound.forEach((spot: Position) => {
        room.createConstructionSite(spot.x, spot.y, STRUCTURE_STORAGE)
      });
    }
    return res;
  }

  buildLink(...args: any[]): number {
    let near = args[0].near
    let room = args[0].room
    // console.log("buildStorage", near, room)
    let res = -1
    if (room && near) {
      let spotsFound = this.findEmptySpotsNear(room, near, 1)
      // console.log("spotsFound", JSON.stringify(spotsFound))
      spotsFound.forEach((spot: Position) => {
        room.createConstructionSite(spot.x, spot.y, STRUCTURE_LINK)
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
    // console.log("center", center.x, center.y)
    for (let range = 1; range < 20; range++) {
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
          // console.log("spot", spot.x, spot.y, center.x, center.y, "range:", spotRange)
          if (spotRange == range) {
            // avoid walls and structures
            let somethingAtThisSpot = room.lookAt(spot.x, spot.y)
              .find(i => i.type === LOOK_STRUCTURES || i.type === LOOK_CONSTRUCTION_SITES || (i.type === LOOK_TERRAIN && i.terrain === "wall"));
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
