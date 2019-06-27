// example declaration file - remove these and add your own custom typings

// memory extension samples
interface CreepMemory {
  role: string;
  room: string;
  buildingSourceId: string | null;
  working: boolean;
}

interface miningSiteMemory {
  harvesters: string[],
  trucks: string[],
  containers: string[],
}
interface Memory {
  uuid: number;
  log: any;
  miningSites: {
    [key: string]: miningSiteMemory
  }
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

interface RoomMemory {
  avoid: any;
}
