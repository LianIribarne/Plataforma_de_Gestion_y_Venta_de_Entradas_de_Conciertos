import { Box, HStack, Avatar, IconButton, Tooltip, SkeletonCircle } from "@chakra-ui/react";
import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";
import { useRef, useState, useEffect } from "react";
import api from "../services/api";

export default function Carrusel({ onSelectArtista, artistaSeleccionado }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth / 2 : clientWidth / 2;
      scrollRef.current.scrollTo({
        left: scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const [artistas, setArtistas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/conciertos/artistas/")
      .then(res => setArtistas(res.data.results))
      .catch(err => console.error(err))
      .finally(setLoading(false))
  }, []);

  return (
    <Box>
      <HStack
        ref={scrollRef}
        spacing={4}
        overflowX="scroll"
        px={4}
        py={4}
        pt={8}
        scrollBehavior="smooth"
        justify={artistas.length < 13 ? 'center' : undefined}
        css={{
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {loading ? (
          <HStack spacing={4} justify='center'>
            {[...Array(9)].map((_, i) => (
              <SkeletonCircle
                key={i}
                size={28}
                bg="whiteAlpha.300"
              />
            ))}
          </HStack>
        ) : (
          artistas.map((a) => (
            <Tooltip 
              key={a.id}  
              label={a.nombre} 
              hasArrow  
              placement="top"  
              bg="gray.100" 
              color='gray.900'
              closeOnClick={false}
              openDelay={250}
            >
              <Avatar 
                key={a.id} 
                name={a.nombre} 
                src={a?.imagen} 
                boxSize="100px" 
                onClick={() => onSelectArtista({ id: a.id, nombre: a.nombre })}
                filter={artistaSeleccionado === '' || artistaSeleccionado.nombre === a.nombre ? 'grayscale(1%)' : 'blur(2px)'}
                sx={{
                  cursor: "pointer",
                  transition: "transform 0.25s ease",
                  transform: artistaSeleccionado.nombre === a.nombre ? 'scale(1.3) translateY(-10px)': undefined,
                  "&:hover": {
                    transform: "scale(1.3) translateY(-10px)",
                    filter: 'blur(0px)',
                  },
                }}
              />
            </Tooltip>
          ))
        )}
      </HStack>

      <Box align='center' display={artistas.length > 13 ? 'block' : 'none'}>
        {/* flecha izq */}
        <IconButton
          colorScheme='whiteAlpha'
          aria-label="left"
          icon={<ArrowLeftIcon color='white' />}
          onClick={() => scroll("left")}
          isRound={true}
          mr={8}
          _hover={{ transform: 'scale(1.3)' }}
        />

        {/* flecha der */}
        <IconButton
          colorScheme='whiteAlpha'
          aria-label="right"
          icon={<ArrowRightIcon color='white' />}
          onClick={() => scroll("right")}
          isRound={true}
          _hover={{ transform: 'scale(1.3)' }}
        />
      </Box>
    </Box>
  );
}
