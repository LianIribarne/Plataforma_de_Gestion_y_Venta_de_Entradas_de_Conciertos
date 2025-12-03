import {
  Box, 
  Heading, 
  Text,
  Divider, 
} from "@chakra-ui/react";
import formatoPrecio from "../utils/FormatoPrecio";

export default function Pago({ titulo, codigo, fecha, hora, monto, entradas }) {
  return (
    <Box 
      maxW='300px' 
      bg='whiteAlpha.900'
      py={3}
      px={4}
      color='gray.600'
      fontWeight='medium'
      transition="all 0.3s ease"
      _hover={{ 
        transform: "translateY(-10px)", 
        boxShadow: 'dark-lg' 
      }}
    >
      <Heading size='md' textAlign='left' mb={2}>RECIBO - {codigo}</Heading>
      <Text textAlign='left' mb={2}>Concierto: {titulo}</Text>

      <Box display="flex" justifyContent="space-between">
        <Text>Fecha: {fecha}</Text>
        <Text>Hora: {hora}</Text>
      </Box>

      <Divider my={2} borderColor='gray.600' borderWidth={1} />

      <Box my={3}>
        {entradas.map((e) => (
          <Box display="flex" justifyContent="space-between" key={e.nombre}>
            <Text>{e.nombre}{e.cantidad > 1 ? `(${e.cantidad})`: undefined}</Text>
            <Text>${formatoPrecio((e.precio * e.cantidad))}</Text>
          </Box>
        ))}
      </Box>

      <Divider my={2} borderColor='gray.600' borderWidth={1} />

      <Text textAlign="right">Total: ${formatoPrecio(monto)}</Text>
    </Box>
  )
}
