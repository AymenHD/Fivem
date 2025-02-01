import { vector3, Vector3 } from '../../../[Framework]/arp-lib/global/shared/components/Vector3';

interface NodeConfig {
   prop: string;
   gather: number[];
   gatherItem: string;
   specialGather?: { name: string; amount: number[]; chance: number }[];
   label: string;
}

interface Quarry {
   coords: Vector3;
   radius: number;
   nodes: Array<keyof ConfigType['Nodes']>;
   spawns: number;
}

interface ConfigType {
   Quarrys: Quarry[];
   Nodes: Record<string, NodeConfig>;
   Smelters: Vector3[];
   SmeltingItems: string[];
   Exchange: any;
}

export const Config = {} as ConfigType;

Config.Quarrys = [
   {
      coords: new vector3(2973.96924, 2791.43726, 40.38391),
      radius: 60,
      nodes: ['stone', 'stone2', 'stone3'],
      spawns: 18,
   },
   {
      coords: new vector3(3026.29443, 2951.72314, 66.41687),
      radius: 31,
      nodes: ['stone', 'stone2', 'stone3'],
      spawns: 8,
   },
   {
      coords: new vector3(-613.02856, 2121.86377, 127.00879),
      radius: 25,
      nodes: ['stone', 'stone2', 'stone3'],
      spawns: 8,
   },
   {
      coords: new vector3(2558.12305, 6155.64404, 161.92163),
      radius: 25,
      nodes: ['stone', 'stone2', 'stone3'],
      spawns: 8,
   },
   {
      coords: new vector3(-484.94507, 1535.96045, 389.34351),
      radius: 50,
      nodes: ['stone', 'stone2', 'stone3'],
      spawns: 8,
   },
   {
      coords: new vector3(-71.26154, 3110.43945, 25.9436),
      radius: 30,
      nodes: ['stone2'],
      spawns: 5,
   },
];
Config.Nodes = {
   ['stone']: {
      label: 'Rock',
      prop: 'prop_rock_3_c',
      gather: [5, 10],
      specialGather: [
         {
            name: 'mat_copperore',
            amount: [2, 3],
            chance: 10,
         },
         {
            name: 'mat_silverore',
            amount: [2, 4],
            chance: 18,
         },
         {
            name: 'mat_goldnugget',
            amount: [1, 2],
            chance: 8,
         },
         {
            name: 'mat_uncutdiamond',
            amount: [1, 1],
            chance: 3,
         },
         {
            name: 'mat_uncutruby',
            amount: [1, 2],
            chance: 6,
         },
         {
            name: 'mat_uncutemerald',
            amount: [1, 2],
            chance: 2,
         },
         {
            name: 'mat_uncutsapphire',
            amount: [1, 2],
            chance: 4,
         },
      ],
      gatherItem: 'mat_stone',
   },
   ['stone2']: {
      label: 'Rock',
      prop: 'csx_rvrbldr_smld_',
      gather: [5, 10],
      gatherItem: 'mat_stone',
      specialGather: [
         {
            name: 'mat_sulfurore',
            amount: [2, 3],
            chance: 40,
         },
         {
            name: 'mat_silverore',
            amount: [2, 4],
            chance: 18,
         },
         {
            name: 'mat_copperore',
            amount: [2, 4],
            chance: 18,
         },
         {
            name: 'mat_uncutsapphire',
            amount: [1, 2],
            chance: 4,
         },
         {
            name: 'mat_uncutemerald',
            amount: [1, 2],
            chance: 2,
         },
      ],
   },
   ['stone3']: {
      label: 'Rock',
      prop: 'prop_rock_3_d',
      gather: [5, 10],
      gatherItem: 'mat_stone',
      specialGather: [
         {
            name: 'mat_sulfurore',
            amount: [2, 3],
            chance: 17,
         },
         {
            name: 'mat_silverore',
            amount: [2, 4],
            chance: 18,
         },
         {
            name: 'mat_silverore',
            amount: [2, 4],
            chance: 18,
         },
         {
            name: 'mat_uncutsapphire',
            amount: [1, 2],
            chance: 6,
         },
         {
            name: 'mat_uncutemerald',
            amount: [1, 2],
            chance: 2,
         },
         {
            name: 'mat_goldnugget',
            amount: [1, 2],
            chance: 15,
         },
      ],
   },
};

Config.Smelters = [new vector3(-466.858, 6288.033, 11.613), new vector3(-301.479, 2523.516, 72.43), new vector3(1107.697, -2011.469, 33.444), new vector3(1120.833, -1301.455, 33.1)];
Config.SmeltingItems = ['mat_sulfur', 'mat_ironingot', 'mat_silveringot', 'goldbar', 'mat_diamond', 'mat_emerald', 'mat_sapphire', 'mat_ruby'];

Config.Exchange = {
   ['mat_stone']: [
      // per item
      {
         item: 'mat_glass',
         amount: 1,
      },
      {
         item: 'mat_aluminum',
         amount: 1,
      },
      {
         item: 'mat_steel',
         amount: 1,
      },
      {
         item: 'mat_copper',
         amount: 1,
      },
   ],
};
