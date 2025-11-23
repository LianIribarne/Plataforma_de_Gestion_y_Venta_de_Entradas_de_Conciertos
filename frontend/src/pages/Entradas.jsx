import {
  Heading, 
  HStack,
  Grid, 
  GridItem,
  Text, 
  Box, 
  Checkbox,
  Button,
  AbsoluteCenter,
  Link,
} from "@chakra-ui/react";
import { useState } from 'react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import Entrada from '../components/Entrada'

const entradas = [
  {
    titulo: 'Pale Waves – “Neon Nights Tour – Buenos Aires”',
    estado: 'Programado',
    entradas: [
      {
        codigo: 'A9F3C1B27EF4',
        qr: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Commons_QR_code.png",
        artista: "Pale Waves",
        titulo: 'Pale Waves – “Neon Nights Tour – Buenos Aires”',
        fecha: "04.12.2025",
        puertas: "19:30hs",
        show: "21:00hs",
        tipo: "General",
        precio: 25000,
        estado: 'Disponible'
      },
      {
        codigo: 77880011,
        qr: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Commons_QR_code.png",
        artista: "Pale Waves",
        titulo: 'Pale Waves – “Neon Nights Tour – Buenos Aires”',
        fecha: "04.12.2025",
        puertas: "19:30hs",
        show: "21:00hs",
        tipo: "VIP Early Access",
        precio: 45000,
        estado: 'Disponible'
      }
    ]
  },
  {
    titulo: 'Metal Nights',
    estado: 'Cancelado',
    entradas: [
      {
        codigo: 2419,
        qr: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Commons_QR_code.png",
        artista: "Pale Waves",
        titulo: 'Pale Waves – “Neon Nights Tour – Buenos Aires”',
        fecha: "04.12.2025",
        puertas: "19:30hs",
        show: "21:00hs",
        tipo: "General",
        precio: 25000,
        estado: 'Cancelado'
      },
      {
        codigo: 7788,
        qr: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Commons_QR_code.png",
        artista: "Daft Punk",
        titulo: 'Metal Nights Patagonia',
        fecha: "30.12.2025",
        puertas: "20:00hs",
        show: "21:00hs",
        tipo: "VIP",
        precio: 5000,
        estado: 'Cancelado'
      }
    ]
  }
]

export default function Entradas() {
  const [selected, setSelected] = useState({});

  const toggleEntrada = (codigo) =>
    setSelected((s) => ({ ...s, [codigo]: !s[codigo] }));

  const toggleEvento = (ev) => {
    const next = { ...selected };
    const codes = ev.entradas.map((x) => x.codigo);
    const allSelected = codes.every((c) => next[c]);
    codes.forEach((c) => (next[c] = !allSelected));
    setSelected(next);
  };

  const imprimir = () => window.print();

  const anySelected = Object.values(selected).some(Boolean);

  return entradas.length > 0 ? (
    <>
      <Heading 
        align='center' 
        fontSize='6xl' 
        color='white' 
        mb={8}
      >
        Tus Entradas
      </Heading>
      
      {entradas.map((ev) => {
        const allChecked = ev.entradas.every((x) => selected[x.codigo]);

        return (
          <div key={ev.titulo}>
            <HStack>
              <Heading ml={3} color='white'>{ev.titulo}</Heading>
              <Button 
                onClick={imprimir} 
                size='sm' 
                mt={3}
                display={ev.estado === 'Cancelado' ? 'none' : 'block'}
                isDisabled={!anySelected}
              >
                Imprimir
              </Button>
            </HStack>

            {/* checkbox general del evento */}
            <Checkbox
              isChecked={allChecked}
              onChange={() => toggleEvento(ev)}
              mt={2}
              ml={3}
              size='lg'
              colorScheme="whiteAlpha"
              color='white'
              display={ev.estado === 'Cancelado' ? 'none' : 'inline-block' }
            />
            
            <Text 
              mt={1}
              ml={2}
              color='white'
              fontSize='lg'
              display={ev.estado === 'Cancelado' ? 'none' : 'inline-block' }
            >
              <b>Seleccionar todas</b>
            </Text>

            <Grid
              gap={4}
              rowGap={8}
              templateColumns="repeat(2, 740px)"
              p={3}
            >
              {ev.entradas.map((x) => (
                <GridItem key={x.codigo}>
                  <Entrada {...x} />

                  <HStack>
                    <Checkbox
                      isChecked={!!selected[x.codigo]}
                      onChange={() => toggleEntrada(x.codigo)}
                      size='lg'
                      colorScheme="whiteAlpha"
                      mt={2}
                      color='white'
                      display={x.estado === 'Cancelado' ? 'none' : 'inline-block' }
                    />
                    
                    <Text 
                      mt={1}
                      color='white'
                      fontSize='lg'
                      display={x.estado === 'Cancelado' ? 'none' : 'inline-block' }
                    >
                      <b>Seleccionar</b>
                    </Text>
                  </HStack>
                </GridItem>
              ))}
            </Grid>
          </div>
        );
      })}

      <div id="entrada-print">
        {entradas.map((ev) =>
          ev.entradas
            .filter((x) => selected[x.codigo])
            .map((x) => <Entrada key={x.codigo} {...x} />)
        )}
      </div>
    </>
  ) : (
    <AbsoluteCenter>
      <Box bg='whiteAlpha.500' p={4} borderRadius={8} color='white'>
        <Heading align='center'>No hay entradas adquiridas</Heading>
        <Text align='center'>
          <b>
            Para adquirir entradas, vaya a la seccion de{' '}
            <Link href='http://localhost:5173/eventos'>
              Eventos <ExternalLinkIcon mx='2px' mb={1} />
            </Link>
          </b>
        </Text>
      </Box>
    </AbsoluteCenter>
  )
}
