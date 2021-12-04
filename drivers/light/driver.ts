import Homey from "homey";
import { getActiveSystemAccessPointSysApConnectionSettings } from "../system-access-point";
import { ListDevices, MapChannels } from "../../buschjaeger/localapiclient";

class Light extends Homey.Driver {
  async onInit() {
    this.log("Light has been initialized");
  }

  // session: Homey.Driver.PairSession;
  async onPair(session: any) {
    const _this = this;
    session.setHandler("showView", async function (viewId: string) {
      console.log("Switching to view: " + viewId);
    });

    session.setHandler("list_devices", async function () {
      try {
        const sysAp = getActiveSystemAccessPointSysApConnectionSettings(
          _this.homey
        );

        const devices = MapChannels(await ListDevices(sysAp));
        return devices
          .sort((d1, d2) => {
            return d1.name.toLowerCase().localeCompare(d2.name.toLowerCase());
          })
          .map((d) => ({
            name: d.name,
            data: { id: d.deviceId },
            store: {
              deviceId: d.deviceId,
              channelId: d.channel.channelId,
            },
          }));
      } catch (e: any) {
        console.log("pairing failed", { e });
        return [{ name: "pairing failed: " + e.data.message }];
      }
    });
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

module.exports = Light;
