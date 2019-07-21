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
    this.towers = []
    if (this.memory.towers) {
      this.towers = this.memory.towers
        .map(id => Game.getObjectById(id) as StructureTower)
        .filter(i => i)
      this.memory.towers = this.towers.map(t => t.id)
    }

    if (this.memory.building) {
      this.memory.building = this.memory.building
        .map(i => Game.getObjectById(i) as StructureTower)
        .filter(i => i)
        .map(i => i.id)
    }

    if (this.memory.nextTowerPos) {
      const constructionSites = this.room.lookForAt(LOOK_CONSTRUCTION_SITES, this.memory.nextTowerPos.x, this.memory.nextTowerPos.y);
      if (constructionSites.length > 0) {
        if (!this.memory.building) { this.memory.building = [] }
        this.memory.building.push(constructionSites[0].id)
        delete (this.memory.nextTowerPos);
      }
    }
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
      global.pubSub.publish('TOWER_REQUEST', {
        roomName: this.room.name,
        priority: 10,
      })
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
    if (tower) {
      var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      if (closestHostile) {
        var username = closestHostile.owner.username;
        Game.notify(`User ${username} spotted in room ${this.room.name}`);
        tower.attack(closestHostile);
      }

      var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => {
          let res;
          if (structure.structureType == STRUCTURE_WALL) {
            // limit wall strength to 5000
            res = (structure.hits < structure.hitsMax && structure.hits < 5000)
          } else if (structure.structureType == STRUCTURE_ROAD) {
            // do not repair roads, leave it to builders
            res = false
          } else {
            res = structure.hits < structure.hitsMax
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
