import {Leancloud} from "@/services/Dao/implement/Leancloud";
import {Server, ServerData, ServerType} from "@/services/Dao/Server";


const Server_Key = "server";
const ServerType_Key = "serverType";
let ServerCache: Server | undefined;

export function getDefaultServer(): Server {
  return new Leancloud({
    server: {
      type: ServerType.Leancloud,
      data: {
        appId: "GLlqkrBuXK0WN4nTTB5aXPks-gzGzoHsz",
        appKey: "a9v85LWzGYhT03pWWKWhkh6m",
        serverURL: "https://gllqkrbu.lc-cn-n1-shared.com"
      }
    }
  })
}

export function getServerType(): ServerType {
  return <ServerType>localStorage.getItem(ServerType_Key) || ServerType.Base;
}


export function setServer({server}: { server: ServerData }) {
  localStorage.setItem(ServerType_Key, server.type);
  localStorage.setItem(`${Server_Key}_${server.type}`, JSON.stringify(server));
  ServerCache = undefined;
}

export function getServerKey({type}: { type: ServerType }) {
  return `${Server_Key}_${type}`
}

export function buildServer({server}: { server?: ServerData } = {}): Server | undefined {
  if (!server) return undefined;
  if (server.type === ServerType.Leancloud && server.data) return new Leancloud({server});
  return undefined;

}

export function getServerData({key}: { key?: ServerType } = {}): ServerData | undefined {
  const type = getServerType();
  const k = key && getServerKey({type: key}) || getServerKey({type});
  return JSON.parse(localStorage.getItem(k) || "null");
}

export function getServer({key}: { key?: ServerType } = {}): Server | undefined {
  if (ServerCache) return ServerCache;

  const server: ServerData | undefined = getServerData({key})
  ServerCache = buildServer({server});

  if (ServerCache === undefined && !key) ServerCache = getDefaultServer();

  return ServerCache;

}

export const Dao: Server = new Proxy(<Server>{}, {
  get(target, property) {
    return getServer()?.[property];
  }
});
