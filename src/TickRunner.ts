import { Utils } from "utils/Utils";

export abstract class TickRunner {
  protected preCheckResult: number = OK;

  constructor() {

  }

  public run(): void {
    this.loadData();
    // pre check for all first
    if (this.preCheck() == OK) {
      // action for all
      this.act()
    }
    this.finalize()
  }

  employees(): TickRunner[] {
    return []
  }

  // load data from memory
  // instanciate employees
  // if overwritten, method should call super.loadData() so employees run the method too
  loadData(): void {
    // Utils.log('loadData for', this.constructor.name)
    _.each(this.employees(), employee => {
      // Utils.log('employee', employee.constructor.name)
      employee.loadData()
    });
  }

  // check for necessity before acting
  // if overwritten, method should call super.preCheck() so employees run the method too
  preCheck(): number {
    // Utils.log('preCheck for', this.constructor.name)
    _.each(this.employees(), employee => {
      // Utils.log('employee', employee.constructor.name)
      employee.preCheck()
    });
    return this.preCheckResult;
  }

  // do creep tasks
  // if overwritten, method should call super.act() so employees run the method too
  act(): void {
    // Utils.log('act for', this.constructor.name)
    _.each(this.employees(), employee => {
      if (employee.preCheckResult == OK) {
        employee.act()
      }
    });
  }

  // anything needed after task done
  // if overwritten, method should call super.finalize() so employees run the method too
  finalize(): void {
    _.each(this.employees(), employee => {
      employee.finalize()
    });
  }
}
