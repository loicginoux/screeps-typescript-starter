class Utils {
  static log(...args: any[]): void {
    if (Memory.debug > 0) {
      _.map(args, (arg, i) => {
        console.log('arg:', i, JSON.stringify(arg))
      })

    }
  }

  static capitalizeFirstLetter(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  static every(freq: number): boolean {
    return Game.time % freq === 0
  }

  static compareValues(v1: number, v2: number): number {
    return (v1 > v2)
      ? 1
      : (v1 < v2 ? -1 : 0);
  };

  static isSourceKeeperRoom(roomName: string): boolean {
    let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
    let isSK = false
    if (parsed) {
      let fMod = parseInt(parsed[1]) % 10;
      let sMod = parseInt(parsed[2]) % 10;
      let isSK =
        !(fMod === 5 && sMod === 5) &&
        (fMod >= 4 && fMod <= 6) &&
        (sMod >= 4 && sMod <= 6);
    }
    return isSK
  }

  static resetMemory() {
    RawMemory.set('{}');
    Memory.creeps = {};
    Memory.rooms = {};
    Memory.flags = {};
    Memory.spawns = {};
  }
}

export const u = Utils;
