import { ChevronDownIcon, EditIcon, LockIcon, UnlockIcon } from '@chakra-ui/icons';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Avatar, Badge,
  Box,
  Button,
  Heading,
  HStack,
  Input,
  Menu, MenuButton,
  MenuItem,
  MenuList,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Skeleton,
  Text,
  useDisclosure,
  useToast,
  Wrap, WrapItem,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import ModificarArtista from "../components/ModificarArtista";
import api from '../services/api';
import { endpoints } from '../services/endpoints';

function Artista({ id, nombre, imagen, categoria, estadoArtista }) {
  const { isOpen, onToggle, onClose } = useDisclosure();
  const toast = useToast();

  const {
    isOpen: isModificarOpen,
    onOpen: onModificarOpen,
    onClose: onModificarClose
  } = useDisclosure();

  const [estado, setEstado] = useState(estadoArtista)

  const cancelEstadoRef = useRef()
  const {
    isOpen: isEstadoOpen,
    onOpen: onEstadoOpen,
    onClose: onEstadoClose
  } = useDisclosure();

  useEffect(() => {
    setEstado(estadoArtista)
  }, [estadoArtista])

  const handleToggleEstado = async () => {
    if (estado) {
      onEstadoOpen()
    } else {
      actualizarEstado(true)
    }
  }

  const actualizarEstado = async (nuevoEstado) => {
    try {
      setEstado(nuevoEstado)

      await api.patch(
        endpoints.conciertos.modificar_artista(id),
        { activo: nuevoEstado }
      )

      toast({
        title: !nuevoEstado ? 'Se suspendio al artista': 'Se reactivo al artista',
        status: "success",
        duration: 2000,
        isClosable: true,
        position: 'top',
      });

      onEstadoClose()
    } catch (error) {
      setEstado(!nuevoEstado)

      toast({
        title: 'No se pudo realizar el cambio',
        status: "error",
        duration: 2000,
        isClosable: true,
        position: 'top',
      });
    }
  }

  return (
    <>
      <Popover isOpen={isOpen} onClose={onClose}>
        <PopoverTrigger>
          <WrapItem
            as="button"
            onClick={onToggle}
            bg='whiteAlpha.300'
            borderRadius={30}
            transition="transform 0.3s ease"
            _hover={{ background: 'whiteAlpha.500', cursor: 'pointer', transform: 'translateY(-6px)' }}
          >
            <Badge fontSize='md' position='absolute'>
              {categoria}
            </Badge>
            <Box p={4} mt={4}>
              <Avatar
                w={170}
                h='auto'
                src={imagen}
                mb={2}
              />
              <br />
              <Text color='whiteAlpha.900' as='b' fontSize='2xl'>{nombre}</Text>
            </Box>
            <Badge colorScheme={estado ? "green" : "red"} fontSize='md' position='absolute' mt={8}>
              {estado ? undefined : "Suspendido"}
            </Badge>
          </WrapItem>
        </PopoverTrigger>

        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader><b>Opciones</b></PopoverHeader>
          <PopoverBody>
            <Wrap align='center' justify='center'>
              <WrapItem>
                <Button
                  leftIcon={<EditIcon />}
                  size='sm'
                  rounded='full'
                  variant='solid'
                  onClick={onModificarOpen}
                  colorScheme='teal'
                >
                  Modificar
                </Button>
              </WrapItem>

              <WrapItem>
                <Button
                  size="sm"
                  rounded='full'
                  colorScheme={estado ? "red" : "green"}
                  onClick={handleToggleEstado}
                >
                  {estado ? <LockIcon mr={1} /> : <UnlockIcon mr={1} />}
                  {estado ? "Suspender artista" : "Reactivar artista"}
                </Button>
              </WrapItem>
            </Wrap>
          </PopoverBody>
        </PopoverContent>
      </Popover>

      <ModificarArtista isOpen={isModificarOpen} onClose={onModificarClose} id={id} />

      <AlertDialog
        isOpen={isEstadoOpen}
        leastDestructiveRef={cancelEstadoRef}
        onClose={onEstadoClose}
        isCentered
      >
        <AlertDialogOverlay backdropFilter='blur(10px) invert(100%)'>
          <AlertDialogContent bg='red.600' color='white' alignSelf='center'>
            <AlertDialogHeader fontSize='2xl'>
              Suspender Artista
            </AlertDialogHeader>

            <AlertDialogBody>
              ¿Estás seguro que querés suspender este artista?
              <br />
              No se podra crear conciertos con este artista.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelEstadoRef} onClick={onEstadoClose} rounded='full'>
                Cancelar
              </Button>

              <Button
                colorScheme="red"
                ml={3}
                rounded='full'
                onClick={() => actualizarEstado(false)}
              >
                Suspender
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}

export default function Artistas() {
  const [loading, setLoading] = useState(false)
  const [artistas, setArtistas] = useState([])

  const filtrosInicial = {
    categoria: null,
    pais_origen: null,
    nombre: "",
    estado: null
  }

  const [filtrosDraft, setFiltrosDraft] = useState(filtrosInicial);

  const [categorias, setCategorias] = useState([])
  const [categoriaSel, setCategoriaSel] = useState("")

  const [paises, setPaises] = useState([])
  const [pais_origenSel, setPais_origenSel] = useState("")

  const fetchArtistas = async (filtros = filtrosInicial) => {
    setLoading(true);

    const params = {}

    if (filtros.categoria) params.categoria = filtros.categoria;
    if (filtros.pais_origen) params.pais_origen = filtros.pais_origen;
    if (filtros.nombre !== "") params.nombre = filtros.nombre;
    if (filtros.estado !== null) params.activo = filtros.estado;

    try {
      const response = await api.get(
        endpoints.conciertos.artistas,
        { params }
      );

      setArtistas(response.data.results);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtistas();
  }, []);

  useEffect(() => {
    api.get(endpoints.conciertos.categorias)
      .then(res => setCategorias(res.data))
      .catch(err => console.error(err))
  }, [])

  useEffect(() => {
    api.get(endpoints.conciertos.paises)
      .then(res => setPaises(res.data))
      .catch(err => console.error(err))
  }, [])

  return (
    <Box p={5}>
      <Box align='center'>
        <Heading color='white' mb={6}>Artistas</Heading>

        <HStack mb={4} w='80%'>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              rounded="full"
              w="100%"
            >
              {categoriaSel || "Seleccionar categoria"}
            </MenuButton>

            <MenuList maxH="200px" overflowY="auto">
              {categorias.map((c) => (
                <MenuItem
                  key={c.id}
                  onClick={() => {
                    setCategoriaSel(c.nombre);
                    setFiltrosDraft(prev => ({
                      ...prev,
                      categoria: c.id
                    }));
                  }}
                >
                  {c.nombre}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              rounded="full"
              w="100%"
            >
              {pais_origenSel || "Seleccionar pais"}
            </MenuButton>

            <MenuList maxH="200px" overflowY="auto">
              {paises.map((p) => (
                <MenuItem
                  key={p.id}
                  onClick={() => {
                    setPais_origenSel(p.nombre);
                    setFiltrosDraft(prev => ({
                      ...prev,
                      pais_origen: p.id
                    }));
                  }}
                >
                  {p.nombre}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              rounded='full'
              w="100%"
            >
              {filtrosDraft.estado === null
                ? "Estado"
                : filtrosDraft.estado
                ? "Activos"
                : "Suspendidos"}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setFiltrosDraft(prev => ({ ...prev, estado: true }))}>Activos</MenuItem>
              <MenuItem onClick={() => setFiltrosDraft(prev => ({ ...prev, estado: false }))}>Suspendidos</MenuItem>
            </MenuList>
          </Menu>

          <Input
            placeholder="Buscar por nombre"
            rounded='full'
            variant='custom'
            value={filtrosDraft.nombre}
            onChange={(e) =>
              setFiltrosDraft({ ...filtrosDraft, nombre: e.target.value })
            }
          />

          <Button
            rounded='full'
            ml={4}
            w='60%'
            onClick={() => fetchArtistas(filtrosDraft)}
          >
            Aplicar filtros
          </Button>

          <Button
            rounded='full'
            w='60%'
            onClick={() => {
              setCategoriaSel("")
              setPais_origenSel("")
              setFiltrosDraft(filtrosInicial);
              fetchArtistas(filtrosInicial);
            }}
          >
            Limpiar
          </Button>
        </HStack>

        {loading ? (
          <HStack spacing={4} justify='center'>
            {[...Array(3)].map((_, i) => (
              <Skeleton
                key={i}
                h={220}
                w={240}
                borderRadius={30}
                bg="whiteAlpha.300"
                p={4}
              />
            ))}
          </HStack>
        ) : (
          <>
            <Wrap justify="center" spacing="20px">
              {artistas.length > 0 ? (
                artistas.map((a) => (
                  <Artista
                    key={a.id}
                    id={a.id}
                    nombre={a.nombre}
                    imagen={a?.imagen}
                    categoria={a.categoria.nombre}
                    estadoArtista={a.activo}
                  />
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
                  No se encontraron artistas con los filtros aplicados.
                </Text>
              )}
            </Wrap>
          </>
        )}
      </Box>
    </Box>
  );
}
