import { Readable } from "stream";
import axios, { AxiosResponse } from "axios";
import log from "../log";

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

export const ListDevices = async (
  conn: SysApConnection,
  search?: string
): Promise<Device[]> => {
  const requestUrl = `${conn.baseUrl}/${restApiRootUrl}/configuration`;

  const response = await axios
    .get(requestUrl, {
      headers: {
        Authorization: authHeader(conn),
      },
    })
    .then((res: AxiosResponse) => res.data)
    .catch((error) => {
      log.error(`Request failed`, { error });
    });

  const searchRegexp = search && new RegExp(search.trim(), "i");

  const sysApId = Object.keys(response)[0];
  const { devices } = response[sysApId];

  const mapped = Object.keys(devices)
    .map((deviceId) => {
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
    })
    .filter(
      (d) =>
        !searchRegexp ||
        d.deviceId.match(searchRegexp) ||
        d.name.match(searchRegexp) ||
        d.channels.some((ch) => ch.displayName.match(searchRegexp))
    );
  return mapped;
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
