export class Architect {
  constructor(private room: Room) { }

  static runForAllRooms() {
    const roomNames = Object.keys(Game.rooms)
      .map(i => Game.rooms[i])
      .filter(i => i.controller && i.controller.my)
      .map(i => i.name);

    roomNames.forEach(roomName => {
      const room = Game.rooms[roomName];
      var architect = new Architect(room);
      architect.run();
    });
  }

  run() {

    if (this.room.controller && this.room.memory.constructionsAreSetupAtLevel === this.room.controller.level) {
      return;
    }

    var constructionSites = this.room.find(FIND_CONSTRUCTION_SITES);

    var creations = [
      this.createInitialSpawn,
      this.createSourcesRoads,
      this.createControllerRoads,
      // this.createColonyRoads,
      // this.createCloseToSpawn(STRUCTURE_EXTENSION),
      // this.createContainers,
      // this.createMineralRoads,
      // this.createExtractor,
      // this.createCloseToSpawn(STRUCTURE_NUKER),
      // this.createCloseToSpawn(STRUCTURE_TOWER),
      // this.createCloseToSpawn(STRUCTURE_STORAGE),
      // this.createCloseTo(this.room.storage, STRUCTURE_TERMINAL),
      // this.createCloseToSpawn(STRUCTURE_SPAWN),
      // this.createCloseToSpawn(STRUCTURE_OBSERVER),
      // this.createCloseToSpawn(STRUCTURE_POWER_SPAWN),
      // this.createLinks
    ];

    if (constructionSites.length === 0) {
      let somethingIsBeingBuilt = false;
      for (let i = 0; i < creations.length; i++) {
        let result = creations[i].bind(this)();
        if (result === OK) {
          somethingIsBeingBuilt = true;
          break;
        }
      }

      if (!somethingIsBeingBuilt) {
        this.room.memory.constructionsAreSetupAtLevel = this.room.controller && this.room.controller.level;
      }
    }
  }

  createInitialSpawn() {
    const spawn = this.room.find(FIND_MY_SPAWNS)[0];
    const target = Game.flags["claimer_target"];
    if (!spawn && target && target.pos.roomName === this.room.name) {
      console.log('create Spawn')
      const result = this.room.createConstructionSite(target.pos.x, target.pos.y, STRUCTURE_SPAWN);
      if (result === OK) {
        target.remove();
      }
      return result;
    } else {
      return -1;
    }
  }

  createSourcesRoads() {
    if (!this.room.memory.areSourcesRoadsSetup) {
      var firstSpawn = this.room.find(FIND_MY_STRUCTURES, {
        filter: i => i.structureType === "spawn"
      })[0] as StructureSpawn | null;

      if (!firstSpawn) {
        return;
      }
      console.log('create source roads')
      var sources = this.room.find(FIND_SOURCES);
      for (var sourceIndex in sources) {
        var source = sources[sourceIndex];
        this.createRoadFromAtoB(firstSpawn.pos, source.pos);
      }

      this.room.memory.areSourcesRoadsSetup = true;
      return OK;
    }
    return -1;
  }

  createControllerRoads() {
    // if (!this.room.memory.areControllerRoadsSetup && this.room.controller && this.room.controller.level >= 2) {
    if (!this.room.memory.areControllerRoadsSetup && this.room.controller) {
      var firstSpawn = this.room.find(FIND_MY_STRUCTURES, {
        filter: i => i.structureType === "spawn"
      })[0] as StructureSpawn | null;

      if (!firstSpawn) {
        return;
      }

      console.log('create controller roads')

      var controller = this.room.controller;
      if (controller) {
        this.createRoadFromAtoB(firstSpawn.pos, controller.pos);
      }

      this.room.memory.areControllerRoadsSetup = true;
      return OK;
    }
    return -1;
  }


  createRoadFromAtoB(pos1: Position, pos2: Position) {
    this.iterateFromAtoB(pos1, pos2, (pos, index, isLast) => {
      if (!isLast) {
        // TODO: check that there is no terrain or other objet at this pos
        this.createRoadAtPositionIfPossible(pos);
      }
    });
  }

  createRoadAtPositionIfPossible(pos: Position) {
    const structureHere = this.room
      .lookAt(pos.x, pos.y)
      .find(i => i.type === LOOK_STRUCTURES || (i.type === LOOK_TERRAIN && i.terrain === "wall"));

    if (!structureHere) {
      return this.room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
    } else {
      return -1;
    }
  }

  iterateFromAtoB(pos1: Position, pos2: Position, callback: (pos: Position, index: number, isLast: boolean) => void) {
    var positions = this.room.findPath(
      new RoomPosition(pos1.x, pos1.y, this.room.name),
      new RoomPosition(pos2.x, pos2.y, this.room.name)
    );
    if (positions.length) {
      for (let stepIndex in positions) {
        let pos = positions[stepIndex];
        callback(pos, Number(stepIndex), Number(stepIndex) === positions.length - 1);
      }
    }
  }

}
