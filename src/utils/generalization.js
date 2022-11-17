export const graphs = {
  rail: [null, 'gen100', 'gen30', 'gen10', 'gen5'],
  bus: [null, 'gen100'],
  tram: [null, 'gen100'],
  subway: [null, 'gen100'],
  gondola: [null, 'gen150', 'gen100'],
  funicular: [null, 'gen150', 'gen100'],
  ferry: [null, 'gen150', 'gen100'],
};

export const getGeneralization = (mot, zoom) => {
  const graph = graphs[mot] || null;
  if (mot === 'rail') {
    if (zoom >= 14) {
      return graph[0];
    }
    if (zoom < 14 && zoom >= 11) {
      return graph[1];
    }
    if (zoom < 11 && zoom >= 9) {
      return graph[2];
    }
    if (zoom < 9 && zoom >= 8) {
      return graph[3];
    }
    return graph[4];
  }

  if (/^(bus|tram|subway)$/.test(mot)) {
    if (zoom >= 14) {
      return graph[0];
    }
    return graph[1];
  }

  if (/^(gondola|funicular|ferry)$/.test(mot)) {
    if (zoom >= 15) {
      return graph[0];
    }
    if (zoom > 13 && zoom < 15) {
      return graph[1];
    }
    return graph[2];
  }

  return null;
};

export default getGeneralization;
