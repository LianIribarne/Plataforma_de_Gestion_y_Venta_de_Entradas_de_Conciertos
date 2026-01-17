import {
  Box, Text, Heading, Grid,
  GridItem, Wrap, WrapItem, Button,
  useDisclosure, IconButton, Tooltip, Badge,
  Skeleton, HStack,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import Pago from "../components/Pago";
import FiltrosPagos from '../components/FiltrosPagos';
import api from '../services/api'

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
  {
    titulo: 'Pale Waves – “Neon Nights Tour – Buenos Aires”',
    codigo: 'A9F1C1B27E',
    fecha: '02/11/2025',
    hora: '20:01',
    monto: 265000,
    entradas: [
      {
        nombre: 'General',
        cantidad: 1,
        precio: 25000,
      },
      {
        nombre: 'VIP Access Early',
        cantidad: 4,
        precio: 60000,
      },
    ]
  },
]

export default function DetallesUsuarios() {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const id = location.state;
  const navigate = useNavigate();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [verPagos, setVerPagos] = useState(true);
  const [verEntradas, setVerEntradas] = useState(true);

  const handleApplyFilters = async (filtros) => {
    const params = new URLSearchParams(filtros);
    const res = await axios.get(`/api/eventos/?${params.toString()}`);
    setEventos(res.data);
  };

  if (!id) navigate("/usuarios");;

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        setLoading(true);

        const response = await api.get(`/usuarios/admin/detalles_usuario/${id}`);

        const payload = response.data;

        setDatos(payload);
      } finally {
        setLoading(false);
      }
    };

    fetchCliente();
  }, [id]);

  const clienteBase = [
    { label: 'Email', key: 'email' },
    { label: 'Fecha nacimiento', key: 'fecha_nacimiento' },
    { label: 'Cuando se creó la cuenta', key: 'date_joined' },
    { label: 'Último inicio de sesión', key: 'last_login' },
  ];

  const clienteConDatos = datos
    ? clienteBase.map(item => ({
        ...item,
        value: datos[item.key] ?? ''
      }))
    : [];

  return (
    <Box p={5}>
      <Grid 
        templateColumns='repeat(3, 1fr)'
        gap={4}
      >
        <GridItem color='white' colSpan={1}>
          {loading ? (
            <Box>
              <Skeleton h={500} borderRadius={20} />
            </Box>
          ) : (
            <Box>
              <Heading mb={4} align='center'>
                Cliente{' '}
                {datos?.first_name}{' '}
                {datos?.last_name}{' '}
                <Badge
                  colorScheme={datos?.is_active === 'Activo' ? 'green' : 'red'}
                  fontSize='xl'
                  variant='subtle'
                >
                  {datos?.is_active}
                </Badge>
              </Heading>
              <Wrap justify='center'>
                {clienteConDatos.map((o, i) => (
                  <WrapItem 
                    bg='whiteAlpha.400' 
                    fontWeight='medium' 
                    px={2}
                    py={1}
                    borderRadius={10}
                    align='center'
                    display='inline-block'
                    key={i}
                  >
                    <Heading fontSize='xl'>
                      {o.label}
                    </Heading>
                    <Text>
                      {o.value}
                    </Text>
                  </WrapItem>
                ))}
              </Wrap>

              <Heading my={4} fontSize='2xl' align='center'>Últimos cambios</Heading>
              <Wrap justify='center'>
                
              </Wrap>
            </Box>
          )}
        </GridItem>

        <GridItem colSpan={2}>
          <Heading my={4} color='white' align='center'>Últimas compras realizadas</Heading>
          {loading ? (
            <HStack spacing={20} justify='center'>
              <Skeleton h={400} w={72} />
              <Skeleton h={400} w={72} />
              <Skeleton h={400} w={72} />
            </HStack>
          ) : (
            <Wrap spacing={10} align='center' justify='center'>
              {pagos.map((p) => (
                <WrapItem align='center' key={p.codigo}>
                  <Pago {...p}/>
                </WrapItem>
              ))}
            </Wrap>
          )}
        </GridItem>

        <GridItem colSpan={3}>
          <Box align='center' mt={4}>
            <Heading color='white' as='span'>Compras realizadas</Heading>
            <Button 
              bg='whiteAlpha.800'
              color='blackAlpha.800'
              rounded='full' 
              ml={2}
              mt={-3}
              onClick={onOpen}
            >
              Filtros
            </Button>
            <Tooltip label={verPagos ? 'Ocultar' : 'Mostrar'} placement='top'>
              <IconButton  
                bg='whiteAlpha.800'
                color='blackAlpha.800'
                rounded='full' 
                ml={2}
                mt={-3}
                onClick={() => setVerPagos(prev => !prev)}
                icon={verPagos ? <ViewOffIcon /> : <ViewIcon />}
              />
            </Tooltip>
          </Box>

          <FiltrosPagos 
            isOpen={isOpen} 
            onClose={onClose} 
            onApply={handleApplyFilters}
          />

          {loading ? (
            <HStack spacing={20} justify='center'>
              <Skeleton h={400} w={72} />
              <Skeleton h={400} w={72} />
              <Skeleton h={400} w={72} />
            </HStack>
          ) : (
            <Wrap spacing={10} align='center' justify='center' mt={6} display={verPagos ? undefined : 'none'}>
              {pagos.map((p) => (
                <WrapItem align='center' key={p.codigo}>
                  <Pago {...p}/>
                </WrapItem>
              ))}
            </Wrap>
          )}
        </GridItem>
      </Grid>
    </Box>
  )
}
