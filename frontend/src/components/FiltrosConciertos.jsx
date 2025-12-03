import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons'

export default function FiltrosEventos({ isOpen, onClose, onApply, artistaSeleccionado, onClear }) {
  const [categoria, setCategoria] = useState('');
  const [provincia, setProvincia] = useState('');
  const [entradas, setEntradas] = useState('');
  const [estado, setEstado] = useState('');
  const [mood, setMood] = useState('');
  const [horario, setHorario] = useState('');
  const [artista, setArtista] = useState('');

  const limpiar = () => {
    setCategoria('');
    setProvincia('');
    setEntradas('');
    setEstado('');
    setMood('');
    setHorario('');
    setArtista('');
  };

  const handleApply = () => {
    onApply({
      categoria,
      provincia,
      entradas,
      estado,
      mood,
      horario,
      artista,
    });
    onClose(); 
  };

  useEffect(() => {
    if (artistaSeleccionado) {
      setArtista(artistaSeleccionado);
    }
  }, [artistaSeleccionado]);

  return (
    <Drawer placement="right" isOpen={isOpen} onClose={onClose} size="xs">
      <DrawerOverlay />
      <DrawerContent bg="whiteAlpha.700">
        <DrawerBody alignSelf='center' align='center' mt={20}>
          
          {/* ENTRADAS */}
          <Menu>
            <MenuButton 
              as={Button} 
              rightIcon={<ChevronDownIcon />} 
              rounded='full' 
              mb={6}
              w="100%"
              bg="whiteAlpha.800"
            >
              {entradas || "Entradas"}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setEntradas("Disponibles")}>Disponibles</MenuItem>
              <MenuItem onClick={() => setEntradas("Agotadas")}>Agotadas</MenuItem>
            </MenuList>
          </Menu>

          {/* CATEGORIA */}
          <Menu>
            <MenuButton 
              as={Button} 
              rightIcon={<ChevronDownIcon />} 
              rounded='full' 
              mb={6}
              w="100%"
              bg="whiteAlpha.800"
            >
              {categoria || "Categoría"}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setCategoria("Rock")}>Rock</MenuItem>
              <MenuItem onClick={() => setCategoria("Metal")}>Metal</MenuItem>
              <MenuItem onClick={() => setCategoria("Pop")}>Pop</MenuItem>
              <MenuItem onClick={() => setCategoria("Electronica")}>Electrónica</MenuItem>
              <MenuItem onClick={() => setCategoria("Indie")}>Indie</MenuItem>
              <MenuItem onClick={() => setCategoria("Hip-Hop")}>Hip-Hop</MenuItem>
            </MenuList>
          </Menu>

          {/* PROVINCIA */}
          <Menu>
            <MenuButton 
              as={Button} 
              rightIcon={<ChevronDownIcon />} 
              rounded='full' 
              mb={6}
              w="100%"
              bg="whiteAlpha.800"
            >
              {provincia || "Provincia"}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setProvincia("Buenos Aires")}>Buenos Aires</MenuItem>
              <MenuItem onClick={() => setProvincia("Córdoba")}>Córdoba</MenuItem>
              <MenuItem onClick={() => setProvincia("Santa Fe")}>Santa Fe</MenuItem>
              <MenuItem onClick={() => setProvincia("Mendoza")}>Mendoza</MenuItem>
              <MenuItem onClick={() => setProvincia("Tucumán")}>Tucumán</MenuItem>
            </MenuList>
          </Menu>

          {/* ESTADO */}
          <Menu>
            <MenuButton 
              as={Button} 
              rightIcon={<ChevronDownIcon />} 
              rounded='full' 
              mb={6}
              w="100%"
              bg="whiteAlpha.800"
            >
              {estado || "Estado"}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setEstado("Programado")}>Programado</MenuItem>
              <MenuItem onClick={() => setEstado("Cancelado")}>Cancelado</MenuItem>
              <MenuItem onClick={() => setEstado("Finalizado")}>Finalizado</MenuItem>
            </MenuList>
          </Menu>

          {/* MOOD */}
          <Menu>
            <MenuButton 
              as={Button} 
              rightIcon={<ChevronDownIcon />} 
              rounded='full' 
              mb={6}
              w="100%"
              bg="whiteAlpha.800"
            >
              {mood || "Mood"}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setMood("Para bailar")}>Para bailar</MenuItem>
              <MenuItem onClick={() => setMood("Fiestero")}>Fiestero</MenuItem>
              <MenuItem onClick={() => setMood("Chill")}>Chill</MenuItem>
              <MenuItem onClick={() => setMood("Romántico")}>Romántico</MenuItem>
              <MenuItem onClick={() => setMood("Íntimo")}>Íntimo</MenuItem>
              <MenuItem onClick={() => setMood("Enérgico")}>Enérgico</MenuItem>
            </MenuList>
          </Menu>

          {/* RANGO HORARIO */}
          <Menu>
            <MenuButton
              as={Button} 
              rightIcon={<ChevronDownIcon />} 
              rounded='full' 
              mb={6}
              w="100%"
              bg="whiteAlpha.800"
            >
              {horario || "Rango Horario"}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setHorario("Tarde")}>Tarde (12:00 - 18:00)</MenuItem>
              <MenuItem onClick={() => setHorario("Noche")}>Noche (18:00 - 23:00)</MenuItem>
              <MenuItem onClick={() => setHorario("Madrugada")}>Madrugada (23:00 - 05:00)</MenuItem>
            </MenuList>
          </Menu>

          {/* ARTISTA */}
          <Input 
            placeholder={`Artista: ${ artista || 'Todos'}`}
            _placeholder={{ opacity: 1, color: 'gray.900', fontWeight: 'semibold', textAlign: 'center' }}
            variant='custom'
            isReadOnly
            rounded='full'
            mb={6}
          />

          <Box mb={2} align='center'>
            <Button colorScheme="blackAlpha" rounded='full' mr={3} onClick={onClose}>
              Cerrar
            </Button>
            <Button 
              colorScheme="blackAlpha" 
              rounded='full' 
              onClick={() => {
                limpiar();
                onClear();
              }}
            >
              Limpiar
            </Button>
          </Box>

          <Button colorScheme="whiteAlpha" color='blackAlpha.900' rounded='full' onClick={handleApply}>
            Aplicar filtros
          </Button>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
