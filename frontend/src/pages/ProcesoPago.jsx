import { 
  Wrap, WrapItem, Button, FormControl,
  FormLabel, Input, Stat, StatLabel,
  StatNumber, StatHelpText, Text, Heading,
  Image, InputGroup, InputRightElement, Flex,
  Tooltip, Select, Box, SimpleGrid,
} from "@chakra-ui/react";
import { useState, useEffect } from 'react';
import { MdLocalGroceryStore } from "react-icons/md";
import { LockIcon, UnlockIcon } from "@chakra-ui/icons"
import formatoPrecio from '../utils/FormatoPrecio'

const reservas = [
  {
    tipo: 'General',
    cantidad: 4,
    precio: 25000,
  },
  {
    tipo: 'VIP Early Access',
    cantidad: 1,
    precio: 45000,
  },
  // {
  //   tipo: 'VIP+',
  //   cantidad: 2,
  //   precio: 45000,
  // },
  // {
  //   tipo: 'VIP PLUS',
  //   cantidad: 2,
  //   precio: 45000,
  // },
]

export default function ProcesoPago() {
  const [formData, setFormData] = useState({
    numero: "",
    fecha: "",
    cvv: "",
    nombre: "",
    apellido: "",
    // provincia: "",
    // ciudad: "",
    direccion: "",
  });

  const [errors, setErrors] = useState({});
  const [tipoTarjeta, setTipoTarjeta] = useState(null);

  // const [provincia, setProvincia] = useState("");
  // const [ciudad, setCiudad] = useState("");

  // const provincias = Object.keys(provinciasCiudades);
  // const ciudades = provincia ? provinciasCiudades[provincia] : [];

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
    // if (formData.provincia === "") newErrors.provincia = "Es necesario";
    // if (formData.ciudad === "") newErrors.ciudad = "Es necesario";
    if (formData.direccion === "") newErrors.direccion = "Es necesario";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert("Pago procesado ✅");
    }
  };

  const [completo, setCompleto] = useState(false);

  useEffect(() => {
    const ok =
      formData.numero.length === 19 &&
      formData.fecha.length === 5 &&
      formData.cvv.length === 3 && 
      formData.nombre && 
      formData.apellido && 
      // formData.provincia != "" && 
      // formData.ciudad != "" && 
      formData.direccion;

    setCompleto(ok);
  }, [formData]);

  const totalPagar = reservas.reduce(
    (sum, r) => sum + r.precio * r.cantidad,
    0
  );

  return (
    <Box p={5}>
      <Box
        mb={8} 
        align='center' 
        color='white' 
      >
        <Heading display='inline-block' bg='whiteAlpha.400' p={2} borderRadius={20}>
          Tu reserva expira en 07:32
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
                isOpen={!!errors.numero}
                placement="top"
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
                isOpen={!!errors.fecha}
                placement="top"
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
                isOpen={!!errors.cvv}
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
                isOpen={!!errors.nombre}
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
                isOpen={!!errors.apellido}
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

            {/* Select Provincia */}
            {/* <FormControl mb={4}>
              <FormLabel color="white">Provincia</FormLabel>
              <Tooltip
                label={errors.provincia}
                isOpen={!!errors.provincia}
                placement="top"
                bg="red.500"
                color="white"
                hasArrow
              >
                <Select
                  name="provincia"
                  placeholder="Selecciona una provincia"
                  value={provincia}
                  variant='custom'
                  onChange={(e) => {
                    setProvincia(e.target.value);
                    setCiudad("");
                    handleChange(e);
                  }}
                  rounded='full'
                >
                  {provincias.map((prov) => (
                    <option key={prov} value={prov} style={{ color: "black" }}>
                      {prov}
                    </option>
                  ))}
                </Select>
              </Tooltip>
            </FormControl> */}

            {/* Select Ciudad */}
            {/* <FormControl>
              <FormLabel color="white">Ciudad</FormLabel>
              <Tooltip
                label={errors.ciudad}
                isOpen={!!errors.ciudad}
                placement="top"
                bg="red.500"
                color="white"
                hasArrow
              >
                <Select
                  name="ciudad"
                  placeholder="Selecciona una ciudad"
                  value={ciudad}
                  variant='custom'
                  onChange={(e) => {
                    setCiudad(e.target.value);
                    handleChange(e);
                  }}
                  isDisabled={!provincia}
                  rounded='full'
                >
                  {ciudades.map((c) => (
                    <option key={c} value={c} style={{ color: "black" }}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Tooltip>
            </FormControl> */}
          </SimpleGrid>

          <FormControl>
            <FormLabel color='white'>Dirección</FormLabel>
            <Tooltip
              label={errors.direccion}
              isOpen={!!errors.direccion}
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
              {reservas.map((r) => (
                  <WrapItem key={r.tipo} bg='whiteAlpha.400' borderRadius={20} p={2}>
                    <Stat>
                      <StatLabel>{r.tipo} (Cant. {r.cantidad})</StatLabel>
                      <StatNumber>${formatoPrecio((r.precio * r.cantidad))}</StatNumber>
                      <StatHelpText>Precio unidad ${formatoPrecio(r.precio)}</StatHelpText>
                    </Stat>
                    <Button 
                      position='absolute' 
                      mt='-3vh' 
                      ml='16vh' 
                      size='xs' 
                      colorScheme="red" 
                      rounded='full'
                    >
                      Quitar 1
                    </Button>
                  </WrapItem>
              ))}
            </Wrap>
          </Box>

          <Box mt={6}>
            <Text as='b' fontSize='2xl' display='inline-block' bg='whiteAlpha.400' p={3} borderRadius={20}>
              Monto total $
              {formatoPrecio(totalPagar)}
            </Text>
          </Box>

          <Box display='inline-block'>
            <Button 
              mt={6} 
              colorScheme="red" 
              rounded='full'
              size='lg'
            >
              Cancelar
            </Button>

            <Button 
              mt={6} 
              colorScheme="whiteAlpha" 
              type="submit"
              rounded='full'
              size='lg'
              ml={2}
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
  )
}
