import { TickRunner } from "TickRunner";

export class TowersManager extends TickRunner {
  memory: TowerManagerMemory;
  towers: StructureTower[];

  constructor(private room: Room) {
    super()

  }

  loadData() {
    this.initMemory()
    this.loadTowers();
    this.updateStructuresToRepair();
    this.updateEnemiesToAttack();
    this.updateCreepsToHeal();
    super.loadData();
  }

  initMemory() {
    if (!Memory.rooms[this.room.name].towersManager) {
      Memory.rooms[this.room.name].towersManager = {}
    }
    this.memory = Memory.rooms[this.room.name].towersManager;
  }

  loadTowers(): StructureTower[] {
    this.towers = this.room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_TOWER }) as StructureTower[];

    // if (this.memory.nextTowerPos) {
    //   const constructionSites = this.room.lookForAt(LOOK_CONSTRUCTION_SITES, this.memory.nextTowerPos.x, this.memory.nextTowerPos.y);
    //   if (constructionSites.length > 0) {
    //     if (!this.memory.building) { this.memory.building = [] }
    //     this.memory.building.push(constructionSites[0].id)
    //     delete (this.memory.nextTowerPos);
    //   }
    // }
    return this.towers;
  }

  // cache structures to repair
  updateStructuresToRepair() {
    this.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.hits < structure.hitsMax
      }
    })[0]
  }

  // cache enemies to attack
  updateEnemiesToAttack() {
  }

  // cache creep to heal
  updateCreepsToHeal() {

  }

  preCheck(): number {
    const missingTowers = this.optimalTowerNumber() - this.towers.length;
    if (missingTowers) {
      let firstSpawner = this.room.find(FIND_MY_STRUCTURES, { filter: i => i.structureType === STRUCTURE_SPAWN }) as StructureSpawn[];
      if (firstSpawner[0]) {
        global.pubSub.publish('TOWER_REQUEST', {
          roomName: this.room.name,
          near: firstSpawner[0].pos,
          priority: 10,
        })
      }
    }
    return OK;
  }

  // number of twoer needed
  // 1 at level 3,
  // 2 at level 5
  // use extraTower key from memory to add manually more tower
  optimalTowerNumber(): number {
    let needed = 0
    if (this.room.controller) {
      if (this.room.controller.level > 4) {
        needed = 2
      } else if (this.room.controller.level > 2) {
        needed = 1
      }
    }
    if (this.memory.extraTower) {
      needed += this.memory.extraTower
    }
    return needed;
  }

  act() {
    this.towers.forEach(t => {
      this.singleTowerRun(t)
    })
  }

  singleTowerRun(tower: StructureTower) {
    var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
      // keep track for replay
      this.memory.lastAttack = Game.time

      // if (closestHostile.owner) {
      //   var username = closestHostile.owner.username;
      //   if (username && username != "Invader") {
      //     Game.notify(`User ${username} spotted in room ${this.room.name}`);
      //   }
      // }
      tower.attack(closestHostile);
      global.pubSub.publish('ROOM_ATTACKED', {
        room: this.room.name,
        priority: 100,
      })
    } else {
      var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => {
          let res;
          if (structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART) {
            // limit wall strength to 5000
            res = structure.hits < 5000
            // } else if (structure.structureType == STRUCTURE_ROAD) {
            //   // do not repair roads, leave it to builders
            //   res = false
          } else {
            // only help builders when it starts being really deprecataed
            res = structure.hits < (structure.hitsMax / 10)
          }
          return res
        }
      });

      if (closestDamagedStructure) {
        tower.repair(closestDamagedStructure);
      }
    }


  }
}
