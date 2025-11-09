import React from 'react'
import {
  Box,
  AbsoluteCenter,
  Heading,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  IconButton,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage, 
  Tooltip,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon, AtSignIcon } from '@chakra-ui/icons';

export default function Form() {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);
  
    if (Object.keys(validationErrors).length === 0) {
      console.log("Formulario válido:", formData);
      // acá podrías enviar los datos al servidor
    }
  };

  return (
    <Box 
      position="relative" 
      h="100vh" 
      textAlign="center" 
      w='100%' 
      bgGradient='radial(circle at center, cyan.600, teal.800)'
    >
      <AbsoluteCenter w="70vh" color="gray.700" bg='whiteAlpha.400' borderRadius={30} p={10} axis="both">
        <Heading mb={5} textAlign="center" bg='teal.500' display='inline-block' rounded='full' p='7' color='white'>
          Inicio de Sesion
        </Heading>

        <form onSubmit={handleSubmit}>

          {/* Email */}
          <FormControl isInvalid={!!errors.email} mt={3} mb={3}>
              <FormLabel>Email</FormLabel>
              <Tooltip
                label={errors.email}
                isOpen={!!errors.email}
                placement="top"
                bg="red.500"
                color="white"
                hasArrow
              >
                <InputGroup variant='custom'>
                  <InputLeftAddon pointerEvents="none" bg='teal.500'>
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

          {/* Contraseña */}
          <FormControl isInvalid={!!errors.password} my={3}>
            <FormLabel>Contraseña</FormLabel>
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
                  onChange={(e) => {
                    handleChange("password")(e)
                    setErrors(prev => ({ ...prev, password: "" }))
                  }}
                />
                {/* Icono con funcionalidad */}
                <InputRightAddon p="0" bg='teal.500'>
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
          <Button type="submit" colorScheme='teal' size='lg' rounded='full' mt={4}>
              Iniciar Sesion
          </Button>
        </form>
      </AbsoluteCenter>
    </Box>
  );
}
