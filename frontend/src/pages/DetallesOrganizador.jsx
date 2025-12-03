import {
  Box, Text, Heading, Grid,
  GridItem, Wrap, WrapItem, Stat,
  StatLabel, StatNumber, StatHelpText, StatGroup,
} from '@chakra-ui/react';
import formatoPrecio from '../utils/FormatoPrecio'
import Evento from "../components/Concierto";
import Pago from "../components/Pago";

const eventos = [
  {
    id: '1',
    imagen: 'https://www.musikblog.de/wp-content/uploads/2022/08/Pale_Waves_Credit_Dirty_Hit-8.jpg',
    artista: 'Pale Waves',
    titulo: 'Pale Waves – “Neon Nights Tour – Buenos Aires”',
    fecha: '04/11/2025',
    genero: 'Indie Pop',
    estado: 'Programado'
  },
  {
    id: '2',
    imagen: 'https://i.scdn.co/image/ab67616d0000b2730315d0b066cebbdd7128a764',
    artista: 'Chaos Chaos',
    titulo: 'Chaos Chaos – “Bright Futures Live Set”',
    fecha: '04/11/2025',
    genero: 'Indie Electronic',
    estado: 'Agotado'
  },
  {
    id: '4',
    imagen: 'https://i.scdn.co/image/ab67616d0000b273d6dfb454b77efaccc1371d14',
    artista: 'iDKHOW',
    titulo: 'iDKHOW – “RetroFuture Live Experience”',
    fecha: '04/11/2025',
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
    monto: 245000,
    entradas: [
      {
        nombre: 'General',
        cantidad: 1,
        precio: 25000,
      },
      {
        nombre: 'VIP Access Early',
        cantidad: 4,
        precio: 220000,
      },
    ]
  },
]

export default function DetallesUsuarios() {
  const organizador = [
    { label: 'Email', value: 'lian@gmail.com' },
    { label: 'Fecha nacimiento', value: '18/12/2003' },
    { label: 'Fecha en que se creó la cuenta', value: '11/11/2025' },
    { label: 'Último inicio de sesión', value: '19/11/2025 17:23hs' },
    { label: 'Suspendido?', value: 'No' },
    { label: 'Activo?', value: 'Si' },
  ]

  const conciertos = [
    { label: 'Creados', value: 7 },
    { label: 'Programados', value: 1 },
    { label: 'Cancelados', value: 2 },
    { label: 'Agotados', value: 3 },
    { label: 'Entradas creadas', value: 44500 },
    { label: 'Ocupación promedio', value: '79.01%' },
  ]

  return (
    <Box p={5}>
      <Grid 
        templateColumns='repeat(3, 1fr)'
        gap={4}
      >
        <GridItem color='white' colSpan={1}>
          <Heading mb={4} align='center'>Organizador Lian Iribarne</Heading>
          <Wrap justify='center'>
            {organizador.map((o, i) => (
              <WrapItem 
                bg='whiteAlpha.400' 
                fontWeight='medium' 
                px={2}
                py={1}
                borderRadius={20}
                display='inline-block'
                key={i}
              >
                <Text as='span'>{o.label}</Text>{' '}
                <Text 
                  as='span' 
                  bg='blackAlpha.300' 
                  px={2} 
                  pb={0.5}
                  borderRadius={20}
                >
                  {o.value}
                </Text>
              </WrapItem>
            ))}
          </Wrap>

          <Heading my={4} fontSize='2xl' align='center'>Conciertos</Heading>
          <Wrap justify='center'>
            {conciertos.map((c, i) => (
              <WrapItem 
                bg='whiteAlpha.400' 
                fontWeight='medium' 
                px={2}
                py={1}
                borderRadius={20}
                display='inline-block'
                key={i}
              >
                <Text as='span'>{c.label}</Text>{' '}
                <Text 
                  as='span' 
                  bg='blackAlpha.300' 
                  px={2} 
                  pb={0.5}
                  borderRadius={20}
                >
                  {c.value}
                </Text>
              </WrapItem>
            ))}
          </Wrap>

          <Heading my={4} fontSize='2xl' align='center'>Últimos cambios</Heading>
          <Wrap justify='center'>
            
          </Wrap>
        </GridItem>

        <GridItem colSpan={2}>
          <Heading mb={4} color='white' align='center'>Últimos conciertos creados</Heading>
          <Grid templateColumns='repeat(3, 1fr)' ml={20}>
            {eventos.map((e) => (
              <GridItem key={e.id}>
                <Evento {...e}/>
              </GridItem>
            ))}
          </Grid>

          <Heading my={4} color='white' align='center'>Últimas ventas registradas</Heading>
          <Wrap spacing={10} align='center' justify='center'>
            {pagos.map((p) => (
              <WrapItem align='center' key={p.codigo}>
                <Pago {...p}/>
              </WrapItem>
            ))}
          </Wrap>
        </GridItem>

        <GridItem colSpan={3} color='white'>
          <Heading my={4} align='center'>Analítica</Heading>
          <StatGroup justify='center' align='center'>
            <Stat px={2}>
              <StatLabel>Ingreso total generado</StatLabel>
              <StatNumber>${formatoPrecio(678245000)}</StatNumber>
            </Stat>
            <Stat px={2}>
              <StatLabel>Ingreso promedio por concierto</StatLabel>
              <StatNumber>${formatoPrecio(8245000)}</StatNumber>
            </Stat>
            <Stat px={2}>
              <StatLabel>Promedio para vender el 50% por concierto</StatLabel>
              <StatNumber>14 días</StatNumber>
            </Stat>
            <Stat px={2}>
              <StatLabel>Reservas totales</StatLabel>
              <StatNumber>561</StatNumber>
            </Stat>
            <Stat px={2}>
              <StatLabel>Reservas expiradas</StatLabel>
              <StatNumber>201</StatNumber>
            </Stat>
            <Stat px={2}>
              <StatLabel>Reservas finalizadas</StatLabel>
              <StatNumber>360</StatNumber>
            </Stat>
            <Stat px={2}>
              <StatLabel>Ratio (reserva - compra)</StatLabel>
              <StatNumber>{(360 / 561) * 100}%</StatNumber>
            </Stat>
          </StatGroup>
        </GridItem>

        <GridItem colSpan={3}>
          <Heading my={4} color='white' align='center'>Conciertos creados</Heading>
          <Wrap spacing={10} align='center' justify='center'>
            {eventos.map((e) => (
              <WrapItem key={e.id}>
                <Evento {...e}/>
              </WrapItem>
            ))}
          </Wrap>
        </GridItem>
      </Grid>
    </Box>
  )
}
