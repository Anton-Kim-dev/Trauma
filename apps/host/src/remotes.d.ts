declare module "reduxApp/ReduxRemoteApp" {
  import type { ComponentType } from "react";

  const ReduxRemoteApp: ComponentType<{
    session: {
      accessToken: string;
      refreshToken: string;
      user: {
        user_id: string;
        user_name: string;
        user_role: "P" | "D" | "A";
      };
    } | null;
  }>;

  export default ReduxRemoteApp;
}

declare module "mobxApp/MobxRemoteApp" {
  import type { ComponentType } from "react";

  const MobxRemoteApp: ComponentType<{
    session: {
      accessToken: string;
      refreshToken: string;
      user: {
        user_id: string;
        user_name: string;
        user_role: "P" | "D" | "A";
      };
    } | null;
  }>;

  export default MobxRemoteApp;
}
