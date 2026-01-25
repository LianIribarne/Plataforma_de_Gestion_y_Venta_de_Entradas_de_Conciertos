import {
  Box, Text, Heading, Grid,
  GridItem, Wrap, WrapItem, Button,
  useDisclosure, IconButton, Tooltip, Badge,
  Skeleton, HStack, Center,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import Evento from "../components/Concierto";
import Pago from "../components/Pago";
import Carrusel from "../components/Artistas";
import FiltrosEventos from '../components/FiltrosConciertos';
import FiltrosPagos from '../components/FiltrosPagos';
import api from '../services/api'

export default function DetallesUsuarios() {
  const [datos, setDatos] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const id = location.state;
  const navigate = useNavigate();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isPagoOpen, 
    onOpen: onPagoOpen, 
    onClose: onPagoClose 
  } = useDisclosure();

  const [verPagos, setVerPagos] = useState(true);
  const [verEventos, setVerEventos] = useState(true);

  const [selectedArtist, setSelectedArtist] = useState('');

  const [conciertos, setConciertos] = useState([])
  const [ultimosConciertos, setUltimosConciertos] = useState([])

  const fetchConciertos = async (filtros) => {
    setLoading(true);

    const params = {organizador: id}

    if (filtros?.categoria) params.categoria = filtros.categoria;
    if (filtros?.artista) params.artista = filtros.artista;
    if (filtros?.rango_horario) params.rango_horario = filtros.rango_horario;
    if (filtros?.provincia) params.provincia = filtros.provincia;
    if (filtros?.mood) params.mood = filtros.mood;
    if (filtros?.estado) params.estado = filtros.estado;
    if (filtros?.entradas) params.entradas = filtros.entradas;

    try {
      const response = await api.get(
        "/conciertos/conciertos/", 
        { params }
      );

      setConciertos(response.data.results);

      const res = await api.get("/conciertos/conciertos/", { organizador: id });

      setUltimosConciertos(res.data.results)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConciertos();
  }, []);

  const [pagos, setPagos] = useState([])
  const [ultimosPagos, setUltimosPagos] = useState([])
  
  const fetchPagos = async (filtros) => {
    setLoading(true);

    const params = {organizador: id}

    if (filtros?.fechaDesde) params.fecha_desde = filtros.fechaDesde;
    if (filtros?.fechaHasta) params.fecha_hasta = filtros.fechaHasta;
    if (filtros?.montoMin > 0) params.monto_min = filtros.montoMin;
    if (filtros?.montoMax > 0) params.monto_max = filtros.montoMax;

    try {
      const response = await api.get(
        "/pagos/pagos/", 
        { params }
      );

      setPagos(response.data.results);

      const res = await api.get("/pagos/pagos/", { organizador: id });

      setUltimosPagos(res.data.results)
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPagos();
  }, []);

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
    { label: 'Borradores', key: 'conciertos_borradores' },
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
            <Wrap spacing={10} align='center' justify='center'>
              {ultimosConciertos.slice(0, 3).map((c) => (
                <WrapItem key={c.id}>
                  <Evento
                    id={c.id}
                    imagen={c.imagen}
                    artista={c.artista.nombre}
                    titulo={c.titulo}
                    genero={c.artista.categoria.nombre}
                    estado={c.estado}
                    fecha={c.fecha}
                    hora={c.show_hora}
                    tipos_entrada={c.tipos_entrada}
                  />
                </WrapItem>
              ))}
            </Wrap>
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
              {ultimosPagos.slice(0, 3).map((p) => (
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
            onApply={fetchConciertos}
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
          ) : conciertos.length > 0 ? (
            <Wrap spacing={10} align='center' justify='center' mt={6} display={verEventos ? undefined : 'none'}>
              {conciertos.map((c) => (
                <WrapItem key={c.id}>
                  <Evento
                    id={c.id}
                    imagen={c.imagen}
                    artista={c.artista.nombre}
                    titulo={c.titulo}
                    genero={c.artista.categoria.nombre}
                    estado={c.estado}
                    fecha={c.fecha}
                    hora={c.show_hora}
                    tipos_entrada={c.tipos_entrada}
                  />
                </WrapItem>
              ))}
            </Wrap>
          ) : (
            <Center>
              <Text
                bg='whiteAlpha.400'
                color='white'
                mt={6}
                py={2}
                px={3}
                borderRadius={20}
                fontSize='4xl'
                fontWeight='medium'
                display='inline-block'
              >
                Sin información.
              </Text>
            </Center>
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
              onClick={onPagoOpen}
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
            isOpen={isPagoOpen} 
            onClose={onPagoClose} 
            onApply={fetchPagos}
          />

          {loading ? (
            <HStack spacing={20} justify='center'>
              <Skeleton h={400} w={72} />
              <Skeleton h={400} w={72} />
              <Skeleton h={400} w={72} />
            </HStack>
          ) : pagos.length > 0 ? (
            <Wrap spacing={10} align='center' justify='center' mt={6} display={verPagos ? undefined : 'none'}>
              {pagos.map((p) => (
                <WrapItem align='center' key={p.codigo}>
                  <Pago {...p}/>
                </WrapItem>
              ))}
            </Wrap>
          ) : (
            <Center>
              <Text
                bg='whiteAlpha.400'
                color='white'
                mt={6}
                py={2}
                px={3}
                borderRadius={20}
                fontSize='4xl'
                fontWeight='medium'
                display='inline-block'
              >
                Sin información.
              </Text>
            </Center>
          )}
        </GridItem>
      </Grid>
    </Box>
  )
}
