// memory extension samples

type PubSubEventTypes =
  | BUILD_CONTAINER_NEEDED
  | BUILD_ROAD_NEEDED
  | SPAWN_REQUEST
  | TOWER_REQUEST
  ;


type BUILD_CONTAINER_NEEDED = "BUILD_CONTAINER_NEEDED";
type BUILD_ROAD_NEEDED = "BUILD_ROAD_NEEDED";
type SPAWN_REQUEST = "SPAWN_REQUEST";
type TOWER_REQUEST = "TOWER_REQUEST";

interface CreepMemory {
  room: string;
  buildingSourceId: string | null;
  miningSourceId: string | null;
  working: boolean;
}

interface MiningSiteMemory {
  container?: string,
  nextContainerPos?: Position,
  buildingContainer?: string,
  avoid?: boolean,
  roads?: boolean,
  [object: string]: string[] | string | boolean | undefined | Position
}

interface TowerManagerMemory {
  towers?: string[],
  building?: string[]
  nextTowerPos?: Position, //architect store it here, id is avilable at next tick
  extraTower?: number // in case we want to manually increase the number of tower
}

interface Memory {
  uuid: number;
  log: any;
  debug: number; // show debug console logs
  miningSites: {
    [miningSourceId: string]: MiningSiteMemory
  }
}

interface RoomMemory {
  avoid?: boolean;
  minUpgraders?: number
  towersManager: TowerManagerMemory
  ctrlRoads?: boolean,
  [object: string]: string[] | string | boolean | number | undefined | TowerManagerMemory
}


// `global` extension samples
declare namespace NodeJS {
  interface Global {
    log: any;
    empire?: any,
    pubSub?: any,
    mainRoom?: any
  }
}

interface Position {
  x: number;
  y: number;
}
