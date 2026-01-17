import {
  Heading, Box, AbsoluteCenter, Wrap,
  WrapItem, useDisclosure, Button,
} from "@chakra-ui/react";
import Pago from '../components/Pago';
import FiltrosPagos from '../components/FiltrosPagos';

const pagos = [
  {
    titulo: 'Pale Waves – “Neon Nights Tour – Buenos Aires”',
    codigo: 'A9F3C1B27E',
    fecha: '02/11/2025',
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
    fecha: '02/11/2025',
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
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleApplyFilters = async (filtros) => {
    const params = new URLSearchParams(filtros);
    const res = await axios.get(`/api/eventos/?${params.toString()}`);
    setEventos(res.data);
  };

  return pagos.length > 0 ? (
    <Box p={5} align='center'>
      <Heading mb={4} align='center' color='gray.50' size='2xl'>Pagos / Ventas</Heading>

      <Button 
        bg='whiteAlpha.800'
        color='blackAlpha.800'
        rounded='full' 
        size='lg' 
        onClick={onOpen}
        mb={8}
      >
        Filtros
      </Button>

      <FiltrosPagos
        isOpen={isOpen} 
        onClose={onClose} 
        onApply={handleApplyFilters}
      />

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
        <Heading align='center'>No hay pagos / ventas</Heading>
      </Box>
    </AbsoluteCenter>
  )
}
