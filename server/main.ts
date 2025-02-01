import { ActiveObject } from '../../../[Framework]/arp-lib/util/shared/components/utils';
import { RPC } from '../../../[Framework]/arp-lib/rpc/server/components/rpc';
import { Config } from './config';
import { emitNetEvent } from '../../../[Framework]/arp-lib/global/server/components/utils';
import { vector3, Vector3 } from '../../../[Framework]/arp-lib/global/shared/components/Vector3';
import { getRandomInt, Wait } from '../../../[Framework]/arp-lib/global/shared/components/utils';
const Mongo = global.exports['mongodb'];

const GeneratedPool = [] as any;

const GenerateNodesPool = async () => {
   Config.Quarrys.forEach((item) => {
      const locations = [];
      let pool = {};
      for (let index = 0; index < item.spawns; index++) {
         const center = item.coords;
         const z = center.z;
         const angle = Math.random() * 2 * Math.PI;
         const distance = Math.sqrt(Math.random()) * item.radius;
         const x = center.x + distance * Math.cos(angle);
         const y = center.y + distance * Math.sin(angle);
         const randomMat = item.nodes[getRandomInt(0, Object.entries(item.nodes).length - 1)];
         if (!randomMat) continue;
         const nodeConfig = Config.Nodes[randomMat];
         locations.push({
            coords: new vector3(x, y, z),
            prop: nodeConfig.prop,
            type: randomMat,
            mined: false,
            label: nodeConfig.label,
         });
      }
      pool = {
         ...item,
         locations: locations,
         cooldown: null,
      };
      GeneratedPool.push(pool);
   });
};
const GenerateSingleNodePool = async (quarryIndex: number) => {
   const item = Config.Quarrys[quarryIndex];
   const locations = [];

   for (let index = 0; index < item.spawns; index++) {
      const center = item.coords;
      const z = center.z;
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.sqrt(Math.random()) * item.radius;
      const x = center.x + distance * Math.cos(angle);
      const y = center.y + distance * Math.sin(angle);
      const randomMat = item.nodes[getRandomInt(0, Object.entries(item.nodes).length - 1)];
      if (!randomMat) continue;
      const nodeConfig = Config.Nodes[randomMat];
      locations.push({
         coords: new vector3(x, y, z),
         prop: nodeConfig.prop,
         type: randomMat,
         mined: false,
         label: nodeConfig.label,
      });
   }

   GeneratedPool[quarryIndex] = {
      ...item,
      locations: locations,
      cooldown: null,
   };
};

RPC.Register('arp-minings:getconfig', () => {
   return [Config, GeneratedPool];
});
RPC.Register('arp-mining:mine', async (src: any, quarry: number, index: number) => {
   if (quarry < 0 || index < 0 || !GeneratedPool[quarry] || !GeneratedPool[quarry].locations) return false;
   if (GeneratedPool[quarry].locations[index].mined) return emitNetEvent('LongText', src, 'Already Mined', 3);
   const node = GeneratedPool[quarry].locations[index];
   const nodeConfig = Config.Nodes[node.type];
   node.mined = true;
   emitNetEvent('arp-mining:refresh', '-1', GeneratedPool);
   emitNetEvent('arp-mining:removenodeobject', '-1', node.prop, node.coords);
   await RPC.Execute('inventory:addItem', src, nodeConfig.gatherItem, getRandomInt(nodeConfig.gather[0], nodeConfig.gather[1]));
   if (nodeConfig.specialGather) {
      nodeConfig.specialGather.forEach(async (item) => {
         const chance = getRandomInt(0, 100);
         if (chance <= item.chance) {
            await RPC.Execute('inventory:addItem', src, item.name, getRandomInt(item.amount[0], item.amount[1]));
         }
      });
   }
   await global.exports['arp-reputations'].AdjustRep(Player(src).state.cid, 'mining', getRandomInt(5, 7));
   const allMined = GeneratedPool[quarry].locations.every((location) => location.mined);
   if (allMined) {
      GeneratedPool[quarry].cooldown = Date.now() + 30 * 60 * 1000;
   }
   return true;
});
onNet('arp-mining:OpenFurnace', async () => {
   const src = String(source);
   const itemList = await global.exports['arp-inventory'].GetItemList();
   const menu = [] as any;
   for (const item of Config.SmeltingItems as any) {
      if (!itemList[item] || !itemList[item].displayName) {
         continue;
      }
      menu.push({
         id: Object.entries(menu).length + 1,
         itemName: itemList[item].displayName,
         name: itemList[item].name,
         noStack: itemList[item].noStack || false,
         event: 'crafting:item',
         craftReq: itemList[item].craft,
         args: [item],
      });
   }
   emitNet('inventory:SetCraftingItems', src, menu);
});
RPC.Register('arp-mining:Exchange', async (src: any) => {
   const cid = Player(src).state.cid;
   if (cid) {
      const query = await global.exports['arp-inventory'].FetchInventory(`stone-exchange-${cid}`);
      if (ActiveObject(query)) {
         const inventory = global.exports['arp-inventory'].PrepareItems2(query);
         const ids = [];
         for (const item of inventory) {
            if (Config.Exchange[item.name]) {
               const exchange = Config.Exchange[item.name];
               const deleted = await Mongo.find({
                  collection: 'inventories',
                  query: { ['inventory']: `stone-exchange-${cid}`, ['name']: item.name },
                  select: { _id: 1 },
                  limit: item.amount,
               });
               for (const _delete of deleted) {
                  ids.push(_delete._id);
               }
               for (const exchange_item of exchange) {
                  await RPC.Execute('inventory:addItem', src, exchange_item.item, exchange_item.amount * item.amount);
               }
            }
         }
         await Mongo.delete({ collection: 'inventories', query: { _id: { ['$in']: ids } } });
      } else {
         emitNetEvent('LongText', src, 'You dont have anything to trade', 3);
      }
   }
});
setTimeout(async () => {
   await GenerateNodesPool();
}, 200);

setInterval(async () => {
   GeneratedPool.forEach(async (pool: any, index: number) => {
      if (pool.cooldown && pool.cooldown > Date.now()) {
         return;
      }

      const allMined = pool.locations.every((location) => location.mined);

      if (allMined) {
         pool.locations.forEach((location: any) => {
            location.mined = false;
         });
         pool.cooldown = null;
         await GenerateSingleNodePool(index);
         await Wait(100);
         emitNetEvent('arp-mining:refresh', '-1', GeneratedPool);
      }
   });
}, 1000);
