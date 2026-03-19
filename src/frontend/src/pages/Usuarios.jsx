import { ChevronDownIcon, EditIcon, InfoIcon, LockIcon, UnlockIcon } from '@chakra-ui/icons';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter, AlertDialogHeader,
  AlertDialogOverlay,
  Avatar, Badge,
  Box,
  Button,
  Heading,
  HStack,
  Input, Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  SkeletonCircle, SkeletonText,
  Text,
  useDisclosure,
  useToast,
  Wrap, WrapItem,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { FaKey } from "react-icons/fa";
import { Link } from 'react-router-dom';
import CambiarPasswordUser from "../components/CambiarPasswordUser";
import ModificarUsuario from "../components/ModificarUsuario";
import api from '../services/api';
import { endpoints } from '../services/endpoints';

function Usuario({ id, email, nombre, apellido, activo, rol }) {
  const { isOpen, onToggle, onClose } = useDisclosure();
  const toast = useToast();

  const cancelActiveRef = useRef()
  const {
    isOpen: isActiveOpen,
    onOpen: onActiveOpen,
    onClose: onActiveClose
  } = useDisclosure();

  const {
    isOpen: isModificarOpen,
    onOpen: onModificarOpen,
    onClose: onModificarClose
  } = useDisclosure();

  const {
    isOpen: isPasswordOpen,
    onOpen: onPasswordOpen,
    onClose: onPasswordClose
  } = useDisclosure();

  const [activoState, setActivoState] = useState(activo)

  useEffect(() => {
    setActivoState(activo)
  }, [activo])

  const handleToggleActivo = async () => {
    if (activoState) {
      onActiveOpen()
    } else {
      actualizarEstado(true)
    }
  }

  const actualizarEstado = async (nuevoEstado) => {
    try {
      setActivoState(nuevoEstado)

      await api.patch(
        endpoints.usuarios.modificar_usuario(id),
        { is_active: nuevoEstado }
      )

      toast({
        title: !nuevoEstado ? 'Se suspendio al usuario': 'Se reactivo al usuario',
        status: "success",
        duration: 2000,
        isClosable: true,
        position: 'top',
      });

      onActiveClose()
    } catch (error) {
      setActivoState(!nuevoEstado)

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
            <Badge colorScheme={activoState ? "green" : "red"} fontSize='2xs' position='absolute'>
              {activoState ? undefined : "Suspendido"}
            </Badge>
            <Box p={4}>
              <Avatar bg='whiteAlpha.600' mb={2} />
              <Box>
                <Text color='whiteAlpha.800' as='b' fontSize='lg'>{email}</Text><br />
                <Text color='whiteAlpha.800' as='b' fontSize='sm'>{nombre} {apellido}</Text>
              </Box>
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
                  as={Link}
                  to={rol === 'Cliente' ? '/usuarios/detalle_cliente' : '/usuarios/detalle_organizador'}
                  state={ id }
                  leftIcon={<InfoIcon />}
                  size='sm'
                  rounded='full'
                  variant='solid'
                  colorScheme='cyan'
                >
                  Detalles
                </Button>
              </WrapItem>

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
                  leftIcon={<FaKey />}
                  size='sm'
                  rounded='full'
                  variant='solid'
                  onClick={onPasswordOpen}
                  colorScheme='orange'
                >
                  Cambiar Contraseña
                </Button>
              </WrapItem>

              <WrapItem>
                <Button
                  size="sm"
                  rounded='full'
                  colorScheme={activoState ? "red" : "green"}
                  onClick={handleToggleActivo}
                >
                  {activoState ? <LockIcon mr={1} /> : <UnlockIcon mr={1} />}
                  {activoState ? "Suspender usuario" : "Reactivar usuario"}
                </Button>
              </WrapItem>
            </Wrap>
          </PopoverBody>
        </PopoverContent>
      </Popover>

      <ModificarUsuario isOpen={isModificarOpen} onClose={onModificarClose} id={id} />

      <CambiarPasswordUser isOpen={isPasswordOpen} onClose={onPasswordClose} id={id} />

      <AlertDialog
        isOpen={isActiveOpen}
        leastDestructiveRef={cancelActiveRef}
        onClose={onActiveClose}
        isCentered
      >
        <AlertDialogOverlay backdropFilter='blur(10px) invert(100%)'>
          <AlertDialogContent bg='red.600' color='white' alignSelf='center'>
            <AlertDialogHeader fontSize='2xl'>
              Suspender Usuario
            </AlertDialogHeader>

            <AlertDialogBody>
              ¿Estás seguro que querés suspender este usuario?
              <br />
              No podrá iniciar sesión hasta que lo reactives.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelActiveRef} onClick={onActiveClose} rounded='full'>
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

function Filtros({ draft, setDraft, fetch, inicial }) {
  return (
    <HStack mb={4} w='70%'>
      <Input
        placeholder="Buscar por email"
        rounded='full'
        variant='custom'
        value={draft.email}
        onChange={(e) =>
          setDraft({ ...draft, email: e.target.value })
        }
      />

      <Input
        placeholder="Buscar por nombre"
        rounded='full'
        variant='custom'
        value={draft.nombre}
        onChange={(e) =>
          setDraft({ ...draft, nombre: e.target.value })
        }
      />

      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          rounded='full'
          w="100%"
        >
          {draft.estado === ""
            ? "Estado"
            : draft.estado
            ? "Activos"
            : "Suspendidos"}
        </MenuButton>
        <MenuList>
          <MenuItem onClick={() => setDraft({ ...draft, estado: true })}>Activos</MenuItem>
          <MenuItem onClick={() => setDraft({ ...draft, estado: false })}>Suspendidos</MenuItem>
        </MenuList>
      </Menu>

      <Button
        rounded='full'
        ml={4}
        w='60%'
        onClick={() => fetch(draft)}
      >
        Aplicar filtros
      </Button>

      <Button
        rounded='full'
        w='60%'
        onClick={() => {
          setDraft(inicial);
          fetch(inicial);
        }}
      >
        Limpiar
      </Button>
    </HStack>
  )
}

export default function Usuarios() {
  const [usuariosOrg, setUsuariosOrg] = useState([]);
  const [usuariosCli, setUsuariosCli] = useState([]);
  const [loadingOrg, setLoadingOrg] = useState(true);
  const [loadingCli, setLoadingCli] = useState(true);

  const [filtrosOrgInicial, setFiltrosOrg] = useState({
    estado: "",
    email: "",
    nombre: ""
  });

  const [filtrosOrgDraft, setFiltrosOrgDraft] = useState(filtrosOrgInicial);

  const fetchOrganizadores = async (filtros = filtrosOrgInicial) => {
    setLoadingOrg(true);

    const params = {
      rol: "Organizador"
    };

    if (filtros.email) params.email = filtros.email;
    if (filtros.nombre) params.nombre = filtros.nombre;
    if (filtros.estado !== "") params.activo = filtros.estado;

    try {
      const response = await api.get(
        endpoints.usuarios.usuarios,
        { params }
      );

      setUsuariosOrg(response.data.results);
    } finally {
      setLoadingOrg(false);
    }
  };

  const [filtrosCliInicial, setFiltrosCli] = useState({
    estado: "",
    email: "",
    nombre: ""
  });

  const [filtrosCliDraft, setFiltrosCliDraft] = useState(filtrosCliInicial);

  const fetchClientes = async (filtros = filtrosCliInicial) => {
    setLoadingCli(true);

    const params = {
      rol: "Cliente"
    };

    if (filtros.email !== "") params.email = filtros.email;
    if (filtros.nombre !== "") params.nombre = filtros.nombre;
    if (filtros.estado !== "") params.activo = filtros.estado;

    try {
      const response = await api.get(
        endpoints.usuarios.usuarios,
        { params }
      );

      setUsuariosCli(response.data.results);
    } finally {
      setLoadingCli(false);
    }
  };

  useEffect(() => {
    fetchOrganizadores();
    fetchClientes();
  }, []);

  return (
    <Box p={5}>
      <Box align='center'>
        <Heading color='white' mb={4}>Organizadores</Heading>

        <Filtros
          draft={filtrosOrgDraft}
          setDraft={setFiltrosOrgDraft}
          fetch={fetchOrganizadores}
          inicial={filtrosOrgInicial}
        />

        {loadingOrg ? (
          <HStack spacing={4} justify='center'>
            {[...Array(3)].map((_, i) => (
              <Box key={i} h={130} w={200} borderRadius={30} bg="whiteAlpha.300" p={4}>
                <SkeletonCircle size={14} />
                <SkeletonText noOfLines={2} mt={4} />
              </Box>
            ))}
          </HStack>
        ) : (
          <Wrap justify='center' align='center' spacing='10px'>
            {usuariosOrg.length > 0 ? (
              usuariosOrg.map((e) => (
                <Usuario
                  key={e.id}
                  id={e.id}
                  email={e.email}
                  nombre={e.first_name}
                  apellido={e.last_name}
                  activo={e.is_active}
                  rol={e.rol}
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
                No se encontraron usuarios con los filtros aplicados.
              </Text>
            )}
          </Wrap>
        )}
      </Box>

      <Box align='center' mt={10}>
        <Heading color='white' mb={4}>Clientes</Heading>

        <Filtros
          draft={filtrosCliDraft}
          setDraft={setFiltrosCliDraft}
          fetch={fetchClientes}
          inicial={filtrosCliInicial}
        />

        {loadingCli ? (
          <HStack spacing={4} justify='center'>
            {[...Array(3)].map((_, i) => (
              <Box key={i} h={130} w={200} borderRadius={30} bg="whiteAlpha.300" p={4}>
                <SkeletonCircle size={14} />
                <SkeletonText noOfLines={2} mt={4} />
              </Box>
            ))}
          </HStack>
        ) : (
          <Wrap justify='center' align='center' spacing='10px'>
            {usuariosCli.length > 0 ? (
              usuariosCli.map((e) => (
                <Usuario
                  key={e.id}
                  id={e.id}
                  email={e.email}
                  nombre={e.first_name}
                  apellido={e.last_name}
                  activo={e.is_active}
                  rol={e.rol}
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
                No se encontraron usuarios con los filtros aplicados.
              </Text>
            )}
          </Wrap>
        )}
      </Box>
    </Box>
  );
}
