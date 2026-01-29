import { AddIcon, BellIcon, InfoIcon, SettingsIcon, TriangleDownIcon } from '@chakra-ui/icons';
import {
  AlertDialog, AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter, AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Container,
  FormControl, FormLabel,
  Heading,
  Image,
  Menu, MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody, ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField, NumberInputStepper,
  Stack,
  Switch,
  Text,
  useDisclosure,
  useToast,
  Wrap, WrapItem,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { IoTicketSharp } from "react-icons/io5";
import { MdPayments } from "react-icons/md";
import { TbCancel } from "react-icons/tb";
import { Link } from 'react-router-dom';
import CrearTipo from '../components/CrearTipo';
import ModificarConcierto from '../components/ModificarConcierto';
import ModificarTipo from '../components/ModificarTipo';
import api from "../services/api";
import { useAuth } from "../services/AuthContext";
import formatoPrecio from "../utils/FormatoPrecio";

const slugify = (str) =>
  str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

export default function Evento({ id, imagen, artista, titulo, genero, estado, fecha, hora, tipos_entrada }) {
  const { user } = useAuth();
  const slug = slugify(titulo);
  const toast = useToast()
  const cancelado = estado.codigo === 'cancelado';

  const cancelRef = useRef()
  const {
    isOpen: isCancelarOpen,
    onOpen: onCancelarOpen,
    onClose: onCancelarClose
  } = useDisclosure()

  const [entradaSeleccionada, setEntradaSeleccionada] = useState(null);
  const [modoCancelarTodo, setModoCancelarTodo] = useState(false);
  const [cantidadCancelar, setCantidadCancelar] = useState(1);
  const [totalEntrada, setTotalEntrada] = useState(null);
  const handleCancelarClick = (id, total) => {
    setEntradaSeleccionada(id);
    setTotalEntrada(total);
    setModoCancelarTodo(false)
    setCantidadCancelar(1);
    onCancelarEntradaOpen();
  }

  const cancelEntradaRef = useRef()
  const {
    isOpen: isCancelarEntradaOpen,
    onOpen: onCancelarEntradaOpen,
    onClose: onCancelarEntradaClose
  } = useDisclosure()

  const {
    isOpen: isModificarOpen,
    onOpen: onModificarOpen,
    onClose: onModificarClose
  } = useDisclosure()

  const {
    isOpen: isEntradaOpen,
    onOpen: onEntradaOpen,
    onClose: onEntradaClose
  } = useDisclosure()

  const {
    isOpen: isCrearTipoOpen,
    onOpen: onCrearTipoOpen,
    onClose: onCrearTipoClose
  } = useDisclosure()

  const {
    isOpen: isModificarTipoOpen,
    onOpen: onModificarTipoOpen,
    onClose: onModificarTipoClose
  } = useDisclosure()

  const {
    isOpen: isAgregarOpen,
    onOpen: onAgregarOpen,
    onClose: onAgregarClose
  } = useDisclosure()

  const [cantidadAgregar, setCantidad] = useState(1)

  const handleAgregar = (id) => {
    setEntradaSeleccionada(id)
    onAgregarOpen()
  }

  const [nombre, setNombre] = useState("")
  const [precio, setPrecio] = useState(null)
  const [limite, setLimite] = useState(null)

  const handleModificarClick = (id, nombre, precio, limite) => {
    setEntradaSeleccionada(id)
    setNombre(nombre)
    setPrecio(precio)
    setLimite(limite)
    onModificarTipoOpen()
  }

  const handleCancelar = async () => {
    if (!entradaSeleccionada) return;

    try {
      let mensaje = ""
      if (modoCancelarTodo) {
        await api.post(
          `/conciertos/cancelar_tipo/${entradaSeleccionada}`
        )
        mensaje = "Se cancelo con exito el tipo de entrada."
      } else {
        await api.post(
          `/conciertos/cancelar_cantidad_tipo/${entradaSeleccionada}`,
          {cantidad: cantidadCancelar}
        )
        mensaje = `Se cancelo con exito las ${cantidadCancelar} entradas.`
      }

      toast({
        title: mensaje,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: 'top',
      })

      onCancelarEntradaClose();

      setEntradaSeleccionada(null);
      setCantidadCancelar(1);
      setModoCancelarTodo(false);
      window.location.reload()
    } catch (error) {
      console.error("Error al cancelar entradas", error);
    }
  }

  const handleAgregarSubmit = async () => {
    if (!entradaSeleccionada) return;

    try {
      await api.post(
        `/conciertos/agregar_entradas_tipo/${entradaSeleccionada}`,
        {cantidad: cantidadAgregar}
      )

      toast({
        title: `Se agregaron las ${cantidadAgregar} entradas exitosamente.`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: 'top',
      })

      onAgregarClose()

      setEntradaSeleccionada(null)
      setCantidad(1)
      window.location.reload()
    } catch (error) {
      console.error("Error al cancelar entradas", error);
    }
  }

  const handleCancelarConciertoSubmit = async () => {
    try {
      const res = await api.post(`/conciertos/cancelar_concierto/${id}`)

      const mensaje = res?.data?.message ?? "Se cancelo con exito";

      toast({
        title: mensaje,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: 'top',
      })

      onCancelarClose()
      window.location.reload()
    } catch (error) {
      console.error("Error al cancelar:", error);
    }
  }

  const handleProgramar = async () => {
    try {
      const payload = new FormData();

      payload.append('estado_id', 2)

      await api.patch(`/conciertos/modificar_concierto/${id}`, payload)

      toast({
        title: "Se programo con exito",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: 'top',
      })

      window.location.reload()
    } catch (error) {
      console.error("Error al programar:", error);
    }
  }

  const mostrar = ['en_curso', 'agotado', 'finalizado', 'cancelado'].includes(estado.codigo)

  return (
    <Box maxW={250}>
      <Card
        borderRadius={14}
        maxW='xs'
        bg={cancelado ? 'blackAlpha.400' : 'whiteAlpha.400'}
        variant='unstyled'
        transition="all 0.3s ease"
        _hover={{ transform: "translateY(-10px)", zIndex: 1000, boxShadow: 'md' }}
      >
        <Badge
          bg={cancelado ? "rgba(255, 0, 0, 0.8)" : "white"}
          color={cancelado ? 'white' : 'gray.600'}
          position='absolute'
          zIndex={1}
          variant='solid'
          fontSize='16px'
          align='center'
          mt={-1}
          ml={-1}
        >
          <span>
            {genero}
          </span>
        </Badge>
        <CardBody pb={3}>
          <Box position='relative'>
            <Image
              src={imagen}
              borderTopRadius={14}
              filter={['borrador', 'programado'].includes(estado.codigo) ? 'grayscale(1%)' : 'brightness(50%)'}
            />
            <Box
              fontSize='3xl'
              align='center'
              bg='black'
              color={cancelado ? 'rgba(255, 0, 0, 0.8)' : 'white'}
              position='absolute'
              display={mostrar ? 'inline-block' : 'none'}
              zIndex={2}
              p={3}
              top='50%'
              left='50%'
              transform='translate(-50%, -50%)'
              border='2px'
              borderRadius={10}
              borderColor={cancelado ? 'rgba(255, 0, 0, 0.8)' : 'white'}
            >
              <b>
                {estado.codigo === 'agotado' ? (
                  'AGOTADO'
                ) : estado.codigo === 'finalizado' ? (
                  'FINALIZADO'
                ) : estado.codigo === 'cancelado' ? (
                  'CANCELADO'
                ) : estado.codigo === 'en_curso' ? (
                  'EN CURSO'
                ) : (
                  ''
                )}
              </b>
            </Box>
          </Box>
          <Stack spacing='3'>
            <Container>
              <Heading
                size='lg'
                color={cancelado ? 'red.100' : 'white'}
              >
                {artista}
              </Heading>
              <Heading
                size='xs'
                color={cancelado ? 'red.100' : 'white'}
              >
                {titulo}
              </Heading>
              <Box
                display="flex"
                justifyContent="space-between"
                color={cancelado ? 'red.100' : 'white'}
                mt={4}
              >
                <Heading size='xs'>
                  Fecha: {fecha}
                </Heading>
                <Heading size='xs'>
                  Hora: {hora}
                </Heading>
              </Box>
              <Box mt={2} align='end'>
                {/* INFO */}
                <Button
                  as={Link}
                  to={`/conciertos/${slug}`}
                  state={id}
                  rounded='full'
                  colorScheme={cancelado ? 'red' : 'whiteAlpha'}
                  leftIcon={<InfoIcon />}
                  size='xs'
                >
                  {user.rol === 'Cliente' ? 'Más info' : 'Detalles'}
                </Button>

                {user.rol !== 'Cliente' &&
                  <>
                    {/* MENU */}
                    <Menu>
                      <MenuButton
                        as={Button}
                        rounded='full'
                        colorScheme={cancelado ? 'red' : 'whiteAlpha'}
                        rightIcon={<TriangleDownIcon />}
                        size='xs'
                        ml={4}
                      >
                        Opciones
                      </MenuButton>
                      <MenuList minWidth='170px'>
                        <MenuItem
                          onClick={onModificarOpen}
                          icon={<SettingsIcon boxSize={4} />}
                          display={['en_curso', 'cancelado', 'finalizado'].includes(estado.codigo) ? 'none': undefined}
                        >
                          Modificar
                        </MenuItem>
                        <MenuItem
                          color='teal'
                          onClick={onEntradaOpen}
                          icon={<IoTicketSharp size={18} />}
                        >
                          Entradas
                        </MenuItem>
                        <MenuItem
                          as={Link}
                          to='/pagos_concierto'
                          state={id}
                          color='green'
                          icon={<MdPayments size={18} />}
                        >
                          Ventas
                        </MenuItem>
                        <MenuItem
                          color='gray'
                          onClick={handleProgramar}
                          icon={<BellIcon boxSize={5} ml={-0.5} />}
                          display={
                            user.rol === 'Organizador' &&
                            estado.codigo === 'borrador' ?
                            undefined : 'none'
                          }
                        >
                          Programar
                        </MenuItem>
                        <MenuItem
                          color='red'
                          onClick={onCancelarOpen}
                          icon={<TbCancel size={18} />}
                          display={
                            ['en_curso', 'cancelado', 'finalizado'].includes(estado.codigo) ?
                            'none': undefined
                          }
                        >
                          Cancelar
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </>
                }
              </Box>
            </Container>
          </Stack>
        </CardBody>
      </Card>

      <ModificarConcierto isOpen={isModificarOpen} onClose={onModificarClose} id={id} />

      <Modal isCentered isOpen={isEntradaOpen} onClose={onEntradaClose}>
        <ModalOverlay backdropFilter='blur(10px)' />
        <ModalContent bg="whiteAlpha.500" borderRadius={20} w='fit-content' maxW='90vw' color="white">
          <ModalHeader>
            Tipos de Entrada
            <Button
              ml={2}
              mb={2}
              size='sm'
              rounded='full'
              rightIcon={<AddIcon />}
              onClick={onCrearTipoOpen}
              display={
                user.rol === 'Organizador' &&
                ['borrador', 'programado', 'agotado'].includes(estado.codigo) ?
                undefined : 'none'
              }
            >
              Crear Tipo
            </Button>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Wrap align='center' justify='center' spacing={10}>
              {tipos_entrada.map((t) => (
                <WrapItem key={t.id} align='center' p={4} bg='whiteAlpha.700' borderRadius={20} display='inline-block' maxW={280}>
                  <Heading fontSize='2xl' mb={4} color='blackAlpha.700'>
                    {t.nombre}
                  </Heading>
                  <Badge
                    display={t.activo ? 'none' : undefined}
                    colorScheme="red"
                    position='absolute'
                    zIndex={1}
                    variant='solid'
                    fontSize='14px'
                    align='center'
                    mt={-16}
                    ml={-28}
                  >
                    Cancelado
                  </Badge>
                  <Wrap justify='center' align='center' spacing={4}>
                    <WrapItem color='cyan.600' display='inline-block' align='center'>
                      <Text>Disponibles</Text>
                      <Text fontSize='2xl' fontWeight='medium'>{t.disponibles}</Text>
                    </WrapItem>
                    <WrapItem color='green.600' display='inline-block' align='center'>
                      <Text>Vendidas</Text>
                      <Text fontSize='2xl' fontWeight='medium'>{t.vendidas}</Text>
                    </WrapItem>
                    <WrapItem color='red.600' display='inline-block' align='center'>
                      <Text>Canceladas</Text>
                      <Text fontSize='2xl' fontWeight='medium'>{t.canceladas}</Text>
                    </WrapItem>
                    <WrapItem color='orange.600' display='inline-block' align='center'>
                      <Text>Reservadas</Text>
                      <Text fontSize='2xl' fontWeight='medium'>{t.reservadas}</Text>
                    </WrapItem>
                  </Wrap>
                  <Box color='blackAlpha.900' fontWeight='medium'>
                    <Text my={2}>
                      Precio: ${formatoPrecio(t.precio)}
                    </Text>
                    <Text my={2}>
                      Limite de reserva: {t.limite_reserva}
                    </Text>
                  </Box>
                  <Box
                    mt={2}
                    display={
                      t.activo &&
                      ['borrador', 'programado', 'agotado'].includes(estado.codigo) ?
                      undefined : 'none'
                    }
                  >
                    <Button
                      rounded='full'
                      colorScheme='red'
                      size='sm'
                      mr={2}
                      onClick={() => handleCancelarClick(t.id, t.disponibles)}
                      rightIcon={<TbCancel />}
                    >
                      Cancelar
                    </Button>
                    <Button
                      rounded='full'
                      colorScheme='teal'
                      size='sm'
                      onClick={() => handleModificarClick(t.id, t.nombre, t.precio, t.limite_reserva)}
                      rightIcon={<SettingsIcon />}
                    >
                      Modificar
                    </Button>
                    <Button
                      rounded='full'
                      size='sm'
                      mt={2}
                      onClick={() => handleAgregar(t.id)}
                      rightIcon={<AddIcon />}
                      display={user.rol === 'Organizador' ? undefined: 'none'}
                    >
                      Agregar
                    </Button>
                  </Box>
                </WrapItem>
              ))}
            </Wrap>
          </ModalBody>
        </ModalContent>
      </Modal>

      <CrearTipo
        isOpen={isCrearTipoOpen}
        onClose={onCrearTipoClose}
        concierto={id}
      />

      <ModificarTipo
        isOpen={isModificarTipoOpen}
        onClose={onModificarTipoClose}
        id={entradaSeleccionada}
        nombre={nombre}
        precio={precio}
        limite_reserva={limite}
      />

      <Modal isCentered isOpen={isAgregarOpen} onClose={onAgregarClose}>
        <ModalOverlay backdropFilter='blur(10px)' />
        <ModalContent bg="whiteAlpha.500" borderRadius={20}>
          <ModalHeader color='white'>Agregar Entradas</ModalHeader>
          <ModalCloseButton color='white' />
          <ModalBody>
            <NumberInput
              value={cantidadAgregar}
              min={1}
              w={150}
              color="black"
              variant="custom"
              onChange={(_, valueNumber) =>
                setCantidad(valueNumber)
              }
            >
              <NumberInputField rounded="full" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </ModalBody>

          <ModalFooter>
            <Button rounded='full' mr={3} onClick={onAgregarClose}>
              Cerrar
            </Button>
            <Button colorScheme='teal' rounded='full' onClick={handleAgregarSubmit}>Agregar +</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isCancelarOpen}
        leastDestructiveRef={cancelRef}
        onClose={onCancelarClose}
      >
        <AlertDialogOverlay backdropFilter='blur(10px) invert(100%)'>
          <AlertDialogContent bg='red.600' color='white' alignSelf='center'>
            <AlertDialogHeader fontSize='2xl'>
              Cancelar Concierto
            </AlertDialogHeader>

            <AlertDialogBody>
              Se cancelara el concierto al igual que todos sus tipos de entradas con sus entradas. No podra generar ventas, ni ser modificado.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                rounded='full'
                onClick={onCancelarClose}
                _hover={{transform: 'scale(1.1)'}}
              >
                Cerrar
              </Button>
              <Button
                colorScheme='red'
                rounded='full'
                onClick={handleCancelarConciertoSubmit}
                ml={3}
                _hover={{transform: 'scale(1.1)'}}
              >
                Cancelar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <AlertDialog
        isOpen={isCancelarEntradaOpen}
        leastDestructiveRef={cancelEntradaRef}
        onClose={onCancelarEntradaClose}
      >
        <AlertDialogOverlay backdropFilter='blur(10px) invert(100%)'>
          <AlertDialogContent bg='red.600' color='white' alignSelf='center'>
            <AlertDialogHeader fontSize='2xl'>
              Cancelar Tipo de Entrada
            </AlertDialogHeader>

            <AlertDialogBody>
              <Stack spacing={4}>
                {/* Switch */}
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">
                    Cancelar todo el tipo de entrada
                  </FormLabel>
                  <Switch
                    isChecked={modoCancelarTodo}
                    onChange={(e) => setModoCancelarTodo(e.target.checked)}
                    colorScheme="red"
                  />
                </FormControl>

                {/* Modo cancelar TODO */}
                {modoCancelarTodo ? (
                  <Text>
                    Esta acción cancelará todas las entradas de este tipo.
                  </Text>
                ) : (
                  /* Modo cancelar por cantidad */
                  <>
                    <Text>
                      ¿Cuántas entradas querés cancelar?
                      <br />
                      <Text as="span" fontSize="sm">
                        Máximo disponible: {totalEntrada}
                      </Text>
                    </Text>

                    <NumberInput
                      value={cantidadCancelar}
                      min={1}
                      max={totalEntrada}
                      w={150}
                      color="black"
                      variant="custom"
                      onChange={(_, valueNumber) =>
                        setCantidadCancelar(valueNumber)
                      }
                    >
                      <NumberInputField rounded="full" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </>
                )}
              </Stack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                rounded='full'
                onClick={onCancelarEntradaClose}
                _hover={{transform: 'scale(1.1)'}}
              >
                Cerrar
              </Button>
              <Button
                colorScheme='red'
                rounded='full'
                onClick={handleCancelar}
                ml={3}
                _hover={{transform: 'scale(1.1)'}}
              >
                Cancelar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
