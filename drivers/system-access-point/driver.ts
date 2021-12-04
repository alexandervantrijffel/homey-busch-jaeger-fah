import Homey from "homey";
import { v4 as uuidv4 } from "uuid";

class SystemAccessPoint extends Homey.Driver {
  async onInit() {
    // this.homey.flow
    //   .getActionCard("set_datapoint")
    //   .registerRunListener((args) => {
    //     args.device.setDatapoint(args);
    //     return Promise.resolve();
    //   });
  }

  //session: Homey.Driver.PairSession
  async onPair(session: any) {
    session.showView("start");

    session.setHandler("get_create_device_object", async function (data: any) {
      console.log("get_create_device_object", data);
      return {
        // The name of the device that will be shown to the user
        name: "SysAP " + data.hostname,

        // The data object is required and should contain only unique properties for the device.
        // So a MAC address is good, but an IP address is bad (can change over time)
        data: {
          id: uuidv4(),
        },

        settings: {
          hostname: data.hostname,
          username: data.username,
          password: data.password,
        },
      };
    });

    // session.setHandler("showView", async function (viewId: string) {
    //   console.log("Switching to view: " + viewId);
    // });

    //
    // driver capabilities
    //
    //  "capabilities": [
    //    "button",
    //    "alarm_motion",
    //    "target_temperature",
    //    "thermostat_mode"
    //  ],
  }
}

module.exports = SystemAccessPoint;
