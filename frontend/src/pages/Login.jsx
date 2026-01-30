import { AtSignIcon, ExternalLinkIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import {
  AbsoluteCenter,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  Link,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import React from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

export default function Form() {
  const { loginUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });

  const [show, setShow] = React.useState(false);

  const [errors, setErrors] = React.useState({});

  const validateForm = () => {
    const newErrors = {};

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

    return newErrors;
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      const data = await loginUser(formData.email, formData.password);

      const mensaje = data?.message ?? "Bienvenido";

      toast({
        title: mensaje,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: 'top',
      });

      navigate("/conciertos");

    } catch (error) {
      let msg = "Error inesperado";
      const data = error?.response?.data;

      if (data && typeof data === "object") {
        const firstField = Object.keys(data)[0];
        const raw = data[firstField];

        msg = Array.isArray(raw) ? raw[0] : raw;
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
      textAlign="center"
      w='100%'
      bgGradient='linear(to-r, cyan.800, cyan.500, cyan.800)'
    >
      <AbsoluteCenter w="70vh" color="gray.700" axis="both">
        <Heading textAlign="center" color='white' mb={4} fontSize='6xl'>
          Ingresar
        </Heading>
        <Box bg='whiteAlpha.400' borderRadius={30} p={5}>
        <form onSubmit={handleSubmit}>

          {/* Email */}
          <FormControl isInvalid={!!errors.email} mt={3} mb={3}>
              <FormLabel color='white'>Email</FormLabel>
              <Tooltip
                label={errors.email}
                isOpen={!!errors.email}
                placement="top"
                bg="red.500"
                color="white"
                hasArrow
              >
                <InputGroup variant='custom'>
                  <InputLeftAddon pointerEvents="none" bg='blackAlpha.400' borderLeftRadius='full'>
                    <AtSignIcon color="white" />
                  </InputLeftAddon>
                  <Input
                    type="email"
                    placeholder="Ingrese un email"
                    value={formData.email}
                    rounded='full'
                    onChange={(e) => {
                      handleChange("email")(e)
                      setErrors(prev => ({ ...prev, email: "" }))
                    }}
                  />
                </InputGroup>
              </Tooltip>
            </FormControl>

          {/* Contraseña */}
          <FormControl isInvalid={!!errors.password} my={3}>
            <FormLabel color='white'>Contraseña</FormLabel>
            <Tooltip
              label={errors.password}
              isOpen={!!errors.password}
              placement="top-end"
              bg="red.500"
              color="white"
              hasArrow
            >
              <InputGroup variant='custom'>
                <Input
                  type={show ? "text" : "password"}
                  placeholder="Ingrese su contraseña"
                  value={formData.password}
                  rounded='full'
                  onChange={(e) => {
                    handleChange("password")(e)
                    setErrors(prev => ({ ...prev, password: "" }))
                  }}
                />
                {/* Icono con funcionalidad */}
                <InputRightAddon p="0" bg='blackAlpha.400' borderRightRadius='full'>
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

          {/* Submit */}
          <Button type="submit" colorScheme='blackAlpha' size='lg' rounded='full' my={4}>
              Iniciar Sesion
          </Button>
        </form>
        <Link href='http://localhost:5173/register' fontSize={14} color='white'>
          No tienes una cuenta? Registrarse <ExternalLinkIcon mx='2px' />
        </Link>
        </Box>
      </AbsoluteCenter>
    </Box>
  );
}
