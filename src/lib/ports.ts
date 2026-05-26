// Master Port Database
export const PORT_DATABASE: { name: string; alias: string[]; coords: [number, number]; region: string }[] = [
  // Jawa
  { name: 'Tanjung Priok', alias: ['jakarta', 'tanjung priok', 'priok', 'jak'], coords: [-6.08, 106.89], region: 'DKI Jakarta' },
  { name: 'Tanjung Perak', alias: ['surabaya', 'tanjung perak', 'perak', 'sby'], coords: [-7.17, 112.73], region: 'Jawa Timur' },
  { name: 'Tanjung Emas', alias: ['semarang', 'tanjung emas', 'smg'], coords: [-6.93, 110.42], region: 'Jawa Tengah' },
  { name: 'Tanjung Intan', alias: ['cilacap', 'tanjung intan'], coords: [-7.73, 109.00], region: 'Jawa Tengah' },
  { name: 'Ciwandan', alias: ['cilegon', 'banten', 'ciwandan', 'merak'], coords: [-5.99, 106.00], region: 'Banten' },
  { name: 'Gresik', alias: ['gresik'], coords: [-7.16, 112.65], region: 'Jawa Timur' },
  { name: 'Probolinggo', alias: ['probolinggo'], coords: [-7.75, 113.22], region: 'Jawa Timur' },
  // Sumatra
  { name: 'Belawan', alias: ['medan', 'belawan'], coords: [3.81, 98.71], region: 'Sumatra Utara' },
  { name: 'Dumai', alias: ['dumai'], coords: [1.67, 101.45], region: 'Riau' },
  { name: 'Pekanbaru', alias: ['pekanbaru', 'pkb'], coords: [0.51, 101.44], region: 'Riau' },
  { name: 'Teluk Bayur', alias: ['padang', 'teluk bayur', 'telukbayur'], coords: [-1.00, 100.37], region: 'Sumatra Barat' },
  { name: 'Palembang', alias: ['palembang', 'plm'], coords: [-2.99, 104.76], region: 'Sumatra Selatan' },
  { name: 'Panjang', alias: ['bandar lampung', 'lampung', 'panjang'], coords: [-5.47, 105.32], region: 'Lampung' },
  { name: 'Batam', alias: ['batam'], coords: [1.16, 104.05], region: 'Kepulauan Riau' },
  { name: 'Tanjung Balai Karimun', alias: ['karimun', 'tanjung balai karimun'], coords: [1.04, 103.45], region: 'Kepulauan Riau' },
  { name: 'Sabang', alias: ['sabang', 'aceh', 'banda aceh'], coords: [5.89, 95.32], region: 'Aceh' },
  { name: 'Lhokseumawe', alias: ['lhokseumawe'], coords: [5.18, 97.14], region: 'Aceh' },
  // Kalimantan
  { name: 'Balikpapan', alias: ['balikpapan', 'bpp'], coords: [-1.28, 116.80], region: 'Kalimantan Timur' },
  { name: 'Samarinda', alias: ['samarinda', 'smd'], coords: [-0.50, 117.15], region: 'Kalimantan Timur' },
  { name: 'Banjarmasin', alias: ['banjarmasin', 'bjm'], coords: [-3.33, 114.59], region: 'Kalimantan Selatan' },
  { name: 'Pontianak', alias: ['pontianak', 'ptk'], coords: [-0.03, 109.32], region: 'Kalimantan Barat' },
  { name: 'Tarakan', alias: ['tarakan'], coords: [3.32, 117.62], region: 'Kalimantan Utara' },
  { name: 'Nunukan', alias: ['nunukan'], coords: [4.14, 117.67], region: 'Kalimantan Utara' },
  // Sulawesi
  { name: 'Makassar', alias: ['makassar', 'ujung pandang', 'mks'], coords: [-5.11, 119.40], region: 'Sulawesi Selatan' },
  { name: 'Bitung', alias: ['bitung', 'manado', 'mnd'], coords: [1.44, 125.19], region: 'Sulawesi Utara' },
  { name: 'Kendari', alias: ['kendari'], coords: [-3.97, 122.51], region: 'Sulawesi Tenggara' },
  { name: 'Palu', alias: ['palu'], coords: [-0.90, 119.87], region: 'Sulawesi Tengah' },
  { name: 'Gorontalo', alias: ['gorontalo'], coords: [0.54, 123.06], region: 'Gorontalo' },
  // Bali & Nusa Tenggara
  { name: 'Benoa', alias: ['bali', 'denpasar', 'benoa'], coords: [-8.77, 115.22], region: 'Bali' },
  { name: 'Lembar', alias: ['lombok', 'mataram', 'lembar'], coords: [-8.72, 116.08], region: 'NTB' },
  { name: 'Kupang', alias: ['kupang'], coords: [-10.17, 123.61], region: 'NTT' },
  { name: 'Bima', alias: ['bima'], coords: [-8.46, 118.72], region: 'NTB' },
  // Maluku & Papua
  { name: 'Ambon', alias: ['ambon'], coords: [-3.69, 128.17], region: 'Maluku' },
  { name: 'Ternate', alias: ['ternate'], coords: [0.79, 127.38], region: 'Maluku Utara' },
  { name: 'Sorong', alias: ['sorong'], coords: [-0.87, 131.25], region: 'Papua Barat' },
  { name: 'Jayapura', alias: ['jayapura', 'papua', 'irian'], coords: [-2.54, 140.72], region: 'Papua' },
  { name: 'Merauke', alias: ['merauke'], coords: [-8.47, 140.40], region: 'Papua' },
  { name: 'Manokwari', alias: ['manokwari'], coords: [-0.86, 134.07], region: 'Papua Barat' },
  // Internasional
  { name: 'Singapore', alias: ['singapore', 'singapura', 'sgp'], coords: [1.24, 103.84], region: 'Singapore' },
  { name: 'Hong Kong', alias: ['hong kong', 'hongkong'], coords: [22.32, 114.17], region: 'Hong Kong' },
  { name: 'Shanghai', alias: ['shanghai'], coords: [31.23, 121.47], region: 'China' },
  { name: 'Tokyo', alias: ['tokyo', 'yokohama'], coords: [35.68, 139.65], region: 'Japan' },
  { name: 'Busan', alias: ['busan'], coords: [35.18, 129.08], region: 'Korea' },
  { name: 'Rotterdam', alias: ['rotterdam'], coords: [51.92, 4.48], region: 'Netherlands' },
];
