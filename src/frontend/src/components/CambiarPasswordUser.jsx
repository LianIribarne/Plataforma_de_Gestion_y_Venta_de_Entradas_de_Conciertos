import { useState, useEffect } from 'react'
import {
  Input, InputGroup,
  InputRightAddon, IconButton,
  Button, FormControl, FormLabel,
  Tooltip, useToast, Modal,
  ModalOverlay, ModalContent, ModalHeader, ModalFooter, 
  ModalBody, ModalCloseButton,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import api from "../services/api";

export default function ModificarUsuario({ isOpen, onClose, id }) {
  const [show, setShow] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState({ password: "" })

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
        newErrors.password = "La contraseña es obligatoria";
    }else if (formData.password.length < 8) {
      newErrors.password = "La nueva contraseña debe tener al menos 8 caracteres";
    }

    return newErrors;
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  useEffect(() => {
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
      const res = await api.patch(`/usuarios/admin/modificar_usuario/${id}`, {password: formData.password});

      const mensaje = res?.data?.message ?? "Se cambio con éxito";

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
        <ModalHeader color="white">Cambiar Contraseña del Usuario</ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody align='center'>
          <form onSubmit={handleSubmit}>
            
            {/* Contraseña */}
            <FormControl isInvalid={!!errors.password} my={3}>
              <FormLabel color='white'>Nueva Contraseña</FormLabel>
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
                    placeholder="Ingrese la nueva contraseña"
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
