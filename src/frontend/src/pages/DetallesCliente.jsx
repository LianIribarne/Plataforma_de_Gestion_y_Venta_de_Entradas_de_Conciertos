import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import {
  Badge,
  Box,
  Button,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Skeleton,
  Text,
  Tooltip,
  useDisclosure,
  Wrap, WrapItem,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Entrada from "../components/Entrada";
import FiltrosPagos from '../components/FiltrosPagos';
import Pago from "../components/Pago";
import api from '../services/api';
import { endpoints } from "../services/endpoints";

export default function DetallesUsuarios() {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const id = location.state;
  const navigate = useNavigate();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [verPagos, setVerPagos] = useState(true);
  const [verEntradas, setVerEntradas] = useState(true);

  const [pagos, setPagos] = useState([])
  const [ultimosPagos, setUltimosPagos] = useState([])

  const fetchPagos = async (filtros) => {
    setLoading(true);

    const params = {cliente: id}

    if (filtros?.fechaDesde) params.fecha_desde = filtros.fechaDesde;
    if (filtros?.fechaHasta) params.fecha_hasta = filtros.fechaHasta;
    if (filtros?.montoMin > 0) params.monto_min = filtros.montoMin;
    if (filtros?.montoMax > 0) params.monto_max = filtros.montoMax;

    try {
      const response = await api.get(
        endpoints.pagos.pagos,
        { params }
      );

      setPagos(response.data.results);

      const res = await api.get(
        endpoints.pagos.pagos,
        {
          params: {
            cliente: id
          }
        }
      );

      setUltimosPagos(res.data.results)
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPagos();
  }, []);

  const [entradas, setEntradas] = useState([])

  const fetchEntradas = async () => {
    setLoading(true);

    try {
      const response = await api.get(
        endpoints.entradas.entradas,
        {
          params: {
            cliente: id
          }
        }
      );

      setEntradas(response.data)
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEntradas();
  }, []);

  if (!id) navigate("/usuarios");;

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        setLoading(true);

        const response = await api.get(endpoints.usuarios.detalles_usuario(id));

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

  const toggleVerEntradas = (eventoId) => {
    setVerEntradas((s) => ({
      ...s,
      [eventoId]: !s[eventoId],
    }));
  };

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
            onApply={fetchPagos}
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

        <GridItem colSpan={3}>
          <Box align='center' mt={4}>
            <Heading color='white' as='span'>Entradas Adquiridas</Heading>
          </Box>

          {entradas.map((ev) => {
            const visibles = verEntradas[ev.concierto.titulo] ?? true;

            return (
              <Box key={ev.concierto.titulo} mt={5}>
                <HStack>
                  <Heading ml={4} color='white' size='lg'>{ev.concierto.titulo}</Heading>
                  <Tooltip label={visibles  ? 'Ocultar' : 'Mostrar'} placement='top'>
                    <IconButton
                      bg='whiteAlpha.800'
                      color='blackAlpha.800'
                      rounded='full'
                      ml={2}
                      onClick={() => toggleVerEntradas(ev.concierto.titulo)}
                      icon={visibles ? <ViewOffIcon /> : <ViewIcon />}
                    />
                  </Tooltip>
                </HStack>

                <Wrap spacing={3} justify='center' align='center' mt={4} display={visibles ? undefined : 'none'}>
                  {ev.entradas.map((x) => (
                    <WrapItem key={x.codigo}>
                      <Entrada
                        qr={x.qr_url}
                        artista={ev.concierto.artista}
                        titulo={ev.concierto.titulo}
                        fecha={ev.concierto.fecha}
                        puertas={ev.concierto.puertas_hora}
                        show={ev.concierto.show_hora}
                        precio={x.precio}
                        codigo={x.codigo}
                        tipo={x.tipo}
                        estado={ev.concierto.estado}
                      />
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            );
          })}
        </GridItem>
      </Grid>
    </Box>
  )
}
