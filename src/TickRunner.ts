import { u } from "utils/Utils";

export abstract class TickRunner {
  protected preCheckResult: number = OK;

  constructor() {

  }

  public run(): void {
    try { this.loadData(); } catch (e) { console.log("error with runner loadData\n", e.stack); }

    // pre check for all first
    if (this.preCheck() == OK) {
      // action for all
      try { this.act() } catch (e) { console.log("error with runner act\n", e.stack); }
    } else {
      // console.log("preCheck NOT OK", this.constructor.name)
    }

    try { this.finalize() } catch (e) { console.log("error with runner finalize\n", e.stack); }
  }

  employees(): TickRunner[] {
    return []
  }

  // load data from memory
  // instanciate employees
  // if overwritten, method should call super.loadData() so employees run the method too
  loadData(): void {
    // console.log('loadData for', this.constructor.name)
    _.forEach(this.employees(), employee => {
      // console.log(this.constructor.name, 'employee loadData: ', employee.constructor.name)
      employee.loadData()
    });
  }

  // check for necessity before acting
  // if overwritten, method should call super.preCheck() so employees run the method too
  preCheck(): number {
    // console.log('preCheck for', this.constructor.name, this.employees().length)
    _.forEach(this.employees(), employee => {
      // console.log('employee precheck: ', employee)
      if (!employee) {
        return
      }
      let res = employee.preCheck()
    });
    return this.preCheckResult;
  }

  // do creep tasks
  // if overwritten, method should call super.act() so employees run the method too
  act(): void {
    // console.log('act for', this.constructor.name)
    _.forEach(this.employees(), employee => {
      // console.log(this.constructor.name, 'employee act ok: ', employee.preCheckResult == OK)
      if (employee.preCheckResult == OK) {
        // console.log(this.constructor.name, 'employee act: ', employee.constructor.name)
        employee.act()
      }
    });
  }

  // anything needed after task done
  // if overwritten, method should call super.finalize() so employees run the method too
  finalize(): void {
    // console.log('finalize for', this.constructor.name)

    _.forEach(this.employees(), employee => {
      // console.log(this.constructor.name, 'employee finalize: ', employee.constructor.name)
      employee.finalize()
    });
  }
}
