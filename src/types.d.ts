// memory extension samples

type PubSubEventTypes =
  | BUILD_CONTAINER_NEEDED
  | BUILD_ROAD_NEEDED
  | SPAWN_REQUEST
  ;


type BUILD_CONTAINER_NEEDED = "BUILD_CONTAINER_NEEDED";
type BUILD_ROAD_NEEDED = "BUILD_ROAD_NEEDED";
type SPAWN_REQUEST = "SPAWN_REQUEST";


interface CreepMemory {
  room: string;
  buildingSourceId: string | null;
  miningSourceId: string | null;
  working: boolean;
}

interface MiningSiteMemory {
  harvesters: string[],
  trucks: string[],
  containers: string[]
  buildingContainers: number
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
  avoid: any;
}


// `global` extension samples
declare namespace NodeJS {
  interface Global {
    log: any;
  }
}

interface Position {
  x: number;
  y: number;
}
