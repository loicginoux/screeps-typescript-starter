import { TickRunner } from "TickRunner";

export class TowersManager extends TickRunner {
  memory: TowerManagerMemory;
  towers: StructureTower[];

  constructor(private room: Room) {
    super()
    this.initMemory()
  }

  initMemory() {
    if (!Memory.rooms[this.room.name].towersManager) {
      Memory.rooms[this.room.name].towersManager = {}
    }
    this.memory = Memory.rooms[this.room.name].towersManager;
  }

  loadData() {
    this.loadTowers();
    // this.updateStructuresToRepair();
    // this.updateEnemiesToAttack();
    // this.updateCreepsToHeal();
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
      const look = this.room.lookAt(this.memory.nextTowerPos.x, this.memory.nextTowerPos.y);
      _.forEach(look, (lookObject) => {
        if (lookObject.type == LOOK_CONSTRUCTION_SITES) {
          if (!this.memory.building) { this.memory.building = [] }
          this.memory.building.push(lookObject.constructionSite!.id)
          delete (this.memory.nextTowerPos);
        }
      });
    }
    return this.towers;
  }

  updateStructuresToRepair() {
    this.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.hits < structure.hitsMax
      }
    })[0]
  }

  updateEnemiesToAttack() {

  }

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
      var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => structure.hits < structure.hitsMax
      });

      if (closestDamagedStructure) {
        tower.repair(closestDamagedStructure);
      }

      var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      if (closestHostile) {
        tower.attack(closestHostile);
      }
    }
  }
}
