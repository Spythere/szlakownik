import { IRouteConnectionData } from "../ts/interfaces/IRouteConnectionInfo";
import { ISceneryData } from "../ts/interfaces/ISceneryData";

export function getSceneryName(sceneries: ISceneryData[], hash: string) {
  return sceneries.find((sc) => sc.hash == hash)?.name;
}

export function getRouteData(
  sceneries: ISceneryData[],
  routeName: string,
  sceneryHash: string
): IRouteConnectionData | undefined {
  const data = sceneries
    .find((sc) => sc.hash === sceneryHash)
    ?.routes.split(';')
    .find((route) => route.split('_')[0] == routeName);

  if (!data) return undefined;

  const [route, vMax, length] = data.split(':');

  return {
    trackCount: Number(route.split('_')[1][0]) || 0,
    vMax: Number(vMax) || 0,
    length: Number(length) || 0,
  };
}
