import React from 'react'
import {
  GridItem, Input, InputGroup, InputLeftAddon,
  RadioGroup, Radio, ModalBody, ModalCloseButton,
  Stack, Button, FormControl, FormLabel,
  Tooltip, useToast, Grid, Modal,
  ModalOverlay, ModalContent, ModalHeader, ModalFooter, 
} from "@chakra-ui/react";
import { AtSignIcon, CalendarIcon } from '@chakra-ui/icons';
import { useAuth } from "../services/AuthContext";
import api from "../services/api";

export default function ActualizarPerfil({ isOpen, onClose }) {
  const toast = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = React.useState({
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
    fechaNacimiento: user.fecha_nacimiento
      ? user.fecha_nacimiento.split("/").reverse().join("-")
      : "",
    genero: user.genero
      ? user.genero.charAt(0).toLowerCase() + user.genero.slice(1)
      : "",
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        fechaNacimiento: user.fecha_nacimiento
          ? user.fecha_nacimiento.split("/").reverse().join("-")
          : "",
        genero: user.genero
          ? user.genero.charAt(0).toLowerCase() + user.genero.slice(1)
          : "",
      });
    }
  }, [user]);

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

  React.useEffect(() => {
      if (!isOpen) {
        setFormData({
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          fechaNacimiento: user.fecha_nacimiento
            ? user.fecha_nacimiento.split("/").reverse().join("-")
            : "",
          genero: user.genero
            ? user.genero.charAt(0).toLowerCase() + user.genero.slice(1)
            : "",
        });
      }
    }, [isOpen]);

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
        genero: formData.genero,
      };

      const res = await api.patch("/usuarios/actualizar_perfil/", payload);

      const mensaje = res?.data?.message ?? "Perfil actualizado correctamente.";

      toast({
        title: mensaje,
        status: "success",
        duration: 2000,
        isClosable: true,
        position: 'top',
      });

      onClose();

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      let msg = "Error inesperado";

      const data = error?.response?.data;
      console.log(data)
        
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
        <ModalHeader color="white">Actualizar Perfil</ModalHeader>
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
 
            {/* Género */}
            <FormControl mt={2}>
              <FormLabel color='white'>Género</FormLabel>
              <RadioGroup
                colorScheme='whiteAlpha'
                onChange={(value) =>
                  setFormData({ ...formData, genero: value })
                }
                value={formData.genero}
              >
                <Stack direction="row" color='white'>
                  <Radio size='lg' value="hombre">Hombre</Radio>
                  <Radio size='lg' value="mujer">Mujer</Radio>
                  <Radio size='lg' value="otro">Otro</Radio>
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
            _hover={{transform: "scale(1.1)"}}
          >
            Cancelar
          </Button>
          <Button
            rounded='full'
            transition="all 0.3s ease"
            onClick={handleSubmit}
            _hover={{transform: "scale(1.1)"}}
          >
            Actualizar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
