import React from 'react'
import {
  GridItem, Input, InputGroup, InputLeftAddon,
  InputRightAddon, IconButton, RadioGroup, Radio,
  Stack, Button, FormControl, FormLabel,
  Tooltip, useToast, Grid, Modal,
  ModalOverlay, ModalContent, ModalHeader, ModalFooter, 
  ModalBody, ModalCloseButton,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon, AtSignIcon, CalendarIcon } from '@chakra-ui/icons';
import api from "../services/api";

export default function CrearUsuario({ isOpen, onClose }) {
  const [show, setShow] = React.useState(false);
  const toast = useToast();

  const [formData, setFormData] = React.useState({
    nombre: "",
    apellido: "",
    email: "",
    fechaNacimiento: "",
    password: "",
    genero: "Hombre",
    rol: '1',
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
        first_name: formData.nombre,
        last_name: formData.apellido,
        email: formData.email,
        fecha_nacimiento: formData.fechaNacimiento,
        password: formData.password,
        genero: formData.genero,
        rol: Number(formData.rol),
      };

      // const res = await api.post("/usuarios/registro/", payload);

      const mensaje = res?.data?.message ?? "Se creo con éxito";

      toast({
        title: mensaje,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
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
    <Modal isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay backdropFilter='blur(10px)' />
      <ModalContent bg="whiteAlpha.500" borderRadius="20px" minW='500px'>
        <ModalHeader color="white">Crear Usuario</ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody align='center'>
          <form onSubmit={handleSubmit}>
            <GridItem>
              <Grid templateColumns="repeat(2, 1fr)" gap={3}>
             
                {/* Nombre */}
                <GridItem>
                  <FormControl isInvalid={!!errors.nombre}>
                    <FormLabel color='white'>Nombre</FormLabel>
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
                        rounded='full'
                      />
                    </Tooltip>
                  </FormControl>
                </GridItem>
   
                {/* Apellido */}
                <GridItem>
                  <FormControl isInvalid={!!errors.apellido}>
                    <FormLabel color='white'>Apellido</FormLabel>
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
                        rounded='full'
                      />
                    </Tooltip>
                  </FormControl>
                </GridItem>
              </Grid>
 
              {/* Email */}
              <FormControl isInvalid={!!errors.email} mt={3} mb={3}>
                <FormLabel color='white'>Email</FormLabel>
                <Tooltip
                  label={errors.email}
                  isOpen={!!errors.email}
                  placement="bottom-end"
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
                      onChange={(e) => {
                        handleChange("email")(e)
                        setErrors(prev => ({ ...prev, email: "" }))
                      }}
                      rounded='full'
                    />
                  </InputGroup>
                </Tooltip>
              </FormControl>
 
              {/* Fecha de nacimiento */}
              <FormControl isInvalid={!!errors.fechaNacimiento}>
                <FormLabel color='white'>Fecha de nacimiento</FormLabel>
                <Tooltip
                  label={errors.fechaNacimiento}
                  isOpen={!!errors.fechaNacimiento}
                  placement="bottom-end"
                  bg="red.500"
                  color="white"
                  hasArrow
                >
                  <InputGroup variant='custom'>
                    <InputLeftAddon pointerEvents="none" bg='blackAlpha.400' borderLeftRadius='full'>
                      <CalendarIcon color="white" />
                    </InputLeftAddon>
                    <Input
                      type="date"
                      value={formData.fechaNacimiento}
                      onChange={(e) => {
                        handleChange("fechaNacimiento")(e)
                        setErrors(prev => ({ ...prev, fechaNacimiento: "" }))
                      }}
                      rounded='full'
                    />
                  </InputGroup>
                </Tooltip>
              </FormControl>
            </GridItem>
           
            {/* Contraseña */}
            <FormControl isInvalid={!!errors.password} my={3}>
              <FormLabel color='white'>Contraseña</FormLabel>
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
                    rounded='full'
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
 
            {/* Género */}
            <FormControl>
              <FormLabel color='white'>Género</FormLabel>
              <RadioGroup
                colorScheme='whiteAlpha'
                onChange={(value) =>
                  setFormData({ ...formData, genero: value })
                }
                value={formData.genero}
              >
                <Stack direction="row" color='white'>
                  <Radio size='lg' value="Hombre">Hombre</Radio>
                  <Radio size='lg' value="Mujer">Mujer</Radio>
                  <Radio size='lg' value="Otro">Otro</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            {/* ROL */}
            <FormControl>
              <FormLabel color='white'>Rol</FormLabel>
              <RadioGroup
                colorScheme='whiteAlpha'
                onChange={(value) =>
                  setFormData({ ...formData, rol: value })
                }
                value={formData.rol}
              >
                <Stack direction="row" color='white'>
                  <Radio size='lg' value='1'>Cliente</Radio>
                  <Radio size='lg' value='2'>Organizador</Radio>
                  <Radio size='lg' value='3'>Administrador</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button 
            colorScheme="red"
            mr={3} 
            onClick={onClose}
            rounded='full'
          >
            Cerrar
          </Button>
          <Button
            rounded='full'
            colorScheme='whiteAlpha'
            transition="all 0.3s ease"
            onClick={handleSubmit}
          >
            Crear
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
