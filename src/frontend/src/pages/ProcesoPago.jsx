import { LockIcon, MinusIcon, TimeIcon, UnlockIcon } from "@chakra-ui/icons";
import {
  AlertDialog, AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Image,
  Input,
  InputGroup, InputRightElement,
  SimpleGrid,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
  Wrap, WrapItem
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from 'react';
import { MdLocalGroceryStore } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import api from "../services/api";
import { useAuth } from "../services/AuthContext";
import { endpoints } from "../services/endpoints";
import useCountdown from '../utils/Temporizador';

export default function ProcesoPago() {
  const [formData, setFormData] = useState({
    numero: "",
    fecha: "",
    cvv: "",
    nombre: "",
    apellido: "",
    direccion: "",
  });

  const {
    isOpen: isCancelarOpen,
    onOpen: onCancelarOpen,
    onClose: onCancelarClose
  } = useDisclosure()
  const cancelCancelarRef = useRef()

  const {
    isOpen: isQuitarOpen,
    onOpen: onQuitarOpen,
    onClose: onQuitarClose
  } = useDisclosure()
  const cancelQuitarRef = useRef()

  const toast = useToast()

  const navigate = useNavigate()

  const {
    fetchReservaActiva,
    tieneReservaActiva,
    loadingReserva,
    reservaActiva
  } = useAuth();

  useEffect(() => {
    fetchReservaActiva()
  }, []);

  useEffect(() => {
    if (loadingReserva) return;
    if (tieneReservaActiva === null) return;
    if (tieneReservaActiva === false) {
      navigate("/conciertos");
    }
  }, [loadingReserva, tieneReservaActiva]);

  const [errors, setErrors] = useState({});
  const [tipoTarjeta, setTipoTarjeta] = useState(null);

  const detectarTipoTarjeta = (numero) => {
    if (/^4/.test(numero)) return "visa";
    if (/^(5[1-5]|22[2-9]|2[3-6][0-9]|27[0-1]|2720)/.test(numero)) return "mastercard";
    return null;
  };

  const validarLuhn = (numero) => {
    // Quita espacios o guiones
    const limpio = numero.replace(/\D/g, "");
    let suma = 0;
    let alternar = false;

    // Recorre el número de derecha a izquierda
    for (let i = limpio.length - 1; i >= 0; i--) {
      let n = parseInt(limpio[i], 10);

      if (alternar) {
        n *= 2;
        if (n > 9) n -= 9;
      }

      suma += n;
      alternar = !alternar;
    }

    return suma % 10 === 0;
  }

  const validarVencimiento = (fecha) => {
    if (!fecha || fecha.length !== 5) return false;

    const mes = parseInt(fecha.slice(0, 2), 10);
    const anio = parseInt("20" + fecha.slice(3, 5));

    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1;
    const anioActual = hoy.getFullYear();

    if (anio < anioActual) return false;
    if (anio === anioActual && mes < mesActual) return false;

    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "numero") {
      // Permitir solo dígitos
      const limpio = value.replace(/\D/g, "").slice(0, 16);
      const formateado = limpio.replace(/(\d{4})(?=\d)/g, "$1 ");
      setFormData({ ...formData, numero: formateado });
      setTipoTarjeta(detectarTipoTarjeta(limpio));
    } else if (name === "fecha") {
      // Formato MM/AA automático
      let limpio = value.replace(/\D/g, "").slice(0, 4);

      if (limpio.length >= 3)
        limpio = limpio.replace(/(\d{2})(\d{1,2})/, "$1/$2");

      if (limpio.length >= 2) {
        const mes = parseInt(limpio.slice(0, 2), 10);
        if (mes > 12 || mes < 1) return;
      }

      setFormData({ ...formData, fecha: limpio });
    } else if (name === "cvv") {
      const limpio = value.replace(/\D/g, "").slice(0, 3);
      setFormData({ ...formData, cvv: limpio });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (formData.numero.replace(/\s/g, "").length !== 16 || validarLuhn(formData.numero))
      newErrors.numero = "Número inválido";

    if (!/^\d{2}\/\d{2}$/.test(formData.fecha)) {
      newErrors.fecha = "Fecha invalida";
    } else {
      if (!validarVencimiento(formData.fecha)) newErrors.fecha = "Tarjeta vencida";
    }

    if (formData.cvv.length !== 3) newErrors.cvv = "CVV inválido";
    if (!formData.nombre.trim()) newErrors.nombre = "Es necesario";
    if (!formData.apellido.trim()) newErrors.apellido = "Es necesario";
    if (formData.direccion === "") newErrors.direccion = "Es necesario";

    setErrors(newErrors);
  };

  const [completo, setCompleto] = useState(false);

  useEffect(() => {
    const ok =
      formData.numero.length === 19 &&
      formData.fecha.length === 5 &&
      formData.cvv.length === 3 &&
      formData.nombre &&
      formData.apellido &&
      formData.direccion;

    setCompleto(ok);
  }, [formData])

  const quitarEntrada = async () => {
    try {
      const res = await api.post(endpoints.entradas.quitar_entrada(quitarId))

      const mensaje = res?.data?.detail ?? "Se quito la entrada";

      toast({
        title: mensaje,
        status: "success",
        duration: 2000,
        isClosable: true,
        position: 'top',
      });

      fetchReservaActiva()
      setQuitarId(null)
    } catch (error) {
      let msg = "Error inesperado";

      const data = error?.response?.data;

      if (data && typeof data === "object") {
        const firstField = Object.keys(data)[0];
        const firstError = data[firstField]?.[0];

        if (firstError) msg = firstError;
      }

      toast({
        title: "Error",
        description: msg,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  const [quitarId, setQuitarId] = useState(null)
  const handleQuitarClick = (id) => {
    setQuitarId(id)
    setOpen(false)
    onQuitarOpen()
  }

  const timeLeft = useCountdown(reservaActiva?.reservar_hasta);

  useEffect(() => {
    if (timeLeft?.total === 0) {
      fetchReservaActiva();
      navigate("/conciertos");
      window.location.reload();
    }
  }, [timeLeft]);

  const cancelarReserva = async () => {
    try {
      const res = await api.post(endpoints.entradas.cancelar_reserva)

      const mensaje = res?.data?.detail ?? "Se cancelo";

      toast({
        title: mensaje,
        status: "success",
        duration: 2000,
        isClosable: true,
        position: 'top',
      });

      fetchReservaActiva()
      navigate("/conciertos")
      window.location.reload()
    } catch (error) {
      let msg = "Error inesperado";

      const data = error?.response?.data;

      if (data && typeof data === "object") {
        const firstField = Object.keys(data)[0];
        const firstError = data[firstField]?.[0];

        if (firstError) msg = firstError;
      }

      toast({
        title: "Error",
        description: msg,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
  }

  const [open, setOpen] = useState(true)

  const handleComprar = async () => {
    fetchReservaActiva()

    if (tieneReservaActiva) {
      toast({
        title: "Error",
        description: "No se puede realizar la compra, porque el concierto ya se encuentra en curso.",
        status: "error",
        duration: 8000,
        isClosable: true,
        position: 'top',
      });

      navigate("/conciertos")
    }

    try {
      const res = await api.post(endpoints.pagos.pagar_reserva)

      const mensaje = res?.data?.detail ?? "Se realizo la compra";

      toast({
        title: mensaje,
        status: "success",
        duration: 2000,
        isClosable: true,
        position: 'top',
      });

      fetchReservaActiva()
      navigate("/pagos")
      window.location.reload()
    } catch (error) {
      let msg = "Error inesperado";

      const data = error?.response?.data;

      if (data && typeof data === "object") {
        const firstField = Object.keys(data)[0];
        const firstError = data[firstField]?.[0];

        if (firstError) msg = firstError;
      }

      toast({
        title: "Error",
        description: msg,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
  }

  return (
    <>
      <Box p={5}>
        <Box
          mb={8}
          align='center'
          color='white'
        >
          <Heading
            display="inline-block"
            bg={timeLeft?.minutes < 2 ? 'blackAlpha.800' : 'whiteAlpha.400'}
            px={3}
            py={2}
            borderRadius={20}
            color={timeLeft?.minutes < 2 ? 'red.500' : 'white'}
          >
            Tiempo restante:{" "}
            {timeLeft
              ? `${String(timeLeft.minutes).padStart(2, "0")}:${String(timeLeft.seconds).padStart(2, "0")}`
              : "--:--"}
            <TimeIcon ml={2} mb={2} />
          </Heading>
        </Box>

        <form onSubmit={handleSubmit}>
        <SimpleGrid
          columns={2}
          spacing={4}
          w='80%'
          ml='10%'
          align='center'
        >
          <Box
            align='center'
            p={5}
            bg='whiteAlpha.400'
            borderRadius={18}
          >
            <Heading mb={4} color='white'>Método de Pago</Heading>

            <Flex gap={2} align="flex-end">
              <FormControl isInvalid={errors.numero} maxW={240}>
                <FormLabel color='white'>Número de tarjeta</FormLabel>
                <Tooltip
                  label={errors.numero}
                  isOpen={!!errors.numero && open}
                  placement="bottom"
                  bg="red.500"
                  color="white"
                  hasArrow
                >
                  <InputGroup maxW={240}>
                    <Input
                      name="numero"
                      placeholder="1234 5678 9012 3456"
                      autoComplete="cc-number"
                      inputMode="numeric"
                      variant="custom"
                      rounded='full'
                      value={formData.numero}
                      onChange={handleChange}
                    />
                    {tipoTarjeta && (
                      <InputRightElement>
                        <Image
                          src={
                            tipoTarjeta === "visa"
                              ? "https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"
                              : "https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png"
                          }
                          alt={tipoTarjeta}
                          mr={2}
                        />
                      </InputRightElement>
                    )}
                  </InputGroup>
                </Tooltip>
              </FormControl>

              <FormControl isInvalid={errors.fecha} maxW={160}>
                <FormLabel color='white'>Fecha de caducidad</FormLabel>
                <Tooltip
                  label={errors.fecha}
                  isOpen={!!errors.fecha && open}
                  placement="bottom"
                  bg="red.500"
                  color="white"
                  hasArrow
                >
                  <Input
                    name="fecha"
                    placeholder="MM/AA"
                    autoComplete="cc-exp"
                    inputMode="numeric"
                    variant="custom"
                    rounded='full'
                    maxW={90}
                    value={formData.fecha}
                    onChange={handleChange}
                  />
                </Tooltip>
              </FormControl>

              <FormControl isInvalid={errors.cvv} maxW={70}>
                <FormLabel color='white'>CVV</FormLabel>
                <Tooltip
                  label={errors.cvv}
                  isOpen={!!errors.cvv && open}
                  placement="bottom"
                  bg="red.500"
                  color="white"
                  hasArrow
                >
                  <Input
                    name="cvv"
                    type="password"
                    placeholder="123"
                    autoComplete="cc-csc"
                    inputMode="numeric"
                    variant="custom"
                    rounded='full'
                    maxW={70}
                    value={formData.cvv}
                    onChange={handleChange}
                  />
                </Tooltip>
              </FormControl>
            </Flex>

            <Heading mt={8} color='white'>Información de Facturación</Heading>
            <SimpleGrid columns={2} spacing={2}>
              <FormControl mt={2}>
                <FormLabel color='white'>Nombre</FormLabel>
                <Tooltip
                  label={errors.nombre}
                  isOpen={!!errors.nombre && open}
                  placement="top"
                  bg="red.500"
                  color="white"
                  hasArrow
                >
                  <Input
                    name="nombre"
                    placeholder="Ingrese su nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    variant='custom'
                    rounded='full'
                  />
                </Tooltip>
              </FormControl>

              <FormControl mt={2}>
                <FormLabel color='white'>Apellido</FormLabel>
                <Tooltip
                  label={errors.apellido}
                  isOpen={!!errors.apellido && open}
                  placement="top"
                  bg="red.500"
                  color="white"
                  hasArrow
                >
                  <Input
                    name="apellido"
                    placeholder="Ingrese su apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    variant='custom'
                    rounded='full'
                  />
                </Tooltip>
              </FormControl>
            </SimpleGrid>

            <FormControl mt={2}>
              <FormLabel color='white'>Dirección</FormLabel>
              <Tooltip
                label={errors.direccion}
                isOpen={!!errors.direccion && open}
                placement="top"
                bg="red.500"
                color="white"
                hasArrow
              >
                <Input
                  name="direccion"
                  placeholder="Ingrese una dirección"
                  value={formData.direccion}
                  onChange={handleChange}
                  variant='custom'
                  rounded='full'
                />
              </Tooltip>
            </FormControl>
          </Box>

          <Box
            align='center'
            p={5}
            bg='whiteAlpha.400'
            borderRadius={18}
            color='white'
          >
            <Heading>Información de Compra</Heading>
            <Heading mb={6} mt={2} fontSize='2xl'>
              <MdLocalGroceryStore
                style={{
                  display: 'inline-block',
                  marginBottom: -6,
                  marginRight: 4,
                }}
              />
              Entradas
            </Heading>

            <Box>
              <Wrap justify='center' align='center' spacing={4} w='90%'>
                {reservaActiva?.items.map((r) => (
                    <WrapItem key={r.tipo_id} bg='whiteAlpha.400' borderRadius={20} p={2}>
                      <Stat>
                        <StatLabel>{r.tipo_nombre} (Cant. {r.cantidad})</StatLabel>
                        <StatNumber>{r.precio_total_tipo}</StatNumber>
                        <StatHelpText>Precio unidad{" "}{r.precio_unitario}</StatHelpText>
                      </Stat>
                      <IconButton
                        position='absolute'
                        mt='-2vh'
                        ml={-2}
                        size='xs'
                        colorScheme="red"
                        rounded='full'
                        icon={<MinusIcon />}
                        onClick={() => handleQuitarClick(r.tipo_id)}
                      />
                    </WrapItem>
                ))}
              </Wrap>
            </Box>

            <Box mt={6}>
              <Text as='b' fontSize='2xl' display='inline-block' bg='whiteAlpha.400' p={3} borderRadius={20}>
                Monto total{" "}
                {reservaActiva?.precio_total_reserva}
              </Text>
            </Box>

            <Box display='inline-block'>
              <Button
                mt={6}
                colorScheme="red"
                rounded='full'
                size='lg'
                onClick={() => {onCancelarOpen(), setOpen(false)}}
              >
                Cancelar
              </Button>

              <Button
                mt={6}
                colorScheme="whiteAlpha"
                type="submit"
                rounded='full'
                size='lg'
                isDisabled={!completo}
                ml={2}
                onClick={handleComprar}
              >
                Comprar
              </Button>
            </Box>

            <Box display='inline' ml={2}>
              {!completo ?
                <LockIcon
                  boxSize={10}
                  mt={5}
                  color='whiteAlpha.600'
                /> :
                <UnlockIcon
                  boxSize={10}
                  mt={5}
                  color='whiteAlpha.600'
                />
              }
            </Box>
          </Box>
        </SimpleGrid>
        </form>
      </Box>

      <AlertDialog
        motionPreset='slideInBottom'
        leastDestructiveRef={cancelCancelarRef}
        onClose={() => {onCancelarClose(), setOpen(true)}}
        isOpen={isCancelarOpen}
        isCentered
      >
        <AlertDialogOverlay backdropFilter='blur(10px) invert(100%)' />

        <AlertDialogContent bg='red.600' color='white'>
          <AlertDialogHeader>Cancelar Reserva</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            ¿Querés cancelar la reserva?<br />
            Las entradas se liberarán y podrán ser reservadas por otra persona. Esta acción no se puede deshacer.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button rounded='full' ref={cancelCancelarRef} onClick={() => {onCancelarClose(), setOpen(true)}}>
              No
            </Button>
            <Button rounded='full' colorScheme='red' ml={3} onClick={cancelarReserva}>
              Si
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        motionPreset='slideInBottom'
        leastDestructiveRef={cancelQuitarRef}
        onClose={() => {onQuitarClose(), setOpen(true)}}
        isOpen={isQuitarOpen}
        isCentered
      >
        <AlertDialogOverlay backdropFilter='blur(10px) invert(100%)' />

        <AlertDialogContent bg='red.600' color='white'>
          <AlertDialogHeader>Quitar Entrada</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            ¿Querés quitar 1 entrada de este tipo de tu reserva?<br />
            Se liberará inmediatamente y volverá a estar disponible para otros.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button rounded='full' ref={cancelQuitarRef} onClick={() => {onQuitarClose(), setQuitarId(null), setOpen(true)}}>
              No
            </Button>
            <Button rounded='full' colorScheme='red' ml={3} onClick={() => {quitarEntrada(), onQuitarClose(), setOpen(true)}}>
              Si
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
