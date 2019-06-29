export class Utils {
  static log(...args: any[]): void {
    if (Memory.debug > 0) {
      _.map(args, (arg, i) => {
        console.log('arg:', i, JSON.stringify(arg))
      })

    }
  }
}
