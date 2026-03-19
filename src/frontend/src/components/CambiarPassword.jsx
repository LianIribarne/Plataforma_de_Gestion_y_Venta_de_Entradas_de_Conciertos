import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import {
  Button, FormControl, FormLabel,
  IconButton,
  Input, InputGroup,
  InputRightAddon,
  Modal,
  ModalBody, ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tooltip, useToast,
} from "@chakra-ui/react";
import React from 'react';
import api from "../services/api";
import { endpoints } from '../services/endpoints';

export default function CambiarPassword({ isOpen, onClose }) {
  const [show, setShow] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const toast = useToast();

  const [formData, setFormData] = React.useState({
    password: "",
    new_password: "",
  });

  const [errors, setErrors] = React.useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
        newErrors.password = "La contraseña es obligatoria";
    }

    if (!formData.new_password) {
      newErrors.new_password = "La nueva contraseña es obligatoria";
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = "La nueva contraseña debe tener al menos 8 caracteres";
    }

    return newErrors;
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  React.useEffect(() => {
    if (!isOpen) {
      setFormData({password: "", new_password: ""});
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      const payload = {
        current_password: formData.password,
        new_password: formData.new_password,
      };

      const res = await api.put(endpoints.usuarios.actualizar_password, payload);

      const mensaje = res?.data?.message ?? "Contraseña cambiada correctamente.";

      toast({
        title: mensaje,
        status: "success",
        duration: 2000,
        isClosable: true,
        position: 'top',
      });

      setFormData({password: "", new_password: ""})
      setShow(false)
      setShowNew(false)
      onClose()
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
        <ModalHeader color="white">Cambiar contraseña</ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody align='center'>
          <form onSubmit={handleSubmit}>

            {/* Contraseña */}
            <FormControl isInvalid={!!errors.password} my={3}>
              <FormLabel color='white'>Contraseña actual</FormLabel>
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
                    placeholder="Ingrese su contraseña actual"
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

            {/* Nueva Contraseña */}
            <FormControl isInvalid={!!errors.new_password} my={3}>
              <FormLabel color='white'>Nueva Contraseña</FormLabel>
              <Tooltip
                label={errors.new_password}
                isOpen={!!errors.new_password}
                placement="bottom-end"
                bg="red.500"
                color="white"
                hasArrow
              >
                <InputGroup variant='custom'>
                  <Input
                    type={showNew ? "text" : "password"}
                    placeholder="Ingrese la nueva contraseña"
                    value={formData.new_password}
                    onChange={(e) => {
                      handleChange("new_password")(e)
                      setErrors(prev => ({ ...prev, new_password: "" }))
                    }}
                    rounded='full'
                  />
                  {/* Icono con funcionalidad */}
                  <InputRightAddon p="0" bg='blackAlpha.400' borderRightRadius='full'>
                    <IconButton
                      variant="link"
                      onClick={() => setShowNew(!showNew)}
                      icon={showNew ? <ViewOffIcon color="white" /> : <ViewIcon color="white" />}
                      aria-label="Mostrar u ocultar contraseña"
                    />
                  </InputRightAddon>
                </InputGroup>
              </Tooltip>
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
            Cambiar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
