import {
  Image,
  Heading,
  Grid,
  GridItem,
  Box,
  useDisclosure,
  Button,
} from "@chakra-ui/react";
import { useState, useEffect } from 'react';
import Evento from "../components/Evento";
import Carrusel from "../components/Artistas";
import FiltrosEventos from '../components/FiltrosEventos';

const eventos = [
  {
    id: '1',
    imagen: 'https://www.musikblog.de/wp-content/uploads/2022/08/Pale_Waves_Credit_Dirty_Hit-8.jpg',
    artista: 'Pale Waves',
    titulo: 'Pale Waves – “Neon Nights Tour – Buenos Aires”',
    fecha: '04.11.2025',
    genero: 'Indie Pop',
    estado: 'Programado'
  },
  {
    id: '2',
    imagen: 'https://i.scdn.co/image/ab67616d0000b2730315d0b066cebbdd7128a764',
    artista: 'Chaos Chaos',
    titulo: 'Chaos Chaos – “Bright Futures Live Set”',
    fecha: '04.11.2025',
    genero: 'Indie Electronic',
    estado: 'Programado'
  },
  {
    id: '3',
    imagen: 'https://i.scdn.co/image/ab67616d0000b273df51a3d66223e5b01813e0c4',
    artista: 'Bring Me The Horizon',
    titulo: 'Bring Me The Horizon (BMTH) – “Post Human World Tour”',
    fecha: '04.11.2025',
    genero: 'Metalcore',
    estado: 'Cancelado'
  },
  {
    id: '4',
    imagen: 'https://i.scdn.co/image/ab67616d0000b273d6dfb454b77efaccc1371d14',
    artista: 'iDKHOW',
    titulo: 'iDKHOW – “RetroFuture Live Experience”',
    fecha: '04.11.2025',
    genero: 'Alternative Pop',
    estado: 'Programado'
  },
]

export default function Eventos() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  // const [eventos, setEventos] = useState([]);

  const handleApplyFilters = async (filtros) => {
    const params = new URLSearchParams(filtros);
    const res = await axios.get(`/api/eventos/?${params.toString()}`);
    setEventos(res.data);
  };

  return (
    <Box>
      {/* Imagen */}
      <Image
        src='/concert.jpg'
        filter='auto' 
        blur='2px'
        maxW="100hv"
        mt={-48}
        mb={10}
        objectFit="cover"
        sx={{
          WebkitMaskImage:
            "linear-gradient(to top, transparent 0%, black 50%)",
          maskImage:
            "linear-gradient(to top, transparent 0%, black 100%)",
        }}
      />
      
      <Box 
        position='absolute' 
        align='center'
        mt='-50vh' 
        left='50%'
        transform='translateX(-50%)'
      >
        <Heading
          textAlign='center'
          mb={14}
          color='whiteAlpha.400'
          sx={{
            WebkitTextStroke: '2px white',
          }}
          fontWeight='extrabold'
          fontSize='5xl'
        >
          TU ENTRADA AL SONIDO EN VIVO
        </Heading>
        
        <Button 
          colorScheme="whiteAlpha" 
          rounded='full' 
          fontSize='2xl' 
          borderColor='white'
          border='2px'
          size='lg' 
          onClick={onOpen}
        >
          Filtros
        </Button>

        <FiltrosEventos
          isOpen={isOpen} 
          onClose={onClose} 
          onApply={handleApplyFilters}
        />
      </Box>

      {/* Nuevos Eventos */}
      <Carrusel />
      <Heading ml={5} color='gray.200'>Lo más nuevo</Heading>
      <Grid templateColumns='repeat(auto-fill, minmax(200px, 1fr))' columnGap={16} px={5} py={5}>
        {eventos.map((e) => (
          <GridItem key={e.id}>
            <Evento {...e}/>
          </GridItem>
        ))}
      </Grid>

      {/* Eventos */}
      <Heading ml={5} mt={5} color='gray.200'>Todos los conciertos</Heading>
      <Grid templateColumns='repeat(auto-fill, minmax(200px, 1fr))' columnGap={16} rowGap={4} px={5} py={5}>
        {eventos.map((e) => (
          <GridItem key={e.id}>
            <Evento {...e}/>
          </GridItem>
        ))}
      </Grid>
    </Box>
  );
}
