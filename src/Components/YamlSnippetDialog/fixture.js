import { Feature } from 'ol';
import { LineString } from 'ol/geom';

const routes = [
  new Feature({
    geometry: new LineString([
      [844997.3338080316, 6031790.6950933505],
      [845447.7881275266, 6031566.273747988],
      [845492.5274308764, 6031537.281468273],
      [845540.5506592047, 6031512.840953051],
      [845566.2988574251, 6031504.529214636],
      [845606.0510475874, 6031488.779811579],
      [845659.0502571542, 6031465.427869904],
      [845790.106693665, 6031412.144120529],
      [845842.6606252685, 6031394.234521783],
      [845876.0564725065, 6031385.6095625125],
      [845910.4319312635, 6031378.666723923],
      [845973.0491448347, 6031370.998274477],
      [846010.263250607, 6031369.8933586655],
      [846048.6350790834, 6031370.553009878],
      [846087.0736992543, 6031373.702845115],
      [846125.8128820504, 6031378.897602077],
      [846163.3164184986, 6031386.862902138],
      [846199.717891988, 6031396.790677713],
      [846233.9263715086, 6031408.417073903],
      [846267.4001423902, 6031422.533683771],
      [846304.3804772317, 6031440.65772953],
      [846341.5389232585, 6031461.436937029],
      [846494.5698272522, 6031551.711629468],
      [846527.7764313557, 6031569.143296323],
      [846573.1725197012, 6031590.318613456],
      [846608.9617359913, 6031604.798338375],
      [846698.0841203203, 6031632.3560595205],
      [846790.390242086, 6031652.29464503],
      [846836.4876432237, 6031659.138752392],
      [846883.0525862225, 6031663.871909332],
      [846928.2149036373, 6031666.461128683],
      [847019.1517956662, 6031666.873424829],
      [847127.7884867316, 6031664.185254306],
      [847197.0626058523, 6031666.873424829],
      [847222.4657136512, 6031670.188286563],
      [847283.6691696892, 6031683.167384295],
      [847350.2159612856, 6031704.046126226],
      [847414.5252311168, 6031733.913039833],
      [847474.326061571, 6031769.766666008],
      [847516.582940276, 6031804.597930071],
      [847559.9418819399, 6031844.327511979],
      [847592.2022703718, 6031879.04363071],
      [847621.0340184874, 6031916.085305922],
      [847661.8437438122, 6031975.820701559],
      [847677.9628060791, 6032007.601683544],
      [847693.113388776, 6032041.708233208],
      [847708.5422702, 6032081.669801827],
      [847740.7581308355, 6032188.361333093],
      [847795.4271327641, 6032393.963536583],
      [847827.0084723021, 6032518.240944322],
      [847842.7935760967, 6032600.741678085],
      [847852.4115801011, 6032668.662705228],
      [847860.4377153873, 6032739.718105231],
      [847865.9702940799, 6032862.202624231],
      [847862.5750496106, 6032975.847906126],
      [847857.0647348164, 6033037.207082965],
      [847844.7416671856, 6033124.661157221],
      [847834.6115935233, 6033171.637984901],
      [847816.6000999131, 6033246.128449964],
      [847805.4904147319, 6033284.165679957],
      [847784.6514060553, 6033348.991006654],
      [847757.7343531816, 6033423.812904207],
      [847586.0129066838, 6033813.8671746],
      [847557.4817211934, 6033873.698167564],
      [847538.8579703837, 6033909.379213297],
      [847482.341064908, 6034010.105142349],
      [847438.4255257901, 6034096.843216185],
      [847377.0328266175, 6034235.315806188],
      [847326.0373678854, 6034358.679365173],
      [847285.0606633243, 6034453.059120705],
      [847236.6255528801, 6034548.149292744],
      [846879.4458347206, 6035223.14801653],
    ]),
    line_length: 4337.36,
  }),
];

const geoJson = [
  {
    type: 'Feature',
    properties: {
      uid: '4be65028749bb705',
      name: 'Basel SBB',
      matched_name: 'Bale',
      country_code: 'CH',
      rank: 0.6991858250433143,
      translated_names: [],
      mot: {
        bus: true,
        rail: true,
        tram: false,
        ferry: false,
        subway: false,
        gondola: false,
        cable_car: false,
        funicular: false,
      },
      platforms: {
        rail: [
          '1',
          '2',
          '3',
          '4',
          '5',
          '6',
          '7',
          '8',
          '9',
          '10',
          '11',
          '12',
          '14',
          '15',
          '16',
          '17',
          '30',
          '31',
          '33',
          '35',
        ],
      },
      ifopt: 'CH:23005:300',
      municipality_name: 'Basel',
      ident_source: 'sbb',
      id: '8500010',
      code: 'BS',
    },
    geometry: {
      type: 'Point',
      coordinates: [7.589563, 47.547412],
    },
  },
  {
    type: 'Feature',
    properties: {
      uid: 'bed0b934e1c5647c',
      name: 'Basel Bad Bf',
      matched_name: 'Basel Bad Bf',
      country_code: 'CH',
      rank: 0.6749090302800238,
      translated_names: [],
      mot: {
        bus: false,
        rail: true,
        tram: false,
        ferry: false,
        subway: false,
        gondola: false,
        cable_car: false,
        funicular: false,
      },
      platforms: {
        rail: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
      },
      ifopt: 'CH:23005:6',
      municipality_name: 'Basel',
      ident_source: 'sbb',
      id: '8500090',
      code: 'BAD',
    },
    geometry: {
      type: 'Point',
      coordinates: [846798.4609051687, 6035169.824597962],
    },
  },
];
export default { routes, geoJson };