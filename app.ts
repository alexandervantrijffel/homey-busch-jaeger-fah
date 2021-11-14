import Homey from "homey";
// import { Log } from "homey-log";
import { SetDatapoint } from "./buschjaeger/localapiclient";

const registerActions = (app: BuschJaegerFAH) => {
  const stopRainingAction = app.homey.flow.getActionCard("set-datapoint");
  stopRainingAction.registerRunListener(async (args, state) => {
    console.log("running set-datapoint with args and state", { args, state });
    const sysap = "00000000-0000-0000-0000-000000000000";
    const conn = {
      baseUrl: "",
      user: "",
      password: "",
    };
    const missing = [
      ...(args["device-serial"] ? [] : ["Device serial"]),
      ...(args["device-serial"] ? [] : ["Device serial"]),
      ...(args.channel ? [] : ["Channel"]),
      ...(args.datapoint ? [] : ["Datapoint"]),
    ].flat();
    if (missing.length) {
      throw new Error(
        "One or more required arguments are missing: " + missing.join(", ")
      );
    }

    // const deviceid = "ABB700D5D898";
    // const channel = "ch0006";
    // const datapoint = "idp0000";
    const deviceid = args["device-serial"];
    const channel = args.channel;
    const datapoint = args.datapoint;
    await SetDatapoint(
      conn,
      { sysapUUID: sysap, deviceId: deviceid, channel, datapoint },
      String(args.value)
    );
  });
};

class BuschJaegerFAH extends Homey.App {
  async onInit() {
    // this.homeyLog = new Log({ homey: this.homey });
    registerActions(this);
    this.log("The app has been initialized");
  }
}

module.exports = BuschJaegerFAH;
