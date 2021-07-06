import {Server, ServerData, ServerType} from "@/services/Dao/Server";
import {LeancloudDiary} from "@/services/Dao/implement/Leancloud/LeancloudDiary";
import {LeancloudGoal} from "@/services/Dao/implement/Leancloud/LeancloudGoal";
import AV from "leancloud-storage";
import {LeancloudUser} from "@/services/Dao/implement/Leancloud/LeancloudUser";
import {Objects} from "@/services/Dao/implement/Leancloud/Objects";

export class Leancloud extends Server {
  type: ServerType;
  data: { appKey: string, appId: string, serverURL: string };

  diary = new LeancloudDiary();
  goal = new LeancloudGoal();
  user = new LeancloudUser();

  constructor({server}: { server: ServerData }) {
    super();
    this.type = ServerType.Leancloud;
    this.data = server.data;
    AV.init(this.data);
  }

  async verify(): Promise<boolean> {
    try {
      // eslint-disable-next-line no-restricted-syntax
      for (const name of Object.keys(Objects)) {
        const hello = new AV.Object(name)
        // eslint-disable-next-line no-await-in-loop
        await hello.save()
        // eslint-disable-next-line no-await-in-loop
        await hello.destroy()
      }
    } catch (e) {
      return false
    }

    return true;
  }


}
