import { 
  Box, Heading,
  Text, Wrap, WrapItem, HStack,
  Button, Popover, PopoverTrigger, PopoverContent,
  PopoverHeader, PopoverBody, PopoverArrow, PopoverCloseButton,
  useDisclosure, Skeleton, AlertDialog, Badge,
  AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent,
  AlertDialogOverlay, useToast, Menu, MenuButton, MenuList, MenuItem, Input,
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react'
import { EditIcon, LockIcon, UnlockIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { FaMapMarkerAlt } from "react-icons/fa";
import ModificarLugar from "../components/ModificarLugar"
import api from '../services/api'

function Lugar({ id, nombre, direccion, estadoLugar }) {
  const { isOpen, onToggle, onClose } = useDisclosure();
  const toast = useToast();

  const {
    isOpen: isModificarOpen,
    onOpen: onModificarOpen,
    onClose: onModificarClose
  } = useDisclosure();

  const [estado, setEstado] = useState(estadoLugar)

  const cancelEstadoRef = useRef()
  const {
    isOpen: isEstadoOpen,
    onOpen: onEstadoOpen,
    onClose: onEstadoClose
  } = useDisclosure();

  useEffect(() => {
    setEstado(estadoLugar)
  }, [estadoLugar])

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
        `/conciertos/modificar_lugar/${id}`,
        { activo: nuevoEstado }
      )

      toast({
        title: !nuevoEstado ? 'Se suspendio el lugar': 'Se reactivo el lugar',
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
            <Badge colorScheme={estado ? "green" : "red"} fontSize='2xs' position='absolute'>
              {estado ? undefined : "Suspendido"}
            </Badge>
            <Box p={4}>
              <Text color='whiteAlpha.900' as='b' fontSize='xl'>{nombre}</Text><br />
              <Text color='whiteAlpha.800' as='b' fontSize='sm'>
                <FaMapMarkerAlt style={{ display: 'inline', marginRight: 4 }} />
                {direccion}
                <FaMapMarkerAlt style={{ display: 'inline', marginLeft: 4 }} />
              </Text>
            </Box>
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
                  {estado ? "Suspender lugar" : "Reactivar lugar"}
                </Button>
              </WrapItem>
            </Wrap>
          </PopoverBody>
        </PopoverContent>
      </Popover>

      <ModificarLugar isOpen={isModificarOpen} onClose={onModificarClose} id={id} />

      <AlertDialog
        isOpen={isEstadoOpen}
        leastDestructiveRef={cancelEstadoRef}
        onClose={onEstadoClose}
        isCentered
      >
        <AlertDialogOverlay backdropFilter='blur(10px) invert(100%)'>
          <AlertDialogContent bg='whiteAlpha.500' color='white' alignSelf='center'>
            <AlertDialogHeader fontSize='2xl'>
              Suspender Lugar
            </AlertDialogHeader>

            <AlertDialogBody>
              ¿Estás seguro que querés suspender este lugar?
              <br />
              No se podra crear conciertos en este lugar.
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

export default function Lugares() {
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [provincias, setProvincias] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  
  const [provinciaSel, setProvinciaSel] = useState(null);
  const [ciudadSel, setCiudadSel] = useState(null);
  
  const filtrosInicial = {
    provincia: null,
    ciudad: null,
    nombre: "",
    estado: null
  };

  const [filtrosDraft, setFiltrosDraft] = useState(filtrosInicial);

  const fetchLugares = async (filtros = filtrosInicial) => {
    setLoading(true);

    const params = {}

    if (filtros.provincia) params.provincia = filtros.provincia;
    if (filtros.ciudad) params.ciudad = filtros.ciudad;
    if (filtros.nombre !== "") params.nombre = filtros.nombre;
    if (filtros.estado !== null) params.estado = filtros.estado;

    try {
      const response = await api.get(
        "/conciertos/lugares", 
        { params }
      );

      setLugares(response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get("/conciertos/provincias")
      .then(res => setProvincias(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!provinciaSel) {
      setCiudades([]);
      setCiudadSel(null);
      setFiltrosDraft(prev => ({ ...prev, ciudad: null }));
      return;
    }

    api.get("/conciertos/ciudades", {
      params: { provincia_id: provinciaSel.id }
    })
      .then(res => setCiudades(res.data))
      .catch(console.error);
  }, [provinciaSel]);

  useEffect(() => {
    fetchLugares();
  }, []);

  const lugaresPorProvincia = lugares.reduce((acc, lugar) => {
    const { provincia } = lugar;
    const provinciaId = provincia.id;
    const ciudadId = provincia.ciudad.id;

    if (!acc[provinciaId]) {
      acc[provinciaId] = {
        id: provinciaId,
        nombre: provincia.nombre,
        ciudades: {}
      };
    }

    if (!acc[provinciaId].ciudades[ciudadId]) {
      acc[provinciaId].ciudades[ciudadId] = {
        id: ciudadId,
        nombre: provincia.ciudad.nombre,
        lugares: []
      };
    }

    acc[provinciaId].ciudades[ciudadId].lugares.push(lugar);

    return acc;
  }, {});

  return (
    <Box p={5}>
      <Box align='center'>
        <Heading color='white' mb={6}>Lugares</Heading>

        <HStack mb={4} w='80%'>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />} 
              rounded="full"
              w="100%"
            >
              {provinciaSel?.nombre || "Seleccionar provincia"}
            </MenuButton>

            <MenuList maxH="200px" overflowY="auto">
              {provincias.map((provincia) => (
                <MenuItem
                  key={provincia.id}
                  onClick={() => {
                    setProvinciaSel(provincia);
                    setFiltrosDraft(prev => ({
                      ...prev,
                      provincia: provincia.id,
                      ciudad: null
                    }));
                  }}
                >
                  {provincia.nombre}
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
              isDisabled={!provinciaSel}
            >
              {ciudadSel?.nombre || "Seleccionar ciudad"}
            </MenuButton>

            <MenuList>
              {ciudades.map((ciudad) => (
                <MenuItem
                  key={ciudad.id}
                  onClick={() => {
                    setCiudadSel(ciudad);
                    setFiltrosDraft(prev => ({
                      ...prev,
                      ciudad: ciudad.id
                    }));
                  }}
                >
                  {ciudad.nombre}
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
            onClick={() => fetchLugares(filtrosDraft)}
          >
            Aplicar filtros
          </Button>
                      
          <Button
            rounded='full'
            w='60%'
            onClick={() => {
              setProvinciaSel(null);
              setCiudadSel(null);
              setFiltrosDraft(filtrosInicial);
              fetchLugares(filtrosInicial);
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
              {lugares.length > 0 ? (
                Object.values(lugaresPorProvincia).map((provincia) => (
                  <WrapItem key={provincia.id}>
                    <Box
                      mb={8}
                      p={4}
                      borderRadius={20}
                      align="center"
                      bg="whiteAlpha.300"
                    >
                      <Heading size="lg" mb={2} color="white">
                        {provincia.nombre}
                      </Heading>
  
                      {Object.values(provincia.ciudades).map((ciudad) => (
                        <Box key={ciudad.id} mb={4} align="center">
                        
                          <Heading size="md" mb={3} color="white">
                            - {ciudad.nombre} -
                          </Heading>
                      
                          <Wrap justify="center" spacing="10px">
                            {ciudad.lugares.map((lugar) => (
                              <Lugar
                                key={lugar.id}
                                id={lugar.id}
                                nombre={lugar.nombre}
                                direccion={lugar.direccion}
                                estadoLugar={lugar.activo}
                              />
                            ))}
                          </Wrap>
                          
                        </Box>
                      ))}
                    </Box>
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
                  No se encontraron lugares con los filtros aplicados.
                </Text>
              )}
            </Wrap>
          </>
        )}
      </Box>
    </Box>
  );
}
