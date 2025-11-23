import { useState } from 'react';
import { 
  Select, 
  Box, 
  FormControl,
  FormLabel,
  Switch,
  Button,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from '@chakra-ui/react';

export default function FiltrosEventos({ isOpen, onClose, onApply }) {
  const [categoria, setCategoria] = useState('');
  const [provincia, setProvincia] = useState('');
  const [disponibilidad, setDisponibilidad] = useState(true);
  const [estado, setEstado] = useState('');
  const [mood, setMood] = useState('');

  const handleApply = () => {
    onApply({
      categoria,
      provincia,
      disponibilidad,
      estado,
      mood,
    });
    onClose(); 
  };

  return (
    <Drawer placement="right" isOpen={isOpen} onClose={onClose} size="xs">
      <DrawerOverlay />
      <DrawerContent bg="whiteAlpha.700">
        <DrawerHeader>Filtros</DrawerHeader>

        <DrawerBody alignSelf='center'>
          {/* DISPONIBILIDAD */}
          <Box mb={6} bg='whiteAlpha.800' px={2} pt={1} rounded='full'>
            <FormControl display='flex'>
              <FormLabel>
                Con disponibilidad
              </FormLabel>
              <Switch 
                ml={-2}
                mt={1}
                colorScheme="teal" 
                size='md' 
                isChecked={disponibilidad}
                onChange={(e) => setDisponibilidad(e.target.checked)}
              />
            </FormControl>
          </Box>

          {/* CATEGORIA */}
          <Select
            placeholder='Categoría'
            color='gray.900'
            bg='whiteAlpha.800'
            variant='custom'
            rounded='full'
            mb={6}
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            textAlign='center'
          >
            <option value='Rock'>Rock</option>
            <option value='Metal'>Metal</option>
            <option value='Pop'>Pop</option>
            <option value='Electronica'>Electrónica</option>
            <option value='Indie'>Indie</option>
            <option value='Hip-Hop'>Hip-Hop</option>
          </Select>

          {/* PROVINCIA */}
          <Select
            placeholder='Provincia'
            color='gray.900'
            bg='whiteAlpha.800'
            variant='custom'
            rounded='full'
            mb={6}
            value={provincia}
            onChange={(e) => setProvincia(e.target.value)}
            textAlign='center'
          >
            <option value='Buenos Aires'>Buenos Aires</option>
            <option value='Córdoba'>Córdoba</option>
            <option value='Santa Fe'>Santa Fe</option>
            <option value='Mendoza'>Mendoza</option>
            <option value='Tucumán'>Tucumán</option>
          </Select>

          {/* PROVINCIA */}
          <Select
            placeholder='Estado'
            color='gray.900'
            bg='whiteAlpha.800'
            variant='custom'
            rounded='full'
            mb={6}
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            textAlign='center'
          >
            <option value='Programado'>Programado</option>
            <option value='Cancelado'>Cancelado</option>
            <option value='Finalidad'>Finalizado</option>
          </Select>

          {/* MOOD */}
          <Select
            placeholder='Mood'
            color='gray.900'
            bg='whiteAlpha.800'
            variant='custom'
            rounded='full'
            mb={6}
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            textAlign='center'
          >
            <option value='Programado'>Programado</option>
            <option value='Cancelado'>Cancelado</option>
            <option value='Finalidad'>Finalizado</option>
          </Select>

          <Button colorScheme="blackAlpha" rounded='full' mr={3} onClick={onClose}>
            Cerrar
          </Button>
          <Button colorScheme="whiteAlpha" color='blackAlpha.900' rounded='full' onClick={handleApply}>
            Aplicar filtros
          </Button>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
