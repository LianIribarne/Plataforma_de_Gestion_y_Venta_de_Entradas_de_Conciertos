import { 
  Button, FormControl, FormLabel, Input, HStack,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, ModalCloseButton,
  Tooltip, useToast, NumberInput, NumberInputField,
  NumberInputStepper, NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { useState, useEffect } from 'react';
import formatoPrecio from "../utils/FormatoPrecio";
import api from '../services/api'

export default function CrearTipo({ isOpen, onClose, concierto }) {
  const [formData, setFormData] = useState({
    nombre: "",
    precio: "",
    cantidad: "",
    limite_reserva: "",
    evento: null
  })

  const toast = useToast()

  useEffect(() => {
    if (!concierto) return

    setFormData({
      precio: "500.00",
      cantidad: "1",
      limite_reserva: "1",
      evento: concierto ?? null
    })
  }, [concierto])

  const [errors, setErrors] = useState({})

  const handleChange = (key) => (e) => {
    setFormData((p) => ({ ...p, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: "" }));
  }

  const handleNumberChange = (key) => (valueString, valueNumber) => {
    setFormData((p) => ({
      ...p,
      [key]: valueString === "" ? "" : valueNumber
    }));
    setErrors((p) => ({ ...p, [key]: "" }));
  }

  const handlePrecioChange = (value) => {
    const clean = value.replace(",", ".");
    
    if (!/^\d*\.?\d{0,2}$/.test(clean)) return;

    setFormData((p) => ({ ...p, precio: clean }));
    setErrors((p) => ({ ...p, precio: "" }));
  }

  const validateForm = () => {
    const newErrors = {};

    if (formData.nombre === '') newErrors.nombre = "El nombre es obligatorio";
    if ((Number(formData.precio) > 1000000) || (Number(formData.precio) < 500)) newErrors.precio = "Precio inválido"
    if ((Number(formData.cantidad) > 10000) || (Number(formData.cantidad) < 1)) newErrors.cantidad = "Cantidad inválida"
    if ((Number(formData.limite_reserva) > 6) || (Number(formData.limite_reserva) < 1)) newErrors.limite_reserva = "Limite inválido"
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);
  
    if (Object.keys(validationErrors).length > 0) return;

    try {
      const payload = {
        nombre: formData.nombre,
        precio: Number(formData.precio),
        cantidad_total: Number(formData.cantidad),
        limite_reserva: Number(formData.limite_reserva),
        evento: formData.evento
      }

      const res = await api.post("/conciertos/agregar_tipo/", payload);

      const mensaje = res?.data?.message ?? "Se creo con éxito";

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
      <ModalContent bg="whiteAlpha.500" borderRadius="20px" minW={800}>
        <ModalHeader color="white">Crear Tipo</ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody>
          <HStack mb={2} mr={1}>
            <FormControl isInvalid={!!errors?.nombre}>
              <FormLabel color='white'>Nombre</FormLabel>
              <Tooltip
                label={errors?.nombre}
                isOpen={!!errors?.nombre}
                placement="top-end"
                bg="red.500"
                color="white"
                hasArrow
              >
                <Input
                  placeholder="Ingrese un nombre"
                  variant='custom'
                  rounded='full'
                  value={formData.nombre}
                  onChange={handleChange("nombre")}
                />
              </Tooltip>
            </FormControl>
        
            <FormControl isInvalid={!!errors?.precio}>
              <FormLabel color='white'>Precio</FormLabel>
              <NumberInput
                min={500}
                max={1000000}
                step={.01}
                precision={2}
                value={formData.precio}
                clampValueOnBlur={false}
                keepWithinRange={false}
                variant='custom'
              >
                <Tooltip
                  label={`$${formatoPrecio(formData.precio)}`}
                  placement="top-end"
                  hasArrow
                  isOpen
                >
                  <NumberInputField
                    inputMode="decimal"
                    rounded='full'
                    onChange={(e) => handlePrecioChange(e.target.value)}
                  />
                </Tooltip>
              </NumberInput>
            </FormControl>
              
            <FormControl isInvalid={!!errors?.cantidad}>
              <FormLabel color='white'>Cantidad</FormLabel>
              <NumberInput
                min={1}
                max={10000}
                value={formData.cantidad}
                onChange={handleNumberChange("cantidad")}
                variant='custom'
              >
                <NumberInputField rounded='full' />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl isInvalid={!!errors?.limite_reserva}>
              <FormLabel color='white'>Limite reserva</FormLabel>
              <NumberInput
                min={1}
                max={6}
                value={formData.limite_reserva}
                onChange={handleNumberChange("limite_reserva")}
                variant='custom'
              >
                <NumberInputField rounded='full' />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </HStack>
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
  )
}
