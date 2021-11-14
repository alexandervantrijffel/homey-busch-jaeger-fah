import Homey from "homey";
// import { Log } from "homey-log";

class BuschJaegerFAH extends Homey.App {
  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    // this.homeyLog = new Log({ homey: this.homey });
    this.log("The app has been initialized");
  }
}

module.exports = BuschJaegerFAH;
