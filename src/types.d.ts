// memory extension samples

type PubSubEventTypes =
  | BUILD_CONTAINER_NEEDED
  | BUILD_ROAD_NEEDED
  | BUILD_EXTENSION
  | TOWER_REQUEST
  | SPAWN_REQUEST
  | ROOM_ATTACKED
  ;


type BUILD_CONTAINER_NEEDED = "BUILD_CONTAINER_NEEDED";
type BUILD_ROAD_NEEDED = "BUILD_ROAD_NEEDED";
type SPAWN_REQUEST = "SPAWN_REQUEST";
type BUILD_EXTENSION = "BUILD_EXTENSION";
type TOWER_REQUEST = "TOWER_REQUEST";
type ROOM_ATTACKED = "ROOM_ATTACKED";

interface CreepMemory {
  room: string;
  buildingSourceId: string | null;
  miningSourceId: string | null;
  working: boolean;
  repairingId?: string | null;
  _trav?: TravelData | {}
}

interface MiningSiteMemory {
  container?: string,
  container2?: string,
  nextContainerPos?: Position,
  nextContainerPos2?: Position,
  buildingContainer?: string,
  buildingContainer2?: string,
  avoid?: boolean,
  roads?: boolean,
  [object: string]: string[] | string | boolean | undefined | Position
}

interface TowerManagerMemory {
  towers?: string[],
  building?: string[]
  nextTowerPos?: Position, //architect store it here, id is avilable at next tick
  extraTower?: number // in case we want to manually increase the number of tower
  lastAttack?: number
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
  extensions?: number
  storage?: boolean
  towersManager: TowerManagerMemory
  defenseManager: RoomDefenseManagerMemory
  ctrlRoads?: boolean,
  fortressRoads?: boolean,
  [object: string]: string[] | string | boolean | number | undefined | TowerManagerMemory | RoomDefenseManagerMemory
}

interface RoomDefenseManagerMemory {
  defenseMode?: boolean
}

// `global` extension samples
declare namespace NodeJS {
  interface Global {
    log: any;
    empire?: any,
    pubSub?: any,
    mainRoom?: any
    memorySize: number
  }
}

interface Position {
  x: number;
  y: number;
}

// ////////////////////
// Traveler.ts
///////////////////////
interface PathfinderReturn {
  path: RoomPosition[];
  ops: number;
  cost: number;
  incomplete: boolean;
}

interface TravelToReturnData {
  nextPos?: RoomPosition;
  pathfinderReturn?: PathfinderReturn;
  state?: TravelState;
  path?: string;
}

interface TravelToOptions {
  ignoreRoads?: boolean;
  ignoreCreeps?: boolean;
  ignoreStructures?: boolean;
  preferHighway?: boolean;
  highwayBias?: number;
  allowHostile?: boolean;
  allowSK?: boolean;
  range?: number;
  obstacles?: { pos: RoomPosition }[];
  roomCallback?: (roomName: string, matrix: CostMatrix) => CostMatrix | boolean;
  routeCallback?: (roomName: string) => number;
  returnData?: TravelToReturnData;
  restrictDistance?: number;
  useFindRoute?: boolean;
  maxOps?: number;
  movingTarget?: boolean;
  freshMatrix?: boolean;
  offRoad?: boolean;
  stuckValue?: number;
  maxRooms?: number;
  repath?: number;
  route?: { [roomName: string]: boolean };
  ensurePath?: boolean;
}

interface TravelData {
  state: any[];
  path: string;
}

interface TravelState {
  stuckCount: number;
  lastCoord: Coord;
  destination: RoomPosition;
  cpu: number;
}

interface Creep {
  travelTo(destination: HasPos | RoomPosition, ops?: TravelToOptions): number;
}

type Coord = { x: number, y: number };
type HasPos = { pos: RoomPosition }
