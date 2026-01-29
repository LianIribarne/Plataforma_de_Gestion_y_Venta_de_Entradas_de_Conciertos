import { ArrowRightIcon, CalendarIcon, InfoOutlineIcon, TimeIcon } from '@chakra-ui/icons';
import {
  Accordion,
  AspectRatio,
  Box,
  Button,
  Center,
  Grid, GridItem,
  Heading,
  Image,
  SimpleGrid,
  Skeleton, SkeletonText,
  Text,
  useToast
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FaMapMarkerAlt } from "react-icons/fa";
import { IoTicketSharp } from "react-icons/io5";
import { useLocation, useNavigate } from 'react-router-dom';
import EntradaInfo from '../components/ReservaEntrada';
import api from '../services/api';
import { useAuth } from "../services/AuthContext";
import formatoPrecio from '../utils/FormatoPrecio';

export default function EventoDetalle() {
  const location = useLocation()
  const id_concierto = location.state;
  const [concierto, setConcierto] = useState(null)
  const [entradas, setEntradas] = useState([])
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate();
  if (!id_concierto) navigate("/conciertos")

  useEffect(() => {
    const fetchConcierto = async () => {
      try {
        setLoading(true)

        const response = await api.get(`/conciertos/detalles_concierto/${id_concierto}`)

        const payload = response.data

        setConcierto(payload)
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    }

    fetchConcierto()
  }, [id_concierto])

  const toast = useToast()
  const id = 'toast-activo';

  useEffect(() => {
    if (concierto?.tipos_entrada) {
      setEntradas(concierto.tipos_entrada)
    }
  }, [concierto])

  const TOTAL_MAX = concierto?.limite_reserva_total

  // Obtener cantidades de entradas
  const [cantidades, setCantidades] = useState({});

  const handleCantidadChange = (idTipoEntrada, valor, precio) => {
    setCantidades(prev => ({
      ...prev,
      [idTipoEntrada]: {
        cantidad: valor,
        precio: precio,
      }
    }))
  }

  const totalReserva = Object.values(cantidades).reduce(
    (acc, n) => acc + (Number(n.cantidad) || 0),
    0
  )

  const montoTotal = Object.values(cantidades).reduce(
    (acc, item) => acc + (item.cantidad * item.precio),
    0
  )

  const limiteSuperado = totalReserva > TOTAL_MAX;

  useEffect(() => {
    // Si se superó el límite
    if (limiteSuperado) {
      if (!toast.isActive(id)) {
        toast({
          id,
          title: 'Límite superado',
          description: `El límite total de reservas es ${TOTAL_MAX}. Ya lo superaste.`,
          status: 'warning',
          position: 'top-right',
          duration: null,
        });
      } else {
        toast.update(id, {
          title: 'Límite superado',
          description: `El límite total de reservas es ${TOTAL_MAX}. Ya lo superaste.`,
          status: 'warning',
        });
      }
      return;
    }

    if (montoTotal > 0) {
      if (!toast.isActive(id)) {
        toast({
          id,
          title: 'Precio total',
          description: `Total del precio por las entradas $${formatoPrecio(montoTotal)}`,
          position: 'top-right',
          containerStyle: {
            marginTop: 32,
          },
          status: 'info',
          duration: null,
        });
      } else {
        toast.update(id, {
          title: 'Precio total',
          description: `Total del precio por las entradas $${formatoPrecio(montoTotal)}`,
          status: 'info',
        });
      }
      return;
    }

    // Si no hay límite superado NI total → cerrar
    toast.close(id);

  }, [limiteSuperado, montoTotal, toast]);

  useEffect(() => {
    return () => {
      toast.closeAll()
    }
  }, [])

  const { fetchReservaActiva, user } = useAuth();

  if (concierto?.estado.nombre === 'Borrador' && user?.rol === 'Cliente') navigate("/conciertos")

  const handleSubmit = async (e) => {
    try {
      const payload = {
        items: Object.entries(cantidades)
          .filter(([_, v]) => v.cantidad > 0)
          .map(([tipoId, v]) => ({
            tipo: Number(tipoId),
            cantidad: v.cantidad,
          }))
      }

      if (payload.items.length === 0) return;

      const res = await api.post("/entradas/reservar/", payload);

      const mensaje = res?.data?.message ?? "Reserva creada exitosamente";

      toast({
        title: mensaje,
        status: "success",
        duration: 2000,
        isClosable: true,
        position: 'top',
      });

      fetchReservaActiva()
      navigate("/pagos/proceso_pago")
    } catch (error) {
      let msg = "Error inesperado";

      const data = error?.response?.data;

      if (data && typeof data === "object") {
        const firstField = Object.keys(data)[0];
        const firstError = data[firstField]?.[0];

        if (firstError) msg = firstError;
      }

      toast({
        title: "Error",
        description: msg,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  const mostrar = ['En Curso', 'Agotado', 'Finalizado', 'Cancelado'].includes(concierto?.estado.nombre)

  return (
    <Box px={5} pb={5}>
      {/* Titulo */}

      {loading ? (
        <SkeletonText noOfLines={2} mb={4} w='50%' skeletonHeight='4' />
      ) : (
        <>
          <Heading
            as='h1'
            color='gray.200'
            mb={2}
            w='70%'
          >
            {concierto?.titulo}
          </Heading>
          <Heading
            as='h2'
            color='gray.300'
            mb={4}
            w='70%'
            fontSize='sm'
          >
            Artista: {concierto?.artista.nombre} - Categoria: {concierto?.artista.categoria.nombre} - Pais de origen: {concierto?.artista.pais_origen.nombre}
          </Heading>
        </>
      )}

      {/* Evento */}
      <Grid templateColumns='repeat(2, 1fr)'>

        {/* Imagen */}
        <GridItem align='center' color='gray.200' ml={8}>
          <SimpleGrid columns={2} spacing={10}>
            {loading ? (
              <Skeleton w={400} h={400} borderRadius={10} />
            ) : (
              <Center ml={14}>
                <Image
                  src={concierto?.imagen}
                  maxW="400px"
                  minW="400px"
                  borderRadius={10}
                  filter={mostrar ? 'brightness(50%)' : 'grayscale(1%)'}
                />

                <Box
                  fontSize='5xl'
                  align='center'
                  bg='black'
                  color={concierto?.estado.nombre === 'Cancelado' ? 'rgba(255, 0, 0, 0.8)' : 'white'}
                  position='absolute'
                  display={mostrar ? 'inline-block' : 'none'}
                  zIndex={2}
                  p={3}
                  border='4px'
                  borderRadius={10}
                  borderColor={concierto?.estado.nombre === 'Cancelado' ? 'rgba(255, 0, 0, 0.8)' : 'white'}
                >
                  <b>
                    {concierto?.estado.nombre === 'Agotado' ? (
                      'AGOTADO'
                    ) : concierto?.estado.nombre === 'Finalizado' ? (
                      'FINALIZADO'
                    ) : concierto?.estado.nombre === 'Cancelado' ? (
                      'CANCELADO'
                    ) : concierto?.estado.nombre === 'En Curso' ? (
                      'EN CURSO'
                    ) : (
                      ''
                    )}
                  </b>
                </Box>
              </Center>
            )}

            {loading ? (
              <Skeleton w={60} h={320} ml={20} my={12} borderRadius={10} />
            ) : (
              <Box my={12} pb={2} ml={20} fontSize='xl' color='whiteAlpha.800' bg='whiteAlpha.400' borderRadius={10}>
                <Heading fontSize='2xl' my={3}>
                  <CalendarIcon mb={1} />{' '}
                  Fecha{' '}
                  <CalendarIcon mb={1} />
                </Heading>
                <Box display='inline-block' border='2px' borderColor='whiteAlpha.500' borderRadius={8} p={3} w={40}>
                  <b>{concierto?.fecha_legible}</b>
                </Box><br />
                <Heading fontSize='2xl' my={3}>
                  <TimeIcon mb={1} />{' '}
                  Horarios{' '}
                  <TimeIcon mb={1} />
                </Heading>
                <Box display='inline-block' border='2px' borderColor='whiteAlpha.500' borderRadius={8} p={3}>
                  <b>Puertas <ArrowRightIcon mb={1} boxSize={4} /> {concierto?.puertas_hora_legible}<br />
                  Show <ArrowRightIcon mb={1} boxSize={4} /> {concierto?.show_hora_legible}</b>
                </Box>
              </Box>
            )}
          </SimpleGrid>

          {/* Acerca del concierto */}
          <Heading fontSize='4xl' mt={6} mb={4}>Acerca del Concierto</Heading>
          {loading ? (
            <SkeletonText noOfLines={3} skeletonHeight='3' />
          ) : (
            <Text as='b'>
              {concierto?.descripcion}
            </Text>
          )}
        </GridItem>

        <GridItem align='center'>

          {/* Entradas */}
          <Heading
            as='h2'
            color='gray.200'
            fontSize='3xl'
            mb={4}
            display={concierto?.estado.nombre === 'Programado' || user.rol !== 'Cliente' ? undefined : 'none'}
          >
            <IoTicketSharp style={{ display: 'inline', marginBottom: '-4' }} />{' '}
            Entradas{' '}
            <IoTicketSharp style={{ display: 'inline', marginBottom: '-4' }} />
          </Heading>

          <Box display={concierto?.estado.nombre === 'Programado' || user.rol !== 'Cliente' ? undefined : 'none'}>
            <Accordion allowToggle bg='whiteAlpha.400' borderColor='whiteAlpha.50' py={5} width='600px' borderRadius={20}>
              {entradas.map((e) => (
                <EntradaInfo
                  key={e.id}
                  id={e.id}
                  tipo={e.nombre}
                  disponibles={e.disponibles}
                  reservadas={e.reservadas}
                  precio={e.precio_legible}
                  precioNumber={e.precio}
                  cantMax={e.limite_reserva}
                  activo={e.activo}
                  onCantChange={handleCantidadChange}
                />
              ))}
            </Accordion>

            {/* Boton para reservar */}
            <Box align='center'>
              <Text
                mt={2}
                fontSize={14}
                color='gray.200'
              >
                <InfoOutlineIcon boxSize={3} mb={0.5} />
                {user.rol === 'Cliente' ? (
                  `Podés reservar hasta ${TOTAL_MAX} entradas en total.`
                ) : (
                  `Se puede reservar hasta ${TOTAL_MAX} entradas en total.`
                )}
              </Text>

              <Button
                mt={2}
                size='lg'
                rounded='full'
                onClick={handleSubmit}
                colorScheme='whiteAlpha'
                transition="all 0.3s ease"
                _hover={{ transform: 'scale(1.1)' }}
                isDisabled={totalReserva === 0 || limiteSuperado}
                display={user.rol === 'Cliente' ? undefined : 'none'}
              >
                Reservar
              </Button>
            </Box>
          </Box>

          {/* Lugar */}
          <SimpleGrid columns={2} mt={10}>
            <Box align='initial' ml={16}>
              <Heading
                as='h2'
                color='gray.200'
                fontSize='3xl'
                mb={4}
              >
                <FaMapMarkerAlt style={{ display: 'inline', marginBottom: '-4' }} />{' '}
                Localización{' '}
                <FaMapMarkerAlt style={{ display: 'inline', marginBottom: '-4' }} />
              </Heading>
              {loading ? (
                <SkeletonText noOfLines={4} skeletonHeight='2' mr={4} />
              ) : (
                <Text as='b' color='gray.200'>
                  Direccion <ArrowRightIcon mb={1} boxSize={3} /> {concierto?.lugar.direccion}<br />
                  Ciudad <ArrowRightIcon mb={1} boxSize={3} /> {concierto?.lugar.provincia.ciudad.nombre}<br />
                  Provincia <ArrowRightIcon mb={1} boxSize={3} /> {concierto?.lugar.provincia.nombre}<br />
                  Lugar <ArrowRightIcon mb={1} boxSize={3} /> {concierto?.lugar.nombre}
                </Text>
              )}
            </Box>
            {loading ? (
              <Skeleton w={300} h={160} borderRadius={12}/>
            ) : (
              <AspectRatio
                maxW="300px"
                ratio={16 / 9}
              >
                <iframe
                  style={{ border: 0, borderRadius: '12px' }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.google.com/maps?q=${concierto?.lugar.direccion}+${concierto?.lugar.provincia.ciudad.nombre}+${concierto?.lugar.provincia.nombre}+${concierto?.lugar.nombre}&output=embed`}
                ></iframe>
              </AspectRatio>
            )}
          </SimpleGrid>
        </GridItem>
      </Grid>
    </Box>
  )
}
