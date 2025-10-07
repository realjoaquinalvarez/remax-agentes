export type Property = {
  id: string
  address: string
  city: string
  price: number
  bedrooms: number
  bathrooms: number
  area: number // in m²
  status: "activo" | "vendido" | "alquilado" | "pendiente"
  type: "casa" | "apartamento" | "terreno" | "local"
  coordinates: {
    lat: number
    lng: number
  }
  listedDate: string
}
