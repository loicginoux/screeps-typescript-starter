export class RoomPlanner {
  memory: {
    plans: {
      roads: { pos: number[], level: number }[],
      centerDistricts: number[][],
      structures: {
        pos: number[],
        level: number
        type: BuildableStructureConstant
      }[],
      nearStructures: {
        pos: number[],
        level: number
        type: BuildableStructureConstant
      }[],
      controllerRoads: number[][],
      sourceRoads: number[][],
      sourceNearestRoads: number[][],
      mineralRoads: number[][]
    },
    visuals: number,
    structuresVisuals: number
  };
  spawner: any;
  cityPlanned: boolean = false;
  terrain: RoomTerrain;

  constructor(public room: Room) {

  }
  initMemory(force = false) {
    if (force || !Memory.rooms[this.room.name].roomPlanner) {
      Memory.rooms[this.room.name].roomPlanner = {
        plans: {
          roads: [],
          centerDistricts: [],
          structures: [],
          nearStructures: [],
          sourceRoads: [],
          sourceNearestRoads: [],
          controllerRoads: [],
          mineralRoads: []
        },
        visuals: 8,
        structuresVisuals: 0
      }
    }
    this.memory = Memory.rooms[this.room.name].roomPlanner
  }

  planCity() {
    this.initMemory(true)
    this.spawner = this.room.find(FIND_STRUCTURES, {
      filter: i => i.structureType === STRUCTURE_SPAWN
    })[0]
    this.terrain = new Room.Terrain(this.room.name);
    levelsPlan.forEach((levelPlan: any) => {
      this.planDistrictsRoads(levelPlan)
    })

    levelsPlan.forEach((levelPlan: any) => {
      this.planDistrictsStructures(levelPlan)
    })

    this.planSourcesRoads()
    this.planControllerRoads()
    // this.planMineralRoads()

    // at the end to be sure to not take districts spaces
    levelsPlan.forEach((levelPlan: any) => {
      this.planNearStructures(levelPlan)
    })

    // this.memory.cityPlanned = true;
    this.drawCity();
  }

  drawCity() {
    if (!this.memory.visuals) { return }
    let colorRoadsOpts = { radius: 0.20, opacity: 0.2, strokeWidth: 0.05, fill: 'transparent', stroke: structureColors[STRUCTURE_ROAD] }
    this.memory.plans.roads.forEach((memoryStructure: any) => {
      if (this.memory.visuals >= memoryStructure.level) {
        this.room.visual.circle(memoryStructure.pos[0], memoryStructure.pos[1], colorRoadsOpts);
      }
    });

    this.memory.plans.controllerRoads.forEach((memoryStructure: any) => {
      this.room.visual.circle(memoryStructure[0], memoryStructure[1], colorRoadsOpts);
    });

    this.memory.plans.sourceRoads.forEach((memoryStructure: any) => {
      this.room.visual.circle(memoryStructure[0], memoryStructure[1], colorRoadsOpts);
    });

    this.drawStructures(STRUCTURE_EXTENSION)
    this.drawStructures(STRUCTURE_SPAWN)
    this.drawStructures(STRUCTURE_NUKER)
    this.drawStructures(STRUCTURE_OBSERVER)
    this.drawStructures(STRUCTURE_TOWER)
    this.drawStructures(STRUCTURE_TERMINAL)
    this.drawStructures(STRUCTURE_STORAGE)
    this.drawStructures(STRUCTURE_LINK)
    this.drawStructures(STRUCTURE_CONTAINER)
    this.drawStructures(STRUCTURE_OBSERVER)
    this.drawStructures(STRUCTURE_POWER_SPAWN)
    this.drawStructures(STRUCTURE_LAB)
    this.drawStructures(STRUCTURE_NUKER)
    this.drawStructures(STRUCTURE_RAMPART)
    this.drawStructures(STRUCTURE_ROAD)
    this.drawStructures(STRUCTURE_EXTRACTOR)

    let i = 0
    this.memory.plans.centerDistricts.forEach((pos: any) => {
      this.room.visual.text(i.toString(), pos[0], pos[1]);
      i++
    });
  }

  drawStructures(structure: BuildableStructureConstant) {
    if (!this.memory.structuresVisuals) { return }
    this.memory.plans.structures.forEach((memoryStructure: any) => {
      let color = structureColors[memoryStructure.type]
      if (this.memory.structuresVisuals >= memoryStructure.level) {
        this.room.visual.circle(memoryStructure.pos[0], memoryStructure.pos[1], { radius: 0.20, opacity: 0.2, strokeWidth: 0.05, fill: 'transparent', stroke: color });
      }
    });
  }

  planDistrictsRoads(levelPlan: any) {
    if (!this.room.controller) { return }

    if (this.spawner) {
      if (levelPlan.districtsRoads == 0) {
        // build spawner district
        let roads = this.roadDistrictPlanner(this.spawner.pos)
        this.memory.plans.centerDistricts.push([this.spawner.pos.x, this.spawner.pos.y])
        roads.buildings.road.pos.forEach(roadPos => {
          this.memory.plans.roads.push({ pos: [roadPos.x, roadPos.y], level: levelPlan.level })
        });
      } else {
        // build other districts
        for (let i = this.memory.plans.centerDistricts.length; i <= levelPlan.districtsRoads; i++) {
          let centerDistrict = this.findNextCenterDistrict(this.spawner.pos, i)
          if (centerDistrict) {
            let roads = this.roadDistrictPlanner(centerDistrict)
            this.memory.plans.centerDistricts.push([centerDistrict.x, centerDistrict.y])
            roads.buildings.road.pos.forEach(roadPos => {
              this.memory.plans.roads.push({ pos: [roadPos.x, roadPos.y], level: levelPlan.level })
            });
          }
        }
      }
    }
  }

  planDistrictsStructures(levelPlan: any) {
    levelPlan.structures.forEach((structure: any) => {
      if (!structure.near) {
        let centerDistrict = this.memory.plans.centerDistricts[structure.district]
        let i = 0
        while (i < structure.number) {
          // console.log("number", structure.type, i, structure.district)

          // find available position in district
          let positions = [[0, 0], [1, 0], [-1, 0], [0, -1], [0, 1]] // relative pos from center
          _.forEach(positions, pos => {
            let roomPosition = [(centerDistrict[0] + pos[0]), (centerDistrict[1] + pos[1])]
            let rp = new RoomPosition(roomPosition[0], roomPosition[1], this.room.name)
            let available = true
            _.forEach(this.memory.plans.structures, memoryStructure => {
              if (memoryStructure.pos[0] == roomPosition[0] && memoryStructure.pos[1] == roomPosition[1]) {
                available = false;
                return false;
              }
              this.room.lookAt(rp).forEach((lookObject) => {
                if (lookObject.type == LOOK_CONSTRUCTION_SITES || lookObject.type == LOOK_STRUCTURES) {
                  available = false;
                }
              })
            });
            if (available) {
              this.memory.plans.structures.push({ pos: roomPosition, type: structure.type, level: levelPlan.level })
              return false;
            }
          });
          i++
        }
      }
    });
  }

  planNearStructures(levelPlan: any) {
    levelPlan.structures.forEach((structure: any) => {
      if (structure.near) {
        this.planNearTypesStructure(structure, levelPlan.level)
      }
    });
  }

  // mainRoom.roomPlanner.planNearTypesStructures({ type: STRUCTURE_LINK, near: "controller", range: 3 }, 5)
  // mainRoom.roomPlanner.planNearTypesStructures({ type: STRUCTURE_LINK, near: "source", range: 2, listIndex: 0 }, 5)
  planNearTypesStructure(structure: any, level: number) {
    let nearObject;
    let secondNearObject;
    switch (structure.near) {
      case 'controller':
        nearObject = this.room.controller
        secondNearObject = this.memory.plans.controllerRoads[0]
        break;
      case 'source':
        nearObject = this.room.find(FIND_SOURCES)[structure.listIndex]
        secondNearObject = this.memory.plans.sourceNearestRoads[structure.listIndex]
        break;
      case 'mineral':
        nearObject = this.room.find(FIND_MINERALS)[0]
        secondNearObject = this.memory.plans.mineralRoads[0]
        break;
      default:
        break;
    }
    if (!nearObject || !secondNearObject) { return }
    let pos = nearObject.pos
    const look = this.room.lookAtArea(pos.y - structure.range, pos.x - structure.range, pos.y + structure.range, pos.x + structure.range)
    let availableSites = [];
    // console.log("look", pos.x, pos.y, structure.range, JSON.stringify(look))
    for (const y in look) {
      // console.log("y", y)
      if (look.hasOwnProperty(y)) {
        const xs = look[y];
        for (const x in xs) {
          // console.log("x", x)
          if (xs.hasOwnProperty(x)) {
            const lookObjects = xs[x];
            // console.log("lookObjects", lookObjects)
            let available = true
            _.forEach(lookObjects, (lookObject) => {
              if (lookObject.type == LOOK_STRUCTURES || lookObject.type == LOOK_CONSTRUCTION_SITES || (lookObject.type == LOOK_TERRAIN && lookObject.terrain == "wall")) {
                available = false
              }
            })
            if (available) {
              _.forEach(this.memory.plans.structures, (structure) => {
                if (structure.pos[0].toString() == x && structure.pos[1].toString() == y) {
                  available = false
                }
              })
            }
            if (available) {
              _.forEach(this.memory.plans.roads, (road) => {
                if (road.pos[0].toString() == x && road.pos[1].toString() == y) {
                  available = false
                }
              })
            }
            if (available) {
              _.forEach(this.memory.plans.sourceRoads, (road) => {
                if (road[0].toString() == x && road[1].toString() == y) {
                  available = false
                }
              })
            }
            if (available) {
              _.forEach(this.memory.plans.controllerRoads, (road) => {
                if (road[0].toString() == x && road[1].toString() == y) {
                  available = false
                }
              })
            }
            if (available) {
              _.forEach(this.memory.plans.mineralRoads, (road) => {
                if (road[0].toString() == x && road[1].toString() == y) {
                  available = false
                }
              })
            }
            // TODO check that it does not exist in memory
            if (available) {
              availableSites.push([parseInt(x), parseInt(y)])
            }
          }
        }
      }
    }
    // we get the nearest point to the base
    const secondNearPosition = (new RoomPosition(secondNearObject[0], secondNearObject[1], this.room.name))
    availableSites = _.sortBy(availableSites, (p: number[]) => {
      let site = (new RoomPosition(p[0], p[1], this.room.name))
      return site.getRangeTo(secondNearPosition)
    });
    if (availableSites.length > 0) {
      this.memory.plans.nearStructures.push({ pos: availableSites[0], type: structure.type, level: level })
    }
    return availableSites
  }

  planSourcesRoads() {
    if (this.spawner) {
      _.forEach(this.room.find(FIND_SOURCES_ACTIVE), es => {
        let paths = PathFinder.search(es.pos, { pos: this.spawner.pos, range: 1 }, {
          plainCost: 2,
          swampCost: 10,
          roomCallback: (roomName) => {
            let costs = new PathFinder.CostMatrix;
            // planned roads shoulld be prioritized
            _.forEach(this.memory.plans.roads, structure => {
              costs.set(structure.pos[0], structure.pos[1], 1);
            })
            // planned structures should not be walkable
            _.forEach(this.memory.plans.structures, structure => {
              costs.set(structure.pos[0], structure.pos[1], 255);
            })

            return costs;
          },
        })
        this.memory.plans.sourceNearestRoads.push([paths.path[0].x, paths.path[0].y])
        _.forEach(paths.path, p => {
          this.memory.plans.sourceRoads.push([p.x, p.y]);
        })
      })
    }
  }

  planControllerRoads() {
    if (this.room.controller) {
      let controllerEnergeySources = _.sortBy(this.room.find(FIND_SOURCES_ACTIVE), s => this.room.controller!.pos.getRangeTo(s))

      let paths = PathFinder.search(this.room.controller.pos, { pos: controllerEnergeySources[0].pos, range: 1 }, {
        plainCost: 2,
        swampCost: 10,
        roomCallback: (roomName) => {
          let costs = new PathFinder.CostMatrix;
          // planned roads shoulld be prioritized
          _.forEach(this.memory.plans.roads, structure => {
            costs.set(structure.pos[0], structure.pos[1], 1);
          })
          // planned structures should not be walkable
          _.forEach(this.memory.plans.structures, structure => {
            costs.set(structure.pos[0], structure.pos[1], 255);
          })

          return costs;
        },
      })
      _.forEach(paths.path, p => {
        this.memory.plans.controllerRoads.push([p.x, p.y]);
      })
    }

  }

  planMineralRoads() {
    let mineral = this.room.find(FIND_MINERALS)[0]
    if (!mineral) { return }
    // TODO
    // change labs position

    let labs = this.room.controller!;

    let paths = PathFinder.search(mineral.pos, { pos: labs.pos, range: 1 }, {
      plainCost: 2,
      swampCost: 10,
      roomCallback: (roomName) => {
        let costs = new PathFinder.CostMatrix;
        // planned roads shoulld be prioritized
        _.forEach(this.memory.plans.roads, structure => {
          costs.set(structure.pos[0], structure.pos[1], 1);
        })
        // planned structures should not be walkable
        _.forEach(this.memory.plans.structures, structure => {
          costs.set(structure.pos[0], structure.pos[1], 255);
        })

        return costs;
      },
    })

    _.forEach(paths.path, p => {
      this.memory.plans.mineralRoads.push([p.x, p.y]);
    })
  }

  findNextCenterDistrict(centerSpiral: RoomPosition, nbDistrictBuilt: number): RoomPosition | undefined {
    const unavailablePositions = this.memory.plans.centerDistricts;
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
        if (centerDistrict.x == pos[0] && centerDistrict.y == pos[1]) {
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
      let roads = this.roadDistrictPlanner(roomCenterDistrict)
      let canBuildDistrict = true;
      roads.buildings.road.pos.forEach(roadPos => {
        let terrainType = this.terrain.get(roadPos.x, roadPos.y)
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
      const rangeLoop = Math.floor((i - 1) / 8 + 1)
      let x = ew * rangeLoop * 2
      let y = ns * rangeLoop * 2
      if (!diag) {
        x *= 2
        y *= 2
      }
      console.log("relativePos", i, "x", x, "y", y, "ew", ew, "ns", ns, "diag", diag, "rangeLoop", rangeLoop)
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

  createConstructionSites(level: number) {

    this.buildControllerRoads();
    this.buildSourceRoads();

    this.memory.plans.roads.forEach((memoryStructure: any) => {
      let roomPosition = new RoomPosition(memoryStructure.pos[0], memoryStructure.pos[1], this.room.name)
      let available = true;
      this.room.lookAt(roomPosition).forEach(function (lookObject) {
        if (lookObject.type == LOOK_CONSTRUCTION_SITES || lookObject.type == LOOK_STRUCTURES) {
          available = false;
        }
      });
      if (memoryStructure.level <= level && available) {
        this.room.createConstructionSite(memoryStructure.pos[0], memoryStructure.pos[1], STRUCTURE_ROAD)
      }
    });

    const structures = this.memory.plans.structures.concat(this.memory.plans.nearStructures)
    structures.forEach((memoryStructure: any) => {
      let roomPosition = new RoomPosition(memoryStructure.pos[0], memoryStructure.pos[1], this.room.name)
      let available = true;
      this.room.lookAt(roomPosition).forEach(function (lookObject) {
        if (lookObject.type == LOOK_CONSTRUCTION_SITES || lookObject.type == LOOK_STRUCTURES) {
          available = false;
        }
      });
      if (memoryStructure.level <= level && available) {
        this.room.createConstructionSite(memoryStructure.pos[0], memoryStructure.pos[1], memoryStructure.type)
      }
    });
  }

  buildControllerRoads() {
    this.memory.plans.controllerRoads.forEach((memoryStructure: any) => {
      let roomPosition = new RoomPosition(memoryStructure[0], memoryStructure[1], this.room.name)
      let available = true;
      this.room.lookAt(roomPosition).forEach(function (lookObject) {
        if (lookObject.type == LOOK_CONSTRUCTION_SITES || lookObject.type == LOOK_STRUCTURES) {
          available = false;
        }
      });
      if (available) {
        this.room.createConstructionSite(memoryStructure[0], memoryStructure[1], STRUCTURE_ROAD)
      }
    });
  }

  buildSourceRoads() {
    this.memory.plans.sourceRoads.forEach((memoryStructure: any) => {
      let roomPosition = new RoomPosition(memoryStructure[0], memoryStructure[1], this.room.name)
      let available = true;
      this.room.lookAt(roomPosition).forEach(function (lookObject) {
        if (lookObject.type == LOOK_CONSTRUCTION_SITES || lookObject.type == LOOK_STRUCTURES) {
          available = false;
        }
      });
      if (available) {
        this.room.createConstructionSite(memoryStructure[0], memoryStructure[1], STRUCTURE_ROAD)
      }
    });
  }

  //    x
  //  x   x
  // x  o  x
  //  x   x
  //    x
  roadDistrictPlanner(center: RoomPosition) {
    return {
      "buildings": {
        "road": {
          "pos": [
            { "x": center.x, "y": center.y - 2 },
            { "x": center.x - 1, "y": center.y - 1 },
            { "x": center.x + 1, "y": center.y - 1 },
            { "x": center.x - 2, "y": center.y },
            { "x": center.x + 2, "y": center.y },
            { "x": center.x - 1, "y": center.y + 1 },
            { "x": center.x + 1, "y": center.y + 1 },
            { "x": center.x, "y": center.y + 2 }
          ]
        },
      }
    }
  }

  //   OO/
  //  OO/O
  //  O/OO
  //  /OO
  labsDistrictPlanner(center: RoomPosition) {
    return {
      "buildings": {
        "lab": {
          "pos": [
            { "x": 20, "y": 30 },
            { "x": 21, "y": 30 },
            { "x": 19, "y": 31 },
            { "x": 20, "y": 31 },
            { "x": 22, "y": 31 },
            { "x": 19, "y": 32 },
            { "x": 21, "y": 32 },
            { "x": 22, "y": 32 },
            { "x": 20, "y": 33 },
            { "x": 21, "y": 33 }
          ]
        },
        "road": {
          "pos": [
            { "x": 22, "y": 30 },
            { "x": 21, "y": 31 },
            { "x": 20, "y": 32 },
            { "x": 19, "y": 33 }
          ]
        }
      }
    }
  }
}

const structureColors: any = {
  [STRUCTURE_EXTENSION]: "yellow",
  [STRUCTURE_SPAWN]: "blue",
  [STRUCTURE_NUKER]: "red",
  [STRUCTURE_OBSERVER]: "red",
  [STRUCTURE_TOWER]: "black",
  [STRUCTURE_TERMINAL]: "white",
  [STRUCTURE_STORAGE]: "pink",
  [STRUCTURE_LINK]: "orange",
  [STRUCTURE_CONTAINER]: "red",
  [STRUCTURE_OBSERVER]: "black",
  [STRUCTURE_POWER_SPAWN]: "black",
  [STRUCTURE_LAB]: "purple",
  [STRUCTURE_NUKER]: "black",
  [STRUCTURE_RAMPART]: "cyan",
  [STRUCTURE_ROAD]: "lawngreen",
  [STRUCTURE_EXTRACTOR]: "purple"
};

const levelsPlan: any = [
  {
    level: 1,
    structures: [
      // { type: STRUCTURE_SPAWN, district: 0, number: 1 },
      // { type: STRUCTURE_CONTAINER, near: "source", number: 2 }
    ],
    districtsRoads: 0
  },
  {
    level: 2,
    structures: [
      { type: STRUCTURE_EXTENSION, district: 1, number: 5 },
    ],
    districtsRoads: 1,
    fortressRamparts: true
  },
  {
    level: 3,
    structures: [
      { type: STRUCTURE_EXTENSION, district: 2, number: 5 },
      { type: STRUCTURE_EXTENSION, district: 3, number: 5 },
      { type: STRUCTURE_TOWER, district: 4, number: 1 },
    ],
    districtsRoads: 4,
  },
  {
    level: 4,
    structures: [
      { type: STRUCTURE_EXTENSION, district: 4, number: 4 },
      { type: STRUCTURE_EXTENSION, district: 5, number: 5 },
      { type: STRUCTURE_EXTENSION, district: 6, number: 1 },
      { type: STRUCTURE_STORAGE, district: 0, number: 1 },
    ],
    districtsRoads: 6,
  },
  {
    level: 5,
    structures: [
      { type: STRUCTURE_EXTENSION, district: 6, number: 4 },
      { type: STRUCTURE_EXTENSION, district: 7, number: 5 },
      { type: STRUCTURE_EXTENSION, district: 8, number: 1 },
      { type: STRUCTURE_TOWER, district: 8, number: 1 },
      { type: STRUCTURE_LINK, district: 0, number: 1 },
      { type: STRUCTURE_LINK, near: "controller", range: 3 },
    ],
    districtsRoads: 8,
  },
  {
    level: 6,
    structures: [
      { type: STRUCTURE_EXTENSION, district: 8, number: 3 },
      { type: STRUCTURE_EXTENSION, district: 9, number: 5 },
      { type: STRUCTURE_EXTENSION, district: 10, number: 2 },
      { type: STRUCTURE_EXTRACTOR, district: 0, number: 1 },
      { type: STRUCTURE_TERMINAL, district: 0, number: 1 },
      { type: STRUCTURE_LINK, near: "source", range: 2, listIndex: 0 },
    ],
    districtsRoads: 10,
    labsDistrict: {
      buildRoads: true,
      number: 3
    }
  },
  {
    level: 7,
    structures: [
      { type: STRUCTURE_EXTENSION, district: 10, number: 3 },
      { type: STRUCTURE_EXTENSION, district: 11, number: 5 },
      { type: STRUCTURE_EXTENSION, district: 12, number: 2 },
      { type: STRUCTURE_SPAWN, district: 12, number: 1 },
      { type: STRUCTURE_TOWER, district: 12, number: 1 },
      { type: STRUCTURE_LINK, near: "source", range: 2, listIndex: 1 },
    ],
    districtsRoads: 12,
    labsDistrict: {
      buildRoads: false,
      number: 3
    }
  },
  {
    level: 8,
    structures: [
      { type: STRUCTURE_EXTENSION, district: 12, number: 1 },
      { type: STRUCTURE_EXTENSION, district: 13, number: 5 },
      { type: STRUCTURE_EXTENSION, district: 14, number: 4 },
      { type: STRUCTURE_TOWER, district: 14, number: 1 },
      { type: STRUCTURE_TOWER, district: 15, number: 2 },
      { type: STRUCTURE_OBSERVER, district: 15, number: 1 },
      { type: STRUCTURE_SPAWN, district: 15, number: 1 },
      { type: STRUCTURE_POWER_SPAWN, district: 16, number: 1 },
      { type: STRUCTURE_LINK, near: "mineral", range: 2 },
      // { type: STRUCTURE_LINK, near: "mineral" },

    ],
    districtsRoads: 16,
    labsDistrict: {
      buildRoads: false,
      number: 4
    }
  }
]
