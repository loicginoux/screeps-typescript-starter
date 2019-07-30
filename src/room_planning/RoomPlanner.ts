import { roadDistrictPlanner } from 'room_planning/roadDistrictPlanner'

export class RoomPlanner {
  constructor(public room: Room) {
  }

  buildFortressRoads() {
    if (!this.room.controller) {
      return
    }
    let firstSpawner = this.room.find(FIND_MY_STRUCTURES, {
      filter: i => i.structureType === STRUCTURE_SPAWN
    })
    const nbDistrictsPerLevel = [5, 5, 5, 5, 13, 13, 13, 21, 21]
    const nbDistrict = nbDistrictsPerLevel[this.room.controller.level]
    if (firstSpawner) {
      const terrain = new Room.Terrain(this.room.name);
      let builtDistricts = [firstSpawner[0].pos]
      // build spawner district
      let roads = roadDistrictPlanner(firstSpawner[0].pos)
      roads.buildings.road.pos.forEach(roadPos => {
        this.room.createConstructionSite(roadPos.x, roadPos.y, STRUCTURE_ROAD)
      });
      // build other districts
      for (let i = 1; i < nbDistrict; i++) {
        let centerDistrict = this.findNextCenterDistrict(terrain, firstSpawner[0].pos, builtDistricts, i)
        if (centerDistrict) {
          builtDistricts.push(centerDistrict)
          let roads = roadDistrictPlanner(centerDistrict)
          roads.buildings.road.pos.forEach(roadPos => {
            this.room.createConstructionSite(roadPos.x, roadPos.y, STRUCTURE_ROAD)
          });
        }
      }
    }
  }

  // mainRoom.roomPlanner.findNextCenterDistrict((new Room.Terrain(mainRoom.room.name)), (new RoomPosition(34, 20, mainRoom.room.name)), [
  //   (new RoomPosition(10, 10, mainRoom.room.name)),
  // ])

  findNextCenterDistrict(terrain: RoomTerrain, centerSpiral: RoomPosition, unavailablePositions: RoomPosition[], nbDistrictBuilt: number): RoomPosition | undefined {
    let centerDistrict = this.findCenterDistrict(centerSpiral, 0);
    let roomCenterDistrict;
    for (let i = nbDistrictBuilt; i < 50; i++) {
      centerDistrict = this.findCenterDistrict(centerSpiral, i);
      console.log("checking available center district", i, JSON.stringify(centerDistrict))
      let available = true;
      // check that center is not out of room
      if (centerDistrict.x >= 47 || centerDistrict.x <= 2 || centerDistrict.y >= 47 || centerDistrict.y <= 2) {
        available = false;
      }
      if (!available) {
        console.log("out of room");
        continue
      }
      roomCenterDistrict = new RoomPosition(centerDistrict.x, centerDistrict.y, this.room.name)
      // check against district already taken points
      unavailablePositions.forEach(pos => {
        if (pos.x == centerDistrict.x && pos.y == centerDistrict.y) {
          available = false;
        }
      });
      if (!available) {
        console.log("already taken");
        continue
      }
      // check that center is not already taken by structure
      this.room.lookAt(roomCenterDistrict).forEach(function (lookObject) {
        if (lookObject.type == LOOK_CONSTRUCTION_SITES || lookObject.type == LOOK_STRUCTURES) {
          available = false;
        }
      });
      if (!available) {
        console.log("center already occupied by structure");
        continue
      }

      // check that district is not in WALLS
      console.log("roomCenterDistrict", (available ? "available" : "unavailable"), JSON.stringify(roomCenterDistrict))
      let roads = roadDistrictPlanner(roomCenterDistrict)
      let canBuildDistrict = true;
      roads.buildings.road.pos.forEach(roadPos => {
        let terrainType = terrain.get(roadPos.x, roadPos.y)
        if (terrainType == TERRAIN_MASK_WALL) {
          canBuildDistrict = false
        }
      });

      console.log("canBuildDistrict", canBuildDistrict)
      if (canBuildDistrict) {
        break;
      }
    }
    return roomCenterDistrict;
  }
  // 0     0  i = 0
  // - 2 + 2  i = 1  j=i%4=1 j=1 range=parseInt((i-1)/8)+1=1 diag=(int((i-1)/4)%2==0)=true ew=i%2?-1:1=-1 (east) ns=parseInt(i-1/2)%2?-1:1=1 (North) 8loop =parseInt(i/4+1)=1 x=ew*8loop*2 y=ns*8loop*2
  // + 2 + 2  i = 2  j=2 ew=1 (west) ns=1 8loop= 1
  // - 2 - 2  i = 3  j=3 ew=-1 ns=-1 8loop= 1
  // + 2 - 2  i = 4  j=4 ew=1 ns=-1 8loop= 1

  // -4   0   i = 5  j=1 range=1 diag=false ew=[-1, 0, 0 , +1][(i-1)%4]=-1 ns=[0, 1, -1 , 0][(i-1)%4]=0 8loop=i/4=1 x=ew*8loop*4 (*2 if diag) y=ns*8loop*4
  // 0   + 4  i = 6  j=2 ew=0 ns=1 8loop= 1
  // 0   -4   i = 7  j=3 ew=0 ns=-1 8loop= 1
  // +4   0   i = 8  j=4 ew=1 ns=0 8loop= 1

  // -4   +4   i = 9 j=1 range=2 diag=true ew=-1 ns=1 8loop=2 x=ew*8loop*2 y=ns*8loop*2
  findRelativeCenterDistrict(centerSpiral: RoomPosition, i: number): Position {
    let pos;
    if (i == 0) {
      pos = {
        x: 0,
        y: 0
      }
    } else {
      // const range = Math.floor((i - 1) / 8) + 1;
      const diag = (Math.floor((i - 1) / 4) % 2) == 0;
      let ew;
      let ns;
      if (diag) {
        ew = [-1, 1, -1, +1][(i - 1) % 4]
        ns = [1, 1, -1, -1][(i - 1) % 4];
      } else {
        ew = [-1, 0, 0, +1][(i - 1) % 4]
        ns = [0, 1, -1, 0][(i - 1) % 4]
      }
      const rangeLoop = Math.floor(i / 8 + 1)
      let x = ew * rangeLoop * 2
      let y = ns * rangeLoop * 2
      if (!diag) {
        x *= 2
        y *= 2
      }
      // console.log("relativePos", i, "x", x, "y", y, "ew", ew, "ns", ns, "diag", diag, "rangeLoop", rangeLoop)
      pos = { x: x, y: y }
    }

    return pos
  }
  findCenterDistrict(centerSpiral: RoomPosition, i: number): Position {
    let relativePos = this.findRelativeCenterDistrict(centerSpiral, i)
    return {
      x: (centerSpiral.x + relativePos.x),
      y: (centerSpiral.y + relativePos.y)
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

  buildSourceRoads() {
    let energeySources = _.sortBy(this.room.find(FIND_SOURCES_ACTIVE), s => this.room.controller!.pos.getRangeTo(s))
    let firstSpawner = this.room.find(FIND_MY_STRUCTURES, {
      filter: i => i.structureType === STRUCTURE_SPAWN
    })
    if (firstSpawner) {
      _.forEach(energeySources, es => {
        global.pubSub.publish('BUILD_ROAD_NEEDED', {
          from: firstSpawner[0].pos,
          to: es.pos
        })
      })
    }
  }
}
