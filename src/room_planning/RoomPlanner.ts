import { roadPlanner } from 'room_planning/RoadPlanner'

export class RoomPlanner {
  constructor(public room: Room) {
  }

  buildFortressRoads() {
    let firstSpawner = this.room.find(FIND_MY_STRUCTURES, {
      filter: i => i.structureType === STRUCTURE_SPAWN
    })
    if (firstSpawner) {
      const terrain = new Room.Terrain(this.room.name);
      let roads = roadPlanner(firstSpawner[0].pos)
      roads.buildings.road.pos.forEach(roadPos => {
        let terrainType = terrain.get(roadPos.x, roadPos.y)
        if (terrainType != TERRAIN_MASK_WALL) {
          this.room.createConstructionSite(roadPos.x, roadPos.y, STRUCTURE_ROAD)
        }
      });
    }
  }

  buildControllerRoads() {
    let controllerEnergeySources = _.sortBy(this.room.find(FIND_SOURCES_ACTIVE), s => this.room.controller!.pos.getRangeTo(s))
    if (controllerEnergeySources.length > 0) {
      global.pubSub.publish('BUILD_ROAD_NEEDED', {
        from: this.room.controller!.pos,
        to: controllerEnergeySources[0].pos
      })
    }
  }
}
