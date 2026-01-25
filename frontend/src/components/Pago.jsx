import {
  Box, 
  Heading, 
  Text,
  Divider, 
} from "@chakra-ui/react";

export default function Pago({ concierto, codigo, fecha, hora, monto, cant_entradas, items }) {
  return (
    <Box 
      maxW='300px' 
      minW='300px' 
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
      <Text textAlign='left' mb={2}>Concierto: {concierto}</Text>

      <Box display="flex" justifyContent="space-between">
        <Text>Fecha: {fecha}</Text>
        <Text>Hora: {hora}</Text>
      </Box>

      <Divider my={2} borderColor='gray.600' borderWidth={1} />

      <Box my={2}>
        <Text mt={-1}>Cant. de entradas: {cant_entradas}</Text>
        {items.map((i) => (
          <Box display="flex" justifyContent="space-between" key={i.nombre} mt={2}>
            <Box align='start'>
              <Text>{i.nombre}{i.cantidad > 1 ? `(${i.cantidad})`: undefined}</Text>
              <Text fontSize='x-small'>{i.precio}</Text>
            </Box>
            <Text>{i.subtotal}</Text>
          </Box>
        ))}
      </Box>

      <Divider my={2} borderColor='gray.600' borderWidth={1} />

      <Text textAlign="right">Monto total: {monto}</Text>
    </Box>
  )
}
