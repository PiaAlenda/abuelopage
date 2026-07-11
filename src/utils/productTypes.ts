const typeRules: [RegExp, string][] = [
  [/cuchill|tenedor|cubierto/i, 'Cubiertos'],
  [/bandeja/i, 'Bandejas'],
  [/fuente/i, 'Fuentes'],
  [/vaso/i, 'Vasos'],
  [/copa(s|)\b/i, 'Copas y Vasos'],
  [/taza|jarra|jarrito|pocillo/i, 'Tazas y Jarras'],
  [/olla|sarten/i, 'Ollas y Sartenes'],
  [/plato|compotera|ensaladera/i, 'Platos y Compoteras'],
  [/vajilla|set entero/i, 'Vajilla'],
  [/bowl/i, 'Bowls'],
  [/tabla(?! de planchar)/i, 'Tablas'],
  [/prensa frances/i, 'Cafeteras'],
  [/picadora|tiernizador|hervidor/i, 'Utensilios de Cocina'],
  [/panera/i, 'Paneras'],

  [/mesa/i, 'Mesas'],
  [/sillón|sillones/i, 'Sillones'],
  [/lámpara|lampara|velador/i, 'Lámparas y Veladores'],
  [/biblioteca/i, 'Bibliotecas'],
  [/espejo/i, 'Espejos'],
  [/mochila/i, 'Mochilas'],
  [/colch|colcha|plumón|plumon/i, 'Textiles'],
  [/escritorio/i, 'Escritorios'],
  [/florero/i, 'Floreros'],
  [/pieza de|pieza (mamás|abuelo)/i, 'Juegos de Muebles'],
  [/tabla de planchar/i, 'Tablas de Planchar'],

  [/televisor|nest hub/i, 'TV y Video'],
  [/parlante|edifier|panasonic|jvc/i, 'Audio'],
  [/xiaomi redmi/i, 'Celulares'],
  [/lenovo|ideapad/i, 'Laptops'],
  [/xiaomi watch/i, 'Smartwatches'],
  [/heladera/i, 'Heladeras'],
  [/batidora|licuadora|multiprocesadora|juguera/i, 'Electrodomésticos'],
  [/cafetera|pava eléctrica|pava electrica/i, 'Cafeteras y Pavas'],
  [/sandwichera|vaporera|hornito|caloventor/i, 'Pequeños Electrodomésticos'],
  [/taladro|amoladora/i, 'Herramientas'],
  [/impresora/i, 'Impresoras'],
  [/grabadora de dvd/i, 'DVD y Video'],
]

export function getProductType(name: string): string {
  for (const [regex, type] of typeRules) {
    if (regex.test(name)) return type
  }
  return 'Otros'
}

export function getUniqueTypes(products: { name: string }[]): string[] {
  const types = new Set(products.map(p => getProductType(p.name)))
  return Array.from(types).sort()
}
