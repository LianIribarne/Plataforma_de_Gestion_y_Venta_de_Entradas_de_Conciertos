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
import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function ModificarLugar({ isOpen, onClose, id }) {
  const [formData, setFormData] = React.useState({
    provincia: "",
    ciudad: "",
    lugar: "",
    direccion: "",
  })

  const toast = useToast()

  const [lugar, setLugar] = useState(null)

  const [errors, setErrors] = useState({});

  const [provincias, setProvincias] = useState([]);
  const [ciudades, setCiudades] = useState([]);

  const [provinciaSel, setProvinciaSel] = useState(null);
  const [ciudadSel, setCiudadSel] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    api.get("/conciertos/provincias/")
      .then(res => setProvincias(res.data))
      .catch(err => console.error(err));
  }, [isOpen]);

  useEffect(() => {
    if (!provinciaSel) return;

    api.get(`/conciertos/ciudades/?provincia_id=${provinciaSel.id}`)
      .then(res => setCiudades(res.data))
      .catch(err => console.error(err));
  }, [provinciaSel]);

  const handleChange = (key) => (e) => {
    setFormData((p) => ({ ...p, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  useEffect(() => {
    const fetchLugar = async () => {
      try {
        const { data } = await api.get(
          `/conciertos/lugares/?id=${id}`
        )
        setLugar(data[0])
      } catch (err) {
        console.error(err)
      }
    }

    if (isOpen && id) {
      fetchLugar()
    }
  }, [id, isOpen])

  useEffect(() => {
    if (!lugar) return

    setProvinciaSel(lugar.provincia)
    setCiudadSel(lugar.provincia.ciudad)

    setFormData({
      provincia: lugar.provincia.id,
      ciudad: lugar.provincia.ciudad.id,
      lugar: lugar.nombre,
      direccion: lugar.direccion,
    })
  }, [lugar])

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = Object.fromEntries(
        Object.entries({
          nombre: formData.lugar?.trim(),
          direccion: formData.direccion?.trim(),
          ciudad_id: formData.ciudad ? Number(formData.ciudad) : null,
        }).filter(([_, value]) => value !== "" && value !== null && value !== undefined)
      )

      const res = await api.patch(`/conciertos/modificar_lugar/${id}`, payload);

      const mensaje = res?.data?.message ?? "Se modifico con éxito";

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
      <ModalContent bg="whiteAlpha.500" borderRadius="20px">
        <ModalHeader color="white">Modificar Lugar</ModalHeader>
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
                  {provinciaSel?.nombre || "Seleccione una provincia"}
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
                  {ciudadSel?.nombre || "Seleccione una ciudad"}
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
            Modificar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
