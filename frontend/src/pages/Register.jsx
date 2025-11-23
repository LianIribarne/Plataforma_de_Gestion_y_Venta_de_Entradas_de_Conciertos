import React from 'react'
import axios from "axios";
import {
  Box,
  AbsoluteCenter,
  Heading,
  Grid,
  GridItem,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  IconButton,
  RadioGroup,
  Radio,
  Stack,
  Button,
  FormControl,
  FormLabel,
  Tooltip, 
  useToast,
  Link,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon, AtSignIcon, CalendarIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useNavigate } from "react-router-dom";

export default function Form() {
  const [show, setShow] = React.useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = React.useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmPassword: "",
    genero: "Hombre",
    fechaNacimiento: "",
  });

  const [errors, setErrors] = React.useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";

    if (!formData.apellido.trim()) newErrors.apellido = "El apellido es obligatorio";

    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!formData.email.includes('@')) {
      newErrors.email = "El email no es válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    }

    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = "La fecha de nacimiento es obligatoria";
    } else {
      const edad = calcularEdad(formData.fechaNacimiento);
      if (edad < 18) {
        newErrors.fechaNacimiento = "Debes ser mayor de 18 años para registrarte";
      }
    }

    return newErrors;
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const calcularEdad = (fecha) => {
    const hoy = new Date();
    const cumple = new Date(fecha);
    let edad = hoy.getFullYear() - cumple.getFullYear();
    const mes = hoy.getMonth() - cumple.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < cumple.getDate())) {
      edad--;
    }
    return edad;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);
  
    if (Object.keys(validationErrors).length > 0) return;

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        first_name: formData.nombre,
        last_name: formData.apellido,
        fecha_nacimiento: formData.fechaNacimiento,
        genero: formData.genero,
        rol: 3
      };

      const res = await axios.post("http://127.0.0.1:8000/api/registro/", payload);

      const mensaje = res?.data?.message ?? "Registro exitoso";

      toast({
        title: mensaje,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: 'top',
      });

      navigate("/login");

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

  return (
    <Box 
      position="relative" 
      h="100vh" 
      w='100%' 
      textAlign="center" 
      bgGradient='radial(circle at center, cyan.600, teal.800)'
    >
      <AbsoluteCenter w="70vh" color="gray.700" axis="both">
        <Heading mb={5} color='white' fontSize='6xl'>
          Registrarse
        </Heading>

        <Box bg='whiteAlpha.400' borderRadius={30} p={5}>
        <form onSubmit={handleSubmit}>

          <GridItem>
            <Grid templateColumns="repeat(2, 1fr)" gap={3}>
              
              {/* Nombre */}
              <GridItem>
                <FormControl isInvalid={!!errors.nombre}>
                  <FormLabel>Nombre</FormLabel>
                  <Tooltip
                    label={errors.nombre}
                    isOpen={!!errors.nombre}
                    placement="bottom-end"
                    bg="red.500"
                    color="white"
                    hasArrow
                  >
                    <Input
                      placeholder="Ingrese su nombre"
                      value={formData.nombre}
                      onChange={(e) => {
                        handleChange("nombre")(e)
                        setErrors(prev => ({ ...prev, nombre: "" }))
                      }}
                      variant='custom'
                    />
                  </Tooltip>
                </FormControl>
              </GridItem>
  
              {/* Apellido */}
              <GridItem>
                <FormControl isInvalid={!!errors.apellido}>
                  <FormLabel>Apellido</FormLabel>
                  <Tooltip
                    label={errors.apellido}
                    isOpen={!!errors.apellido}
                    placement="bottom-end"
                    bg="red.500"
                    color="white"
                    hasArrow
                  >
                    <Input
                      placeholder="Ingrese su apellido"
                      value={formData.apellido}
                      onChange={(e) => {
                        handleChange("apellido")(e)
                        setErrors(prev => ({ ...prev, apellido: "" }))
                      }}
                      variant='custom'
                    />
                  </Tooltip>
                </FormControl>
              </GridItem>
            </Grid>

            {/* Email */}
            <FormControl isInvalid={!!errors.email} mt={3} mb={3}>
              <FormLabel>Email</FormLabel>
              <Tooltip
                label={errors.email}
                isOpen={!!errors.email}
                placement="bottom-end"
                bg="red.500"
                color="white"
                hasArrow
              >
                <InputGroup variant='custom'>
                  <InputLeftAddon pointerEvents="none" bg='teal.400'>
                    <AtSignIcon color="white" />
                  </InputLeftAddon>
                  <Input
                    type="email"
                    placeholder="Ingrese un email"
                    value={formData.email}
                    onChange={(e) => {
                      handleChange("email")(e)
                      setErrors(prev => ({ ...prev, email: "" }))
                    }}
                  />
                </InputGroup>
              </Tooltip>
            </FormControl>

            {/* Fecha de nacimiento */}
            <FormControl isInvalid={!!errors.fechaNacimiento}>
              <FormLabel>Fecha de nacimiento</FormLabel>
              <Tooltip
                label={errors.fechaNacimiento}
                isOpen={!!errors.fechaNacimiento}
                placement="bottom-end"
                bg="red.500"
                color="white"
                hasArrow
              >
                <InputGroup variant='custom'>
                  <InputLeftAddon pointerEvents="none" bg='teal.400'>
                    <CalendarIcon color="white" />
                  </InputLeftAddon>
                  <Input
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={(e) => {
                      handleChange("fechaNacimiento")(e)
                      setErrors(prev => ({ ...prev, fechaNacimiento: "" }))
                    }}
                  />
                </InputGroup>
              </Tooltip>
            </FormControl>
          </GridItem>
            
          {/* Contraseña */}
          <FormControl isInvalid={!!errors.password} my={3}>
            <FormLabel>Contraseña</FormLabel>
            <Tooltip
              label={errors.password}
              isOpen={!!errors.password}
              placement="bottom-end"
              bg="red.500"
              color="white"
              hasArrow
            >
              <InputGroup variant='custom'>
                <Input
                  type={show ? "text" : "password"}
                  placeholder="Ingrese su contraseña"
                  value={formData.password}
                  onChange={(e) => {
                    handleChange("password")(e)
                    setErrors(prev => ({ ...prev, password: "" }))
                  }}
                />
                {/* Icono con funcionalidad */}
                <InputRightAddon p="0" bg='teal.400'>
                  <IconButton
                    variant="link"
                    onClick={() => setShow(!show)}
                    icon={show ? <ViewOffIcon color="white" /> : <ViewIcon color="white" />}
                    aria-label="Mostrar u ocultar contraseña"
                  />
                </InputRightAddon>
              </InputGroup>
            </Tooltip>
          </FormControl>

          {/* Género */}
          <FormControl>
            <FormLabel>Género</FormLabel>
            <RadioGroup
              colorScheme='teal'
              onChange={(value) =>
                setFormData({ ...formData, genero: value })
              }
              value={formData.genero}
            >
              <Stack direction="row" mt={3}>
                <Radio size='lg' bg='white' value="Hombre">Hombre</Radio>
                <Radio size='lg' bg='white' value="Mujer">Mujer</Radio>
                <Radio size='lg' bg='white' value="Otro">Otro</Radio>
              </Stack>
            </RadioGroup>
          </FormControl>

          {/* Submit */}
          <Button type="submit" colorScheme='whiteAlpha' size='lg' rounded='full' my={4}>
              Registrarse
          </Button>

        </form>
        <Link href='http://localhost:5173/login' fontSize={14} color='white'>
          Ya tienes una cuenta? Ingresa <ExternalLinkIcon mx='2px' />
        </Link>
        </Box>
      </AbsoluteCenter>
    </Box>
  );
}
