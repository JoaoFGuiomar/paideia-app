import { IComment } from "@components/dao/discussion/Comments";
import { AppApi } from "@lib/AppApi";
import { AbstractApi } from "@lib/utilities";
import { IDiscussion } from "@pages/[dao]/discussion/create";

type FollowDirection = "follow" | "unfollow";

interface IFollowPut {
  current_user_details_id: number;
  user_details_id: number;
  type: FollowDirection;
}

export default class FollowApi extends AbstractApi {
  api: AppApi;
  putUrl: string;

  constructor(api: AppApi, putUrl: string) {
    super();
    this.api = api;
    this.putUrl = putUrl;
    this.setAlert = api.setAlert;
  }

  followData(
    type: FollowDirection,
    user_details_id: number = undefined
  ): IFollowPut {
    const [daoUserData] = this.api.daoUserState;

    return {
      current_user_details_id: daoUserData.id,
      user_details_id:
        user_details_id === undefined ? daoUserData.id : user_details_id,
      type: type,
    };
  }

  follow(
    type: FollowDirection,
    user_details_id: number = undefined
  ): Promise<any> | void {
    let data = this.followData(type, user_details_id);
    return this.put(this.putUrl, data, "Followed proposal");
  }
}
