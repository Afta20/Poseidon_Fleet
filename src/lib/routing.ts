// Maritime Waypoint Routing Graph
export interface SeaNode {
  id: string;
  coords: [number, number]; // [lat, lng]
}

export const SEA_NODES: Record<string, SeaNode> = {
  n_sg_strait: { id: 'n_sg_strait', coords: [1.2, 103.9] }, // Singapore Strait
  n_malacca_s: { id: 'n_malacca_s', coords: [1.8, 102.5] }, // South Malacca
  n_malacca_n: { id: 'n_malacca_n', coords: [3.8, 99.8] }, // North Malacca (near Belawan)
  n_sabang: { id: 'n_sabang', coords: [5.9, 95.5] }, // Aceh tip
  n_sunda_n: { id: 'n_sunda_n', coords: [-5.8, 105.8] }, // North of Sunda Strait (Cilegon/Panjang)
  n_sunda_s: { id: 'n_sunda_s', coords: [-6.5, 105.2] }, // South of Sunda Strait
  n_java_w: { id: 'n_java_w', coords: [-5.7, 107.0] }, // Java Sea West (Priok)
  n_java_c: { id: 'n_java_c', coords: [-5.9, 110.0] }, // Java Sea Center (Semarang)
  n_java_e: { id: 'n_java_e', coords: [-6.5, 112.7] }, // Java Sea East (Surabaya/Gresik)
  n_bali_sea: { id: 'n_bali_sea', coords: [-8.0, 115.0] }, // North Bali
  n_bali_strait: { id: 'n_bali_strait', coords: [-8.9, 115.5] }, // South Bali / Benoa
  n_makassar_s: { id: 'n_makassar_s', coords: [-5.2, 119.0] }, // South Makassar Strait
  n_makassar_n: { id: 'n_makassar_n', coords: [-0.5, 118.5] }, // North Makassar Strait (Balikpapan)
  n_karimata: { id: 'n_karimata', coords: [-2.0, 108.5] }, // Karimata Strait (Pontianak)
  n_natuna: { id: 'n_natuna', coords: [4.0, 108.0] }, // Natuna Sea
  n_sulawesi: { id: 'n_sulawesi', coords: [2.0, 122.0] }, // Sulawesi Sea (Bitung/Tarakan)
  n_banda: { id: 'n_banda', coords: [-5.0, 128.0] }, // Banda Sea (Ambon)
  n_papua_n: { id: 'n_papua_n', coords: [-1.5, 136.0] }, // North Papua (Manokwari/Jayapura)
  n_arafura: { id: 'n_arafura', coords: [-9.0, 135.0] }, // Arafura Sea (Merauke)
  n_ntt: { id: 'n_ntt', coords: [-10.0, 122.0] }, // NTT Sea (Kupang)
  n_padang: { id: 'n_padang', coords: [-1.0, 99.5] }, // West Sumatra (Padang)
  n_bengkulu: { id: 'n_bengkulu', coords: [-4.0, 101.5] }, // West Sumatra (South)
};

// Connections between nodes (bidirectional)
export const SEA_EDGES: [string, string][] = [
  ['n_sg_strait', 'n_malacca_s'],
  ['n_malacca_s', 'n_malacca_n'],
  ['n_malacca_n', 'n_sabang'],
  ['n_sg_strait', 'n_karimata'],
  ['n_sg_strait', 'n_natuna'],
  ['n_karimata', 'n_java_w'],
  ['n_sunda_n', 'n_java_w'],
  ['n_sunda_n', 'n_sunda_s'],
  ['n_sunda_s', 'n_bengkulu'],
  ['n_bengkulu', 'n_padang'],
  ['n_padang', 'n_sabang'], // West coast Sumatra route
  ['n_java_w', 'n_java_c'],
  ['n_java_c', 'n_java_e'],
  ['n_java_e', 'n_bali_sea'],
  ['n_bali_sea', 'n_bali_strait'],
  ['n_bali_sea', 'n_makassar_s'],
  ['n_java_e', 'n_makassar_s'],
  ['n_makassar_s', 'n_makassar_n'],
  ['n_makassar_n', 'n_sulawesi'],
  ['n_makassar_s', 'n_banda'],
  ['n_bali_strait', 'n_ntt'],
  ['n_ntt', 'n_banda'],
  ['n_banda', 'n_arafura'],
  ['n_banda', 'n_papua_n'],
  ['n_sulawesi', 'n_papua_n']
];

function getDistance(coord1: [number, number], coord2: [number, number]): number {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function findNearestNode(coord: [number, number]): string {
  let nearestId = '';
  let minDistance = Infinity;
  for (const [id, node] of Object.entries(SEA_NODES)) {
    const dist = getDistance(coord, node.coords);
    if (dist < minDistance) {
      minDistance = dist;
      nearestId = id;
    }
  }
  return nearestId;
}

export function getSeaRoute(origin: [number, number], dest: [number, number]): [number, number][] {
  const originNodeId = findNearestNode(origin);
  const destNodeId = findNearestNode(dest);
  
  if (originNodeId === destNodeId) {
    // Very short trip, just return straight line
    return [origin, dest];
  }

  // Dijkstra's Algorithm
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  for (const id of Object.keys(SEA_NODES)) {
    dist[id] = Infinity;
    prev[id] = null;
    unvisited.add(id);
  }
  dist[originNodeId] = 0;

  while (unvisited.size > 0) {
    let currNode: string | null = null;
    for (const id of Array.from(unvisited)) {
      if (currNode === null || dist[id] < dist[currNode]) {
        currNode = id;
      }
    }

    if (currNode === null || dist[currNode] === Infinity) break;
    if (currNode === destNodeId) break;

    unvisited.delete(currNode);

    const neighbors = SEA_EDGES.filter(e => e[0] === currNode || e[1] === currNode)
      .map(e => e[0] === currNode ? e[1] : e[0]);

    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor)) continue;
      
      const alt = dist[currNode] + getDistance(SEA_NODES[currNode].coords, SEA_NODES[neighbor].coords);
      if (alt < dist[neighbor]) {
        dist[neighbor] = alt;
        prev[neighbor] = currNode;
      }
    }
  }

  const pathIds: string[] = [];
  let u: string | null = destNodeId;
  while (u !== null) {
    pathIds.unshift(u);
    u = prev[u];
  }

  // If path finding failed (graph disconnected, which shouldn't happen with our edges), return straight line
  if (pathIds[0] !== originNodeId) {
    return [origin, dest];
  }

  const pathCoords = pathIds.map(id => SEA_NODES[id].coords);
  return [origin, ...pathCoords, dest];
}

export function interpolateAlongPath(path: [number, number][], progress: number): [number, number] {
  if (path.length === 0) return [0, 0];
  if (path.length === 1) return path[0];
  if (progress <= 0) return path[0];
  if (progress >= 1) return path[path.length - 1];

  const distances = [];
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const d = getDistance(path[i], path[i+1]);
    distances.push(d);
    totalDistance += d;
  }

  let targetDist = totalDistance * progress;
  
  for (let i = 0; i < path.length - 1; i++) {
    if (targetDist <= distances[i] || i === path.length - 2) {
      const segmentProgress = targetDist / (distances[i] || 1); // fallback to 1 to avoid div by zero
      const [lat1, lon1] = path[i];
      const [lat2, lon2] = path[i+1];
      return [
        lat1 + (lat2 - lat1) * segmentProgress,
        lon1 + (lon2 - lon1) * segmentProgress
      ];
    }
    targetDist -= distances[i];
  }
  
  return path[path.length - 1];
}
