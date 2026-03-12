import { AtSignIcon, CalendarIcon } from '@chakra-ui/icons';
import {
  Button, FormControl, FormLabel,
  Grid,
  GridItem, Input, InputGroup, InputLeftAddon,
  Modal,
  ModalBody, ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
  Tooltip, useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from 'react';
import api from "../services/api";

export default function ModificarUsuario({ isOpen, onClose, id }) {
  const toast = useToast();

  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get(
          `/usuarios/admin/detalles_usuario/${id}`
        )
        setUser(data)
      } catch (err) {
        console.error(err)
      }
    }

    if (isOpen && id) {
      fetchUser()
    }
  }, [id, isOpen])

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    fechaNacimiento: "",
    rol: "",
  })

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) return

    setFormData({
      nombre: user.first_name || "",
      apellido: user.last_name || "",
      email: user.email || "",
      fechaNacimiento: user.fecha_nacimiento
        ? user.fecha_nacimiento.split("/").reverse().join("-")
        : "",
      rol: String(user.rol.id),
    })
  }, [user])

  const validateForm = () => {
    const newErrors = {};

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
      const payload = Object.fromEntries(
        Object.entries({
          first_name: formData.nombre?.trim(),
          last_name: formData.apellido?.trim(),
          email: formData.email?.trim(),
          fecha_nacimiento: formData.fechaNacimiento,
          rol: formData.rol ? Number(formData.rol) : null,
        }).filter(([_, value]) => value !== "" && value !== null && value !== undefined)
      )

      const res = await api.patch(`/usuarios/admin/modificar_usuario/${id}`, payload);

      const mensaje = res?.data?.message ?? "Se modifico con éxito";

      toast({
        title: mensaje,
        status: "success",
        duration: 3000,
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
        <ModalHeader color="white">Modificar Usuario</ModalHeader>
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

            {/* ROL */}
            <FormControl mt={3}>
              <FormLabel color='white'>Rol</FormLabel>
              <RadioGroup
                colorScheme='whiteAlpha'
                onChange={(value) =>
                  setFormData({ ...formData, rol: value })
                }
                value={formData.rol}
              >
                <Stack direction="row" color='white'>
                  <Radio size='lg' value='1'>Administrador</Radio>
                  <Radio size='lg' value='2'>Organizador</Radio>
                  <Radio size='lg' value='3'>Cliente</Radio>
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
            Cancelar
          </Button>
          <Button
            rounded='full'
            colorScheme='whiteAlpha'
            transition="all 0.3s ease"
            onClick={handleSubmit}
          >
            Modificar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
