import {
  Heading, 
  Grid, 
  GridItem,
  Box, 
  AbsoluteCenter,
} from "@chakra-ui/react";
import Pago from '../components/Pago';

const pagos = [
  {
    codigo: 'A9F3C1B27E',
    fecha: '02.11.2025',
    hora: '15:01',
    monto: 20000,
    cantidad: 4,
    evento: 'Metal del bueno en buenos aires',
    artista: 'Avatar Metal',
  },
  {
    codigo: '#ABCD-1235-EFGH',
    fecha: '02.11.2025',
    hora: '15:01',
    monto: 20000,
    cantidad: 4,
    evento: 'Metal del bueno en buenos aires',
    artista: 'Avatar Metal',
  },
  {
    codigo: '#ABCD-1236-EFGH',
    fecha: '02.11.2025',
    hora: '15:01',
    monto: 20000,
    cantidad: 4,
    evento: 'Metal del bueno en buenos aires',
    artista: 'Avatar Metal',
  },
  {
    codigo: '#ABCD-1237-EFGH',
    fecha: '02.11.2025',
    hora: '15:01',
    monto: 20000,
    cantidad: 4,
    evento: 'Metal del bueno en buenos aires',
    artista: 'Avatar Metal',
  },
  {
    codigo: '#ABCD-1238-EFGH',
    fecha: '02.11.2025',
    hora: '15:01',
    monto: 20000,
    cantidad: 4,
    evento: 'Metal del bueno en buenos aires',
    artista: 'Avatar Metal',
  },
  {
    codigo: '#ABCD-1239-EFGH',
    fecha: '02.11.2025',
    hora: '15:01',
    monto: 20000,
    cantidad: 4,
    evento: 'Metal del bueno en buenos aires',
    artista: 'Avatar Metal',
  },
]

export default function Pagos() {
  return pagos.length > 0 ? (
    <Box pb={5}>
      <Heading mb={10} align='center' color='gray.50' size='2xl'>Tus pagos</Heading>
      <Grid gap={10} templateColumns="repeat(5, 1fr)" mx={5}>
        {pagos.map((p) => (
          <GridItem align='center' key={p.codigo}>
            <Pago {...p}/>
          </GridItem>
        ))}
      </Grid>
    </Box>
  ) : (
    <AbsoluteCenter>
      <Box bg='whiteAlpha.500' p={4} borderRadius={8} color='white'>
        <Heading align='center'>No hay compras/pagos realizados</Heading>
      </Box>
    </AbsoluteCenter>
  )
}
