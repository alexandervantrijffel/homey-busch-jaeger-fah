import { Readable } from "stream";
import axios, { AxiosResponse } from "axios";
import log from "../log";
import util from "util";

export interface SysApConnection {
  baseUrl: string;
  user: string;
  password: string;
}

const authHeader = (conn: SysApConnection) =>
  `Basic ${Buffer.from(`${conn.user}:${conn.password}`).toString("base64")}`;

export interface DatapointRequest {
  sysapUUID: string;
  deviceId: string;
  channel: string;
  datapoint: string;
}

export interface Input {
  inputId: string;
  value: string;
}

export interface Channel {
  channelId: string;
  displayName: string;
  inputs: Input[];
}

export interface Device {
  deviceId: string;
  name: string;
  channels: Channel[];
}

const restApiRootUrl = "fhapi/v1/api/rest";

export const ListDevices = async (conn: SysApConnection): Promise<Device[]> => {
  const axiosOptions = {
    baseURL: `${conn.baseUrl}/${restApiRootUrl}`,
    timeout: 10000,
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json;charset=utf-8",
      Authorization: authHeader(conn),
    },
  };
  const axiosInstance = axios.create(axiosOptions);

  const response = await axiosInstance.get("/configuration");
  const sysApId = Object.keys(response.data)[0];
  const { devices } = response.data[sysApId];

  const mapped = Object.keys(devices).map((deviceId) => {
    const device = devices[deviceId];
    return {
      deviceId,
      name: device.displayName,
      channels: Object.keys(device.channels).map((channelId) => {
        const channel = device.channels[channelId];
        return {
          channelId,
          displayName: channel.displayName,
          inputs: Object.keys(channel.inputs).map((inputId) => {
            const input = channel.inputs[inputId];
            return { inputId, value: String(input.value) };
          }),
        };
      }),
    };
  });
  return mapped;
};

interface ChannelInput extends Omit<Device, "channels"> {
  channel: Channel;
}

export const MapChannels = (devices: Device[]): ChannelInput[] => {
  return devices.flatMap((d) => {
    return d.channels.map((c) => {
      return {
        name: d.name + (c.displayName === d.name ? "" : ` - ${c.displayName}`),
        deviceId: d.deviceId,
        channel: c,
      };
    });
  });
};

export const Search = (
  channels: ChannelInput[],
  search?: string
): ChannelInput[] => {
  console.log("filtering", search);
  if (!search) return channels;
  const searchRegexp = new RegExp(search.trim(), "i");
  return channels.filter(
    (c) =>
      !searchRegexp ||
      c.deviceId.match(searchRegexp) ||
      c.name.match(searchRegexp) ||
      c.channel.displayName.match(searchRegexp)
  );
};

export const SetDatapoint = async (
  conn: SysApConnection,
  request: DatapointRequest,
  value: string | Buffer | ArrayBuffer | Readable
) => {
  const requestUrl = `${conn.baseUrl}/${restApiRootUrl}/datapoint/${request.sysapUUID}/${request.deviceId}.${request.channel}.${request.datapoint}`;

  log.debug(`Setting datapoint`, {
    device: request.deviceId,
    channel: request.channel,
    datapoint: request.datapoint,
    value,
  });
  const response = await axios
    .put(requestUrl, value, {
      headers: {
        Authorization: authHeader(conn),
      },
    })
    .then((res: AxiosResponse) => res.data)
    .catch((error) => {
      log.error(`Request failed`, { error });
    });

  log.debug("Response", { response });
};
