import { useParams, useLocation  } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Image, 
  Grid, 
  GridItem, 
  AspectRatio, 
  Button,
  Accordion,
  useToast,
  SimpleGrid,
} from '@chakra-ui/react';
import { FaMapMarkerAlt } from "react-icons/fa";
import { IoTicketSharp } from "react-icons/io5";
import { InfoOutlineIcon, ArrowRightIcon, CalendarIcon, TimeIcon } from '@chakra-ui/icons';
import EntradaInfo from '../components/ReservaEntrada';

const entradas = [
  {
    tipo: 'General',
    disponibles: 2034,
    reservadas: 7,
    precio: 3044,
    cantMax: 6
  },
  {
    tipo: 'VIP',
    disponibles: 2034,
    reservadas: 7,
    precio: 4300,
    cantMax: 3
  },
  {
    tipo: 'VIP+',
    disponibles: 2034,
    reservadas: 7,
    precio: 5020,
    cantMax: 1
  },
]

export default function EventoDetalle() {
  const { slug } = useParams();
  const location = useLocation();
  const data = location.state; // 👈 acá tenés lo que mandaste desde el Link
  
  const toast = useToast()
  const id = 'toast-activo';

  const TOTAL_MAX = 6;
  
  // Obtener cantidades de entradas
  const [cantidades, setCantidades] = useState({});

  const handleCantidadChange = (tipo, valor) => {
    setCantidades(prev => ({
      ...prev,
      [tipo]: valor,
    }))
  }

  const totalReserva = Object.values(cantidades).reduce(
    (acc, n) => acc + (Number(n) || 0),
    0
  )

  const totalGlobal = entradas.reduce((acc, entrada) => {
    const cant = cantidades[entrada.tipo] ?? 0;
    return acc + cant * entrada.precio;
  }, 0);

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

    // Si NO superó límite pero hay total
    if (totalGlobal > 0) {
      if (!toast.isActive(id)) {
        toast({
          id,
          title: 'Precio total',
          description: `Total del precio por las entradas $${totalGlobal}`,
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
          description: `Total del precio por las entradas $${totalGlobal}`,
          status: 'info',
        });
      }
      return;
    }

    // Si no hay límite superado NI total → cerrar
    toast.close(id);

  }, [limiteSuperado, totalGlobal, toast]);

  useEffect(() => {
    return () => {
      toast.closeAll();   // o toast.close(id) si querés
    };
  }, []);

  if (!data) {
    // Si alguien entra directo por URL sin pasar por Link, podrías hacer un fetch acá
    return <Text>No se encontraron datos para este evento.</Text>;
  }

  return (
    <Box px={5} pb={5}>
      {/* Titulo */}
      <Heading 
        as='h1' 
        color='gray.200'
        mb={2}
        w='70%'
      >
        {data.titulo}
      </Heading>
      <Heading 
        as='h2' 
        color='gray.300'
        mb={4}
        w='70%'
        fontSize='sm'
      >
        Artista: Avatar Metal - Categoria: Metal - Pais de origen: Suecia
      </Heading>

      {/* Evento */}
      <Grid templateColumns='repeat(2, 1fr)'>

        {/* Imagen */}
        <GridItem align='center' color='gray.200' ml={8}>
          <SimpleGrid columns={2} spacing={10}>
            <Image 
              src={data.imagen} 
              maxW="400px" 
              borderRadius={10} 
            />

            <Box my={12} ml={20} fontSize='xl' color='whiteAlpha.800' bg='whiteAlpha.400' borderRadius={10}>
              <Heading fontSize='2xl' my={3}>
                <CalendarIcon mb={1} />{' '}
                Fecha{' '}
                <CalendarIcon mb={1} />
              </Heading>
              <Box display='inline-block' border='2px' borderColor='whiteAlpha.500' borderRadius={8} p={3}>
                <b>30<br />
                Noviembre</b>
              </Box><br />
              <Heading fontSize='2xl' my={3}>
                <TimeIcon mb={1} />{' '}
                Horarios{' '}
                <TimeIcon mb={1} />
              </Heading>
              <Box display='inline-block' border='2px' borderColor='whiteAlpha.500' borderRadius={8} p={3}>
                <b>Puertas <ArrowRightIcon mb={1} boxSize={4} /> 19:20hs<br />
                Show <ArrowRightIcon mb={1} boxSize={4} /> 19:50hs</b>
              </Box>
            </Box>
          </SimpleGrid>

          {/* Acerca del concierto */}
          <Heading fontSize='4xl' mt={6} mb={4}>Acerca del Concierto</Heading>
          <Text as='b'>
            Pale Waves es una banda británica de indie rock de Manchester, formada en 2014. Se fundó originalmente como Creek cuando la cantante y guitarrista Heather Baron-Gracie conoció a la baterista Ciara Doran mientras asistía a la universidad en Manchester.
          </Text>
        </GridItem>

        {/* Entradas */}
        <GridItem align='center'>
          <Heading 
            as='h2' 
            color='gray.200'
            fontSize='3xl'
            mb={4}
          >
            <IoTicketSharp style={{ display: 'inline', marginBottom: '-4' }} />{' '}
            Entradas{' '}
            <IoTicketSharp style={{ display: 'inline', marginBottom: '-4' }} />
          </Heading>

          <Accordion allowToggle bg='whiteAlpha.400' borderColor='whiteAlpha.50' py={5} width='600px' borderRadius={20}>
            {entradas.map((e) => (
              <EntradaInfo
                key={e.tipo}
                tipo={e.tipo}
                disponibles={e.disponibles}
                reservadas={e.reservadas}
                precio={e.precio}
                cantMax={e.cantMax}
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
              <InfoOutlineIcon boxSize={3} mb={0.5} /> Podés reservar hasta {TOTAL_MAX} entradas en total.
            </Text>

            <Button 
              colorScheme='whiteAlpha'
              mt={2}
              isDisabled={totalReserva === 0 || limiteSuperado ? true: false}
              size='lg'
              rounded='full'
              transition="all 0.3s ease"
              _hover={{ transform: 'scale(1.1)' }}
            >
              Reservar
            </Button>
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
              <Text as='b' color='gray.200'>
                Direccion <ArrowRightIcon mb={1} boxSize={3} /> Paso de los Andes 3013<br />
                Ciudad <ArrowRightIcon mb={1} boxSize={3} /> Rio Grande<br />
                Provincia <ArrowRightIcon mb={1} boxSize={3} /> Tierra del Fuego<br />
                Lugar <ArrowRightIcon mb={1} boxSize={3} /> Movistar Arena
              </Text>
            </Box>
            <AspectRatio 
              maxW="300px" 
              ratio={16 / 9}
            >
              <iframe
                style={{ border: 0, borderRadius: '12px' }}
                loading="lazy"
                allowFullScreen
                src='https://www.google.com/maps?q=Paso+de+los+Andes+3013+Río+Grande+Tierra+del+Fuego&output=embed' //aca hay que colocar variables: provincia, ciudad, y direccion
              ></iframe>
            </AspectRatio>
          </SimpleGrid>
        </GridItem>
      </Grid>
    </Box>
  );
}
