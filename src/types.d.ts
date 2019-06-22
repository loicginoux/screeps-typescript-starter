// example declaration file - remove these and add your own custom typings

// memory extension samples
interface CreepMemory {
  role: string;
  room: string;
  buildingSourceId: string | null;
  working: boolean;
}

interface Memory {
  uuid: number;
  log: any;
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
  areSourcesRoadsSetup: boolean | undefined;
  areControllerRoadsSetup: boolean | undefined;
  constructionsAreSetupAtLevel: number | undefined;
}
