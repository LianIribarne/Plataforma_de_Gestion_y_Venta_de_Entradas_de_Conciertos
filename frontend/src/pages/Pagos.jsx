import {
  Heading, 
  Grid, 
  GridItem,
  Box, 
  AbsoluteCenter,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import Pago from '../components/Pago';

const pagos = [
  {
    titulo: 'Pale Waves – “Neon Nights Tour – Buenos Aires”',
    codigo: 'A9F3C1B27E',
    fecha: '02.11.2025',
    hora: '15:01',
    monto: 310000,
    entradas: [
      {
        nombre: 'General',
        cantidad: 2,
        precio: 25000,
      },
      {
        nombre: 'VIP',
        cantidad: 1,
        precio: 45000,
      },
      {
        nombre: 'VIP Access Early',
        cantidad: 3,
        precio: 55000,
      },
      {
        nombre: 'OH YEAH!',
        cantidad: 1,
        precio: 50000,
      },
    ]
  },
  {
    titulo: 'Pale Waves – “Neon Nights Tour – Buenos Aires”',
    codigo: 'A9F2C1B27E',
    fecha: '02.11.2025',
    hora: '13:37',
    monto: 50000,
    entradas: [
      {
        nombre: 'General',
        cantidad: 2,
        precio: 25000,
      },
    ]
  },
]

export default function Pagos() {
  return pagos.length > 0 ? (
    <Box p={5}>
      <Heading mb={10} align='center' color='gray.50' size='2xl'>Tus pagos</Heading>
      <Wrap spacing={10} align='center' justify='center'>
        {pagos.map((p) => (
          <WrapItem align='center' key={p.codigo}>
            <Pago {...p}/>
          </WrapItem>
        ))}
      </Wrap>
    </Box>
  ) : (
    <AbsoluteCenter>
      <Box bg='whiteAlpha.500' p={4} borderRadius={8} color='white'>
        <Heading align='center'>No hay compras/pagos realizados</Heading>
      </Box>
    </AbsoluteCenter>
  )
}
