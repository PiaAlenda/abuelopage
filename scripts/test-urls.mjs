const base = 'https://pibhggxiscqhrlyuyyge.supabase.co/storage/v1/object/public/products'

// Test potentially problematic URLs
const tests = [
  'bazar/Ensaladera + 2 compoteras1.webp',
  'bazar/Ensaladera_2_compoteras1.webp',
  'bazar/Porta copa de madera + 4 copas de vino1.webp',
  'bazar/Porta_copa_de_madera_4_copas_de_vino1.webp',
  'bazar/Juego de cubiertos (caja azul)1.webp',
  'bazar/Juego_de_cubiertos_(caja_azul)1.webp',
  'bazar/2 paneras (fuente ovalada)1.webp',
  'bazar/2_paneras_(fuente_ovalada)1.webp',
  'bazar/Juego de café Durex1.webp',
  'bazar/Juego_de_cafe_Durex1.webp',
  'bazar/Juego de 6 tazas Ámbar Durex1.webp',
  'bazar/Juego_de_6_tazas_Ambar_Durex1.webp',
  'bazar/Olla de presión, asa rota1.webp',
  'bazar/Olla_de_presion_asa_rota1.webp',
  'bazar/Bandeja enlozada antigua blanca con borde azul – Vintage1.webp',
  'bazar/Bandeja_enlozada_antigua_blanca_con_borde_azul_-_Vintage1.webp',
  'bazar/Dúo de sartenes1.webp',
  'bazar/Duo de sartenes1.webp',
  'bazar/Duo_de_sartenes1.webp',
  'bazar/Plato de ceramica diseño floral.webp',
  'bazar/Plato_de_ceramica_diseno_floral.webp',
  'hogar/Colcha vintage de lanilla1.webp',
  'hogar/Colcha_vintage_de_lanilla1.webp',
  'hogar/Juego de sillones del living1.webp',
  'hogar/Juego_de_sillones_del_living1.webp',
  'hogar/Plumon reversible dos plazas1.webp',
  'hogar/Plumon_reversible_dos_plazas1.webp',
]

for (const p of tests) {
  const url = base + '/' + p
  try {
    const r = await fetch(url)
    console.log(r.status, '\t', p)
  } catch (e) {
    console.log('ERR', '\t', p)
  }
}
