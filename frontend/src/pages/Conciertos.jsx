import {
  Image,
  Heading,
  Wrap,
  WrapItem,
  Box,
  useDisclosure,
  Button,
} from "@chakra-ui/react";
import { useState, useEffect } from 'react';
import Evento from "../components/Concierto";
import Carrusel from "../components/Artistas";
import FiltrosEventos from '../components/FiltrosConciertos';

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
    estado: 'Agotado'
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

  const [selectedArtist, setSelectedArtist] = useState('');

  // const [eventos, setEventos] = useState([]);

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

  return (
    <Box pb={5}>
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
          bg='whiteAlpha.800'
          color='blackAlpha.800'
          rounded='full' 
          fontSize='2xl' 
          size='lg' 
          onClick={onOpen}
        >
          Filtros
        </Button>

        <FiltrosEventos
          isOpen={isOpen} 
          onClose={onClose} 
          onApply={handleApplyFilters}
          artistaSeleccionado={selectedArtist}
          onClear={handleClearFilters}
        />
      </Box>

      {/* Artistas */}
      <Carrusel onSelectArtista={handleArtistFromCarrusel} artistaSeleccionado={selectedArtist} />

      {/* Nuevos Eventos */}
      <Heading ml={5} color='gray.200'>Lo más nuevo</Heading>
      <Wrap spacing={10} justify='center' align='center'>
        {eventos.map((e) => (
          <WrapItem key={e.id}>
            <Evento {...e}/>
          </WrapItem>
        ))}
      </Wrap>

      {/* Eventos */}
      <Heading ml={5} mt={5} color='gray.200'>Todos los conciertos</Heading>
      <Wrap spacing={10} justify='center' align='center'>
        {eventos.map((e) => (
          <WrapItem key={e.id}>
            <Evento {...e}/>
          </WrapItem>
        ))}
      </Wrap>
    </Box>
  );
}
