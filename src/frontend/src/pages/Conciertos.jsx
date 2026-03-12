import {
  Box,
  Button,
  Heading,
  HStack,
  Image,
  Skeleton, Text,
  useDisclosure,
  Wrap, WrapItem,
} from "@chakra-ui/react";
import { useEffect, useState } from 'react';
import Carrusel from "../components/Artistas";
import Evento from "../components/Concierto";
import FiltrosEventos from '../components/FiltrosConciertos';
import api from "../services/api";

export default function Eventos() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [selectedArtist, setSelectedArtist] = useState('');

  const handleArtistFromCarrusel = (artista) => {
    setSelectedArtist(artista);
  };

  const handleClearFilters = () => {
    setSelectedArtist('');
  };

  const [conciertos, setConciertos] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchConciertos = async (filtros) => {
    setLoading(true);

    const params = {}

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConciertos();
  }, []);

  return (
    <Box pb={5}>
      {/* Imagen */}
      <Image
        src='/concert.jpg'
        filter='auto'
        blur='2px'
        maxW="100hv"
        mt={-48}
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
          size='lg'
          onClick={onOpen}
        >
          Filtros
        </Button>

        <FiltrosEventos
          isOpen={isOpen}
          onClose={onClose}
          onApply={fetchConciertos}
          artistaSeleccionado={selectedArtist}
          onClear={handleClearFilters}
        />
      </Box>

      {/* Artistas */}
      <Carrusel onSelectArtista={handleArtistFromCarrusel} artistaSeleccionado={selectedArtist} />

      {/* Eventos */}
      <Heading ml={5} mt={5} mb={4} color='white' align='center'>Todos los conciertos</Heading>
      <Wrap spacing={10} justify='center' align='center'>
        {loading ? (
          <HStack spacing={4} justify='center'>
            {[...Array(3)].map((_, i) => (
              <Skeleton
                key={i}
                h={280}
                w={240}
                borderRadius={30}
                bg="whiteAlpha.300"
                p={4}
              />
            ))}
          </HStack>
        ) : (
          conciertos.length > 0 ? (
            conciertos.map((c) => (
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
                />
              </WrapItem>
            ))
          ) : (
            <Text
              bg='whiteAlpha.400'
              color='white'
              py={2}
              px={3}
              borderRadius={20}
              fontSize='2xl'
              fontWeight='medium'
            >
              No se encontraron conciertos con los filtros aplicados.
            </Text>
          )
        )}
      </Wrap>
    </Box>
  );
}
