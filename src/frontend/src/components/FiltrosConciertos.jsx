import { useState, useEffect } from 'react';
import {
  Box, Button, Drawer, DrawerOverlay,
  DrawerContent, DrawerBody, Menu, MenuButton,
  MenuList, MenuItem, Input,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons'
import api from '../services/api'
import { useAuth } from "../services/AuthContext";

export default function FiltrosEventos({ isOpen, onClose, onApply, artistaSeleccionado, onClear }) {
  const [categoria, setCategoria] = useState(null);
  const [provincia, setProvincia] = useState(null);
  const [estado, setEstado] = useState(null);
  const [mood, setMood] = useState(null);
  const [rango_horario, setHorario] = useState('');
  const [artista, setArtista] = useState(null);
  const [artistaNombre, setArtistaNombre] = useState('');

  const limpiar = () => {
    setCategoria(null);
    setCategoriaSel('')
    setProvincia(null);
    setProvinciaSel('')
    setEstado(null);
    setEstadoSel('')
    setMood(null);
    setMoodSel('')
    setHorario('');
    setArtista(null);
    setArtistaNombre('');
  };

  const handleApply = () => {
    onApply({
      categoria,
      provincia,
      estado,
      mood,
      rango_horario,
      artista,
    });
    onClose(); 
  };

  useEffect(() => {
    if (artistaSeleccionado) {
      setArtista(artistaSeleccionado.id);
      setArtistaNombre(artistaSeleccionado.nombre);
    } else {
      setArtista(null);
      setArtistaNombre('');
    }
  }, [artistaSeleccionado]);

  const [moods, setMoods] = useState([])
  const [moodSel, setMoodSel] = useState('')

  useEffect(() => {
    if (!isOpen) return

    api.get("/conciertos/concierto-meta/?tipo=mood")
      .then(res => setMoods(res.data.results))
      .catch(console.error)
  }, [isOpen])

  const [estados, setEstados] = useState([])
  const [estadoSel, setEstadoSel] = useState('')

  useEffect(() => {
    if (!isOpen) return

    api.get("/conciertos/concierto-meta/?tipo=estado")
      .then(res => setEstados(res.data.results))
      .catch(console.error)
  }, [isOpen])

  const [provincias, setProvincias] = useState([])
  const [provinciaSel, setProvinciaSel] = useState(null)

  useEffect(() => {
    if (!isOpen) return

    api.get("/conciertos/provincias/")
      .then(res => setProvincias(res.data))
      .catch(console.error)
  }, [isOpen])

  const [categorias, setCategorias] = useState([])
  const [categoriaSel, setCategoriaSel] = useState("")

  useEffect(() => {
    if (!isOpen) return;

    api.get("/conciertos/categorias/")
      .then(res => setCategorias(res.data))
      .catch(err => console.error(err));
  }, [isOpen]);

  const { user } = useAuth();

  return (
    <Drawer placement="right" isOpen={isOpen} onClose={onClose} size="xs">
      <DrawerOverlay />
      <DrawerContent bg="whiteAlpha.900">
        <DrawerBody alignSelf='center' align='center' mt={20}>

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
              {categoriaSel || "Categoría"}
            </MenuButton>
            <MenuList maxH="200px" overflowY="auto">
              {categorias.map(c => (
                <MenuItem
                  key={c.id}
                  onClick={() => {
                    setCategoriaSel(c.nombre)
                    setCategoria(c.id)
                  }}
                >
                  {c.nombre}
                </MenuItem>
              ))}
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
              {provinciaSel || "Provincia"}
            </MenuButton>
            <MenuList maxH="200px" overflowY="auto">
              {provincias.map(p => (
                <MenuItem
                  key={p.id}
                  onClick={() => {
                    setProvinciaSel(p.nombre)
                    setProvincia(p.id)
                  }}
                >
                  {p.nombre}
                </MenuItem>
              ))}
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
              {estadoSel || "Estado"}
            </MenuButton>
            <MenuList maxH="200px" overflowY="auto">
              {estados.map(e => (
                <MenuItem
                  key={e.id}
                  display={user?.rol === 'Cliente' && e.nombre === 'Borrador' ? 'none' : undefined}
                  onClick={() => {
                    setEstadoSel(e.nombre)
                    setEstado(e.id)
                  }}
                >
                  {e.nombre}
                </MenuItem>
              ))}
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
              {moodSel || "Mood"}
            </MenuButton>
            <MenuList maxH="200px" overflowY="auto">
              {moods.map(m => (
                <MenuItem
                  key={m.id}
                  onClick={() => {
                    setMoodSel(m.nombre)
                    setMood(m.id)
                  }}
                >
                  {m.nombre}
                </MenuItem>
              ))}
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
              {rango_horario || "Rango Horario"}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setHorario("Tarde")}>Tarde (12:00 - 18:00)</MenuItem>
              <MenuItem onClick={() => setHorario("Noche")}>Noche (18:00 - 23:00)</MenuItem>
              <MenuItem onClick={() => setHorario("Madrugada")}>Madrugada (23:00 - 05:00)</MenuItem>
            </MenuList>
          </Menu>

          {/* ARTISTA */}
          <Input 
            placeholder={`Artista: ${ artistaNombre || 'Todos'}`}
            _placeholder={{ opacity: 1, color: 'gray.900', fontWeight: 'semibold', textAlign: 'center' }}
            variant='custom'
            isReadOnly
            rounded='full'
            mb={6}
          />

          <Box mb={2} align='center'>
            <Button rounded='full' mr={3} onClick={onClose} colorScheme='blackAlpha'>
              Cerrar
            </Button>
            <Button 
              rounded='full' 
              onClick={() => {
                limpiar();
                onClear();
              }}
              colorScheme='blackAlpha'
            >
              Limpiar
            </Button>
          </Box>

          <Button rounded='full' onClick={handleApply} colorScheme='blackAlpha'>
            Aplicar filtros
          </Button>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
