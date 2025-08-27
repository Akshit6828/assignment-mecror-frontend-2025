import { config } from "./config";

export function updateConfig(appConfig: Partial<typeof config>) {
  Object.assign(config, appConfig);
}
