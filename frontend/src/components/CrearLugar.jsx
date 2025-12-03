import { 
  Button, FormControl, FormLabel, Input, 
  Box, HStack, Image,
  Menu, MenuButton, MenuList, MenuItem,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, ModalCloseButton,
  Text, Tooltip, useToast,
} from "@chakra-ui/react";
import React, { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@chakra-ui/icons'
import provinciasCiudades from "../data/provincias_ciudades.json";

export default function CrearLugar({ isOpen, onClose }) {
  const [formData, setFormData] = React.useState({
    provincia: "",
    ciudad: "",
    lugar: "",
  })

  const [errors, setErrors] = useState({});

  const [provincia, setProvincia] = useState("");
  const [ciudad, setCiudad] = useState("");

  const provincias = Object.keys(provinciasCiudades);
  const ciudades = provincia ? provinciasCiudades[provincia] : [];

  const handleChange = (key) => (e) => {
    setFormData((p) => ({ ...p, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const validate = () => {
    const e = {};

    if (formData.provincia === '') e.provincia = "La provincia es obligatoria";
    if (formData.ciudad === '') e.ciudad = "La ciudad es obligatoria";
    if (!formData.lugar) e.lugar = "El lugar es obligatorio";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    // datos listos
    const payload = new FormData();
    Object.entries(formData).forEach(([k, v]) => payload.append(k, v));

    // ejemplo
    console.log("enviar", [...payload.entries()]);
  };

  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay backdropFilter='blur(10px)' />
      <ModalContent bg="whiteAlpha.500" borderRadius="20px">
        <ModalHeader color="white">Crear Lugar</ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody>
            <FormControl isInvalid={errors.provincia}>
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
                    {provincia || "Seleccione una provincia"}
                  </MenuButton>
                </Tooltip>
                <MenuList maxH="200px" overflowY="auto">
                  {provincias.map((prov) => (
                    <MenuItem 
                      key={prov}
                      onClick={() => {
                        setProvincia(prov);
                        setCiudad("");
                        handleChange({ target: { name: "provincia", value: prov } });
                      }}
                    >
                      {prov}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </FormControl>

            <FormControl isInvalid={errors.ciudad}>
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
                    isDisabled={!provincia}
                  >
                    {ciudad || "Seleccione una ciudad"}
                  </MenuButton>
                </Tooltip>
                <MenuList maxH="200px" overflowY="auto">
                  {ciudades.map((c) => (
                    <MenuItem 
                      key={c}
                      onClick={() =>{
                        setCiudad(c);
                        handleChange({ target: { name: "ciudad", value: c } });
                      }}
                    >
                      {c}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </FormControl>

            <FormControl mb={2} isInvalid={errors.lugar}>
              <FormLabel color='white'>Lugar</FormLabel>
              <Tooltip
                label={errors.lugar}
                isOpen={!!errors.lugar}
                placement="top"
                bg="red.500"
                color="white"
                hasArrow
              >
                <Input
                  placeholder="Ingrese un lugar"
                  variant='custom'
                  rounded='full'
                  value={formData.lugar} 
                  onChange={handleChange("lugar")}
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
