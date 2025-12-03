export default function formatoPrecio(precio) {
  return Number(precio).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
