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
}

export const u = Utils;
