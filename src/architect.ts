import { pubSub } from "utils/PubSub";
import { MiningSite } from "mining/MiningSite";

export class Architect {
  constructor(private room: Room) {
    pubSub.subscribe('BUILD_CONTAINER_NEEDED', this.buildContainer.bind(this))
    pubSub.subscribe('BUILD_ROAD_NEEDED', this.buildRoad.bind(this))
  }

  buildContainer(...args: any[]): number {
    const miningSite = args[0].miningSite
    const positionForBuilding = this.findContainerPositionForSource(miningSite.source)
    let res = -1
    if (positionForBuilding) {
      res = Game.rooms[this.room.name].createConstructionSite(positionForBuilding, STRUCTURE_CONTAINER);
      if (res == OK) {
        Memory.miningSites[miningSite.source.id].buildingContainers += 1
      }
    }
    return res
  }

  findContainerPositionForSource(source: Source): RoomPosition | null {
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
        return new RoomPosition(firstPlain.x, firstPlain.y, this.room.name)
      }
    }
    return null
  }

  lookForAround(type: LookConstant, pos: RoomPosition) {
    return this.room.lookForAtArea(type, pos.y - 1, pos.x - 1, pos.y + 1, pos.x + 1, true)
  }

  buildRoad(): number {
    return OK
  }

}
