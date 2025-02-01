import { getRandomInt, Wait } from '../../../[Framework]/arp-lib/global/shared/components/utils';
import { RPC } from '../../../[Framework]/arp-lib/rpc/client/components/rpc';
import { ActiveObject } from '../../../[Framework]/arp-lib/util/shared/components/utils';
import { Vector3, vector3 } from '../../../[Framework]/arp-lib/global/shared/components/Vector3';
import { DeleteEntityObject, LoadModel } from '../../../[Framework]/arp-lib/util/client/components/utils';
import { emitNetEvent } from '../../../[Framework]/arp-lib/global/client/components/utils';
interface NodeConfig {
   prop: string;
   gather: number;
   gatherItem: string;
}

interface Quarry {
   coords: Vector3;
   radius: number;
   nodes: Array<keyof ConfigType['Nodes']>;
}

interface ConfigType {
   Quarrys: Quarry[];
   Nodes: Record<string, NodeConfig>;
   Smelters: Vector3[];
}

let Config = {} as ConfigType;
let GeneratedPool = [] as any;
const SpawnedObjects = [] as any;
let inZone = false;

const Intilize = async () => {
   [Config, GeneratedPool] = await RPC.Execute('arp-minings:getconfig');
   if (ActiveObject(Config)) {
      Config.Quarrys.forEach((item, index) => {
         global.exports['arp-polyzone'].AddCircleZone(`quarry-${index}`, new vector3(item.coords.x, item.coords.y, item.coords.z), item.radius + 40.0, {
            useZ: true,
            // debugPoly: true,
            data: {
               index: index,
            },
         });
      });
      Config.Smelters.forEach((coords, index) => {
         global.exports['arp-polytarget'].AddCircleZone(`smelter-${index}`, new vector3(coords.x, coords.y, coords.z), 3.0, {
            useZ: true,
            // debugPoly: true,
            data: {
               index: index,
            },
         });
         global.exports['arp-interact'].AddPeekEntryByPolyTarget(
            `smelter-${index}`,
            [
               {
                  event: 'arp-mining:smelter',
                  label: 'Smelting',
                  icon: 'fireplace',
                  id: `smelter-${index}`,
                  parameters: {},
               },
            ],
            {
               distance: { radius: 2.5 },
               isEnabled: async () => {
                  return await IsNearFurnace();
               },
            }
         );
      });
      global.exports['arp-interact'].AddPeekEntryByPolyTarget(
         'mine-object',
         [
            {
               event: 'arp-mining:mine',
               id: 'mining:mine',
               icon: 'pickaxe',
               label: 'Mine Rock',
               parameters: [],
            },
         ],
         {
            distance: { radius: 1.5 },
            isEnabled: (_entity: number, context: any) => {
               let index: number;
               let quarry: number;
               try {
                  index = context.zones['mine-object'].index;
                  quarry = context.zones['mine-object'].quarry;
               } catch {
                  return false;
               }
               if (!GeneratedPool[quarry].locations[index].mined && inZone) {
                  return true;
               }
               return true;
            },
         }
      );
   }
};

export const QuarryEntered = async (zone: string, data: any) => {
   if (!zone.includes('quarry')) return;
   const index = data.index;
   if (index == undefined || index < 0) return false;
   inZone = true;
   const pool = GeneratedPool[index];
   if (pool && pool.locations) {
      pool.locations.forEach(async (item: any, Lindex: number) => {
         if (item.mined) return;
         await LoadModel(item.prop);
         const [_, groundZ] = GetGroundZFor_3dCoord(item.coords.x, item.coords.y, item.coords.z + 1000, false);
         const object = CreateObjectNoOffset(item.prop, item.coords.x, item.coords.y, groundZ, false, false, false);
         FreezeEntityPosition(object, true);
         SetModelAsNoLongerNeeded(item.prop);
         SpawnedObjects.push(object);
         global.exports['arp-polytarget'].EntityZone('mine-object', object, {
            useZ: true,
            // debugPoly: true,
            scale: [2.0, 2.0, 3.0],
            data: {
               index: Lindex,
               quarry: index,
               prop: item.prop,
            },
         });
      });
   }
};
export const QuarryLeft = async (zone: string, data: any) => {
   if (!zone.includes('quarry')) return;
   if (inZone) {
      ClearAllObjects();
      inZone = false;
   }
};
export const Mine = async (_a: any, entity: number, options: any) => {
   const index = options.zones['mine-object'].index;
   const quarry = options.zones['mine-object'].quarry;
   if (index < 0 || quarry < 0 || GeneratedPool[quarry].locations[index].mined) return false;
   const item = await global.exports['arp-inventory'].GetValidItemByName('jackhammer');
   if (!item) return emit('ShortText', 'You need something to mine this node with', 3);
   const ped = PlayerPedId();
   const time = getRandomInt(15000, 20000);
   const node = GeneratedPool[quarry].locations[index];
   TaskStartScenarioInPlace(ped, 'WORLD_HUMAN_CONST_DRILL', 0, true);
   const mining = await global.exports['arp-taskbar'].TaskBar(`Mining ${node.label}`, time, true);
   if (mining == 100) {
      await RPC.Execute('arp-mining:mine', quarry, index);
   }
   ClearPedTasks(ped);
   const coords = new vector3(GetEntityCoords(ped, false));
   const jacky = GetClosestObjectOfType(coords.x, coords.y, coords.z, 3.0, GetHashKey('prop_tool_jackham'), false, false, false);
   if (DoesEntityExist(jacky)) {
      DeleteEntityObject(jacky);
   }
};
export const ClearAllObjects = async () => {
   for (const object of SpawnedObjects) {
      DeleteEntity(object);
   }
};
export const RefreshPool = async (pool: any) => {
   GeneratedPool = pool;
};
export const RemoveNodeObject = async (prop: string, coords: Vector3) => {
   if (!inZone) return;
   const node = GetClosestObjectOfType(coords.x, coords.y, coords.z, 3.0, GetHashKey(prop), false, false, false);
   if (DoesEntityExist(node)) {
      DeleteEntityObject(node);
   }
};
export const IsNearFurnace = async () => {
   return Config.Smelters.some((coords) => {
      const plyCoords = new vector3(GetEntityCoords(PlayerPedId(), false));
      const dist = plyCoords.distance(new vector3(coords.x, coords.y, coords.z));
      return dist < 5;
   });
};

export const OpenFurnace = async () => {
   if (!(await IsNearFurnace())) return;
   emitNetEvent('arp-mining:OpenFurnace');
};
export const OpenExchange = async () => {
   global.exports['arp-inventory'].PrepareInventory('stone-exchange', LocalPlayer.state.cid);
};
export const Exchange = async () => {
   const negotiating = await global.exports['arp-taskbar'].TaskBar(`Negotiating...`, 5000, true);
   if (negotiating == 100) {
      RPC.Execute('arp-mining:Exchange');
   }
};
on('onResourceStop', async (resource: string) => {
   if (resource != GetCurrentResourceName()) return;
   ClearAllObjects();
});
setTimeout(async () => {
   await Intilize();
}, 1000);
