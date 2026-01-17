import {
  Box, Text, Heading, Grid,
  GridItem, Wrap, WrapItem, Button,
  useDisclosure, IconButton, Tooltip, Badge,
  Skeleton, HStack,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import formatoPrecio from '../utils/FormatoPrecio'
import Evento from "../components/Concierto";
import Pago from "../components/Pago";
import Carrusel from "../components/Artistas";
import FiltrosEventos from '../components/FiltrosConciertos';
import FiltrosPagos from '../components/FiltrosPagos';
import api from '../services/api'

const eventos = [
  {
    id: '1',
    imagen: 'https://www.musikblog.de/wp-content/uploads/2022/08/Pale_Waves_Credit_Dirty_Hit-8.jpg',
    artista: 'Pale Waves',
    titulo: 'Pale Waves – “Neon Nights Tour – Buenos Aires”',
    fecha: '04/11/2025',
    hora: '12:00',
    genero: 'Indie Pop',
    estado: 'Programado'
  },
  {
    id: '2',
    imagen: 'https://i.scdn.co/image/ab67616d0000b2730315d0b066cebbdd7128a764',
    artista: 'Chaos Chaos',
    titulo: 'Chaos Chaos – “Bright Futures Live Set”',
    fecha: '04/11/2025',
    hora: '12:00',
    genero: 'Indie Electronic',
    estado: 'Agotado'
  },
  {
    id: '4',
    imagen: 'https://i.scdn.co/image/ab67616d0000b273d6dfb454b77efaccc1371d14',
    artista: 'iDKHOW',
    titulo: 'iDKHOW – “RetroFuture Live Experience”',
    fecha: '04/11/2025',
    hora: '12:00',
    genero: 'Alternative Pop',
    estado: 'Cancelado'
  },
]

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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const id = location.state;
  const navigate = useNavigate();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [verPagos, setVerPagos] = useState(true);
  const [verEventos, setVerEventos] = useState(true);

  const [selectedArtist, setSelectedArtist] = useState('');

  const handleApplyFilters = async (filtros) => {
    const params = new URLSearchParams(filtros);
    const res = await axios.get(`/api/eventos/?${params.toString()}`);
    setEventos(res.data);
  };

  const handleArtistFromCarrusel = (artistName) => {
    setSelectedArtist(artistName);
  };

  const handleClearFilters = () => {
    setSelectedArtist('');
  };

  if (!id) navigate("/usuarios");;

  useEffect(() => {
    const fetchOrganizador = async () => {
      try {
        const response = await api.get(`/usuarios/admin/detalles_usuario/${id}`);
        const responseStats = await api.get(`/usuarios/estadisticas_organizador/${id}`)

        const payload = response.data;
        const payloadStats = responseStats.data

        setDatos(payload);
        setStats(payloadStats)
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizador();
  }, [id]);

  const organizadorBase = [
    { label: 'Email', key: 'email' },
    { label: 'Fecha nacimiento', key: 'fecha_nacimiento' },
    { label: 'Cuando se creó la cuenta', key: 'date_joined' },
    { label: 'Último inicio de sesión', key: 'last_login' },
  ];

  const organizadorConDatos = datos
    ? organizadorBase.map(item => ({
        ...item,
        value: datos[item.key] ?? ''
      }))
    : [];

  const conciertosBase = [
    { label: 'Creados', key: 'conciertos_creados' },
    { label: 'Programados', key: 'conciertos_programados' },
    { label: 'Cancelados', key: 'conciertos_cancelados' },
    { label: 'Agotados', key: 'conciertos_agotados' },
    { label: 'Finalizados', key: 'conciertos_finalizados' },
    { label: 'Tipos entradas creadas', key: 'tipos_entrada_creados' },
    { label: 'Entradas totales', key: 'entradas_totales' },
    { label: 'Entradas vendidas', key: 'entradas_vendidas' },
    { label: 'Ocupación promedio', key: 'ocupacion_promedio' },
  ]

  const conciertosStats = stats
    ? conciertosBase.map(item => ({
        ...item,
        value: stats[item.key] ?? ''
      }))
    : [];

  return (
    <Box p={5}>
      <Grid 
        templateColumns='repeat(3, 1fr)'
        gap={4}
      >
        <GridItem color='white' colSpan={1} align='center'>
            {loading ? (
              <Box>
                <Skeleton h={800} borderRadius={20} />
              </Box>
            ) : (
              <Box>
                <Heading mb={4} align='center'>
                  Organizador{' '}
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
                  {organizadorConDatos.map((o, i) => (
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

                <Heading my={4} fontSize='2xl' align='center'>Conciertos</Heading>
                <Wrap justify='center'>
                  {conciertosStats.map((c, i) => (
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
                        {c.label}
                      </Heading>
                      <Text>
                        {c.value}
                      </Text>
                    </WrapItem>
                  ))}
                </Wrap>

                <Heading my={4} fontSize='2xl' align='center'>Últimos cambios</Heading>
                <Wrap justify='center'>
                  
                </Wrap>

                <Heading my={4} fontSize='2xl' align='center'>Analítica</Heading>
                <Wrap justify='center'>
                  <WrapItem
                    bg='whiteAlpha.400' 
                    fontWeight='medium' 
                    px={2}
                    py={1}
                    borderRadius={10}
                    align='center'
                    display='inline-block'
                  >
                    <Heading fontSize='xl'>
                      ${formatoPrecio(678245000)}
                    </Heading>
                    <Text>
                      Ingreso total generado
                    </Text>
                  </WrapItem>
                  <WrapItem
                    bg='whiteAlpha.400' 
                    fontWeight='medium' 
                    px={2}
                    py={1}
                    borderRadius={10}
                    align='center'
                    display='inline-block'
                  >
                    <Heading fontSize='xl'>
                      ${formatoPrecio(8245000)}
                    </Heading>
                    <Text>
                      Ingreso promedio por concierto
                    </Text>
                  </WrapItem>
                  <WrapItem
                    bg='whiteAlpha.400' 
                    fontWeight='medium' 
                    px={2}
                    py={1}
                    borderRadius={10}
                    align='center'
                    display='inline-block'
                  >
                    <Heading fontSize='xl'>
                      561
                    </Heading>
                    <Text>
                      Reservas totales
                    </Text>
                  </WrapItem>
                  <WrapItem
                    bg='whiteAlpha.400' 
                    fontWeight='medium' 
                    px={2}
                    py={1}
                    borderRadius={10}
                    align='center'
                    display='inline-block'
                  >
                    <Heading fontSize='xl'>
                      201
                    </Heading>
                    <Text>
                      Reservas expiradas
                    </Text>
                  </WrapItem>
                  <WrapItem
                    bg='whiteAlpha.400' 
                    fontWeight='medium' 
                    px={2}
                    py={1}
                    borderRadius={10}
                    align='center'
                    display='inline-block'
                  >
                    <Heading fontSize='xl'>
                      360
                    </Heading>
                    <Text>
                      Reservas finalizadas
                    </Text>
                  </WrapItem>
                  <WrapItem
                    bg='whiteAlpha.400' 
                    fontWeight='medium' 
                    px={2}
                    py={1}
                    borderRadius={10}
                    align='center'
                    display='inline-block'
                  >
                    <Heading fontSize='xl'>
                      14 días
                    </Heading>
                    <Text>
                      Promedio para vender el 50%
                    </Text>
                  </WrapItem>
                  <WrapItem
                    bg='whiteAlpha.400' 
                    fontWeight='medium' 
                    px={2}
                    py={1}
                    borderRadius={10}
                    align='center'
                    display='inline-block'
                  >
                    <Heading fontSize='xl'>
                      {((360 / 561) * 100).toFixed(2)}%
                    </Heading>
                    <Text>
                      Ratio de reserva a compra
                    </Text>
                  </WrapItem>
                </Wrap>
              </Box>
            )}
        </GridItem>

        <GridItem colSpan={2}>
          <Heading mb={4} color='white' align='center'>Últimos conciertos creados</Heading>
          {loading ? (
            <HStack spacing={20} justify='center'>
              <Skeleton h={400} w={64} borderRadius={20} />
              <Skeleton h={400} w={64} borderRadius={20} />
              <Skeleton h={400} w={64} borderRadius={20} />
            </HStack>
          ) : (
            <Grid templateColumns='repeat(3, 1fr)' ml={20}>
              {eventos.map((e) => (
                <GridItem key={e.id}>
                  <Evento {...e}/>
                </GridItem>
              ))}
            </Grid>
          )}

          <Heading my={4} color='white' align='center'>Últimas ventas registradas</Heading>
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
            <Heading color='white' as='span'>Conciertos creados</Heading>
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
            <Tooltip label={verEventos ? 'Ocultar' : 'Mostrar'} placement='top'>
              <IconButton  
                bg='whiteAlpha.800'
                color='blackAlpha.800'
                rounded='full' 
                ml={2}
                mt={-3}
                onClick={() => setVerEventos(prev => !prev)}
                icon={verEventos ? <ViewOffIcon /> : <ViewIcon />}
              />
            </Tooltip>
          </Box>

          <FiltrosEventos
            isOpen={isOpen} 
            onClose={onClose} 
            onApply={handleApplyFilters}
            artistaSeleccionado={selectedArtist}
            onClear={handleClearFilters}
          />

          <Carrusel onSelectArtista={handleArtistFromCarrusel} artistaSeleccionado={selectedArtist} />

          {loading ? (
            <HStack spacing={20} justify='center'>
              <Skeleton h={400} w={64} borderRadius={20} />
              <Skeleton h={400} w={64} borderRadius={20} />
              <Skeleton h={400} w={64} borderRadius={20} />
            </HStack>
          ) : (
            <Wrap spacing={10} align='center' justify='center' mt={6} display={verEventos ? undefined : 'none'}>
              {eventos.map((e) => (
                <WrapItem key={e.id}>
                  <Evento {...e}/>
                </WrapItem>
              ))}
            </Wrap>
          )}
        </GridItem>

        <GridItem colSpan={3}>
          <Box align='center' mt={4}>
            <Heading color='white' as='span'>Ventas registradas</Heading>
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
