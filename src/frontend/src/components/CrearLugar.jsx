import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Button, FormControl, FormLabel, Input,
  Menu, MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody, ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tooltip, useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from 'react';
import api from '../services/api';
import { endpoints } from "../services/endpoints";

export default function CrearLugar({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    provincia: "",
    ciudad: "",
    lugar: "",
    direccion: "",
  })

  const toast = useToast()

  const [errors, setErrors] = useState({});

  const [provincias, setProvincias] = useState([]);
  const [ciudades, setCiudades] = useState([]);

  const [provinciaSel, setProvinciaSel] = useState(null);
  const [ciudadSel, setCiudadSel] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    api.get(endpoints.conciertos.provincias)
      .then(res => setProvincias(res.data))
      .catch(err => console.error(err));
  }, [isOpen]);

  useEffect(() => {
    if (!provinciaSel) return;

    api.get(endpoints.conciertos.ciudades, {
      params: {
        provincia_id: provinciaSel.id
      }
    })
      .then(res => setCiudades(res.data))
      .catch(err => console.error(err));
  }, [provinciaSel]);

  const handleChange = (key) => (e) => {
    setFormData((p) => ({ ...p, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.provincia === '') newErrors.provincia = "La provincia es obligatoria";
    if (formData.ciudad === '') newErrors.ciudad = "La ciudad es obligatoria";
    if (!formData.lugar) newErrors.lugar = "El nombre del lugar es obligatorio";
    if (!formData.direccion) newErrors.direccion = "La direccion es obligatoria";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      const payload = {
        nombre: formData.lugar,
        direccion: formData.direccion,
        ciudad_id: formData.ciudad,
      };

      const res = await api.post(endpoints.conciertos.registrar_lugar, payload);

      const mensaje = res?.data?.message ?? "Se creo con éxito";

      toast({
        title: mensaje,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: 'top',
      });

      setFormData({
        provincia: "",
        ciudad: "",
        lugar: "",
        direccion: "",
      })

      setProvinciaSel(null)
      setCiudadSel(null)

      onClose();
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
      <ModalContent bg="whiteAlpha.500" borderRadius="20px">
        <ModalHeader color="white">Crear Lugar</ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody>
          <FormControl mb={2} isInvalid={errors.provincia}>
            <FormLabel color='white'>Provincia</FormLabel>
            <Menu>
              <Tooltip
                label={errors.provincia}
                isOpen={!!errors.provincia}
                placement="top"
                bg="red.500"
                color="white"
                hasArrow
              >
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  rounded='full'
                  w="400px"
                >
                  {provinciaSel?.nombre || "Seleccionar provincia"}
                </MenuButton>
              </Tooltip>
              <MenuList maxH="200px" overflowY="auto">
                {provincias.map((prov) => (
                  <MenuItem
                    key={prov.id}
                    onClick={() => {
                      setProvinciaSel(prov);
                      setCiudadSel(null);
                      setCiudades([]);
                      setFormData(p => ({ ...p, provincia: prov.id }));
                    }}
                  >
                    {prov.nombre}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </FormControl>

          <FormControl mb={2} isInvalid={errors.ciudad}>
            <FormLabel color='white'>Ciudad</FormLabel>
            <Menu>
              <Tooltip
                label={errors.ciudad}
                isOpen={!!errors.ciudad}
                placement="top"
                bg="red.500"
                color="white"
                hasArrow
              >
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  rounded='full'
                  w="400px"
                  onChange={(e) => {
                    setCiudad(e.target.value);
                    handleChange(e);
                  }}
                  isDisabled={!provinciaSel}
                >
                  {ciudadSel?.nombre || "Seleccionar ciudad"}
                </MenuButton>
              </Tooltip>
              <MenuList maxH="200px" overflowY="auto">
                {ciudades.map((c) => (
                  <MenuItem
                    key={c.id}
                    onClick={() =>{
                      setCiudadSel(c);
                      setFormData(p => ({ ...p, ciudad: c.id }));
                    }}
                  >
                    {c.nombre}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </FormControl>

          <FormControl mb={2} isInvalid={errors.lugar}>
            <FormLabel color='white'>Nombre del lugar</FormLabel>
            <Tooltip
              label={errors.lugar}
              isOpen={!!errors.lugar}
              placement="top"
              bg="red.500"
              color="white"
              hasArrow
            >
              <Input
                placeholder="Ingrese un nombre"
                variant='custom'
                rounded='full'
                value={formData.lugar}
                onChange={handleChange("lugar")}
                w="400px"
              />
            </Tooltip>
          </FormControl>

          <FormControl mb={2} isInvalid={errors.direccion}>
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
                placeholder="Ingrese una dirección"
                variant='custom'
                rounded='full'
                value={formData.direccion}
                onChange={handleChange("direccion")}
                w="400px"
              />
            </Tooltip>
          </FormControl>
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
