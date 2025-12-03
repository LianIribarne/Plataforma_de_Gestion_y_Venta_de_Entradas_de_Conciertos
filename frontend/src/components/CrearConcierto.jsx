import { 
  Button, FormControl, FormLabel, Input, 
  Textarea, Box, HStack, Heading,
  Image, Text, NumberInput, NumberInputField,
  NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Tooltip,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, ModalCloseButton,
  Menu, MenuButton, MenuList, MenuItem,
  useToast,
} from "@chakra-ui/react";
import React, { useState, useEffect } from 'react';
import { AddIcon, DeleteIcon, ChevronDownIcon } from '@chakra-ui/icons'
import formatoPrecio from "../utils/FormatoPrecio";

export default function CrearConcierto({ isOpen, onClose }) {
  // Datos generales del evento
  const [formData, setFormData] = React.useState({
    titulo: "",
    descripcion: "",
    fecha: "",
    show: "",
    puertas: "",
    lugar: "",
    artista: "",
    mood: "",
    limite_reserva: 2,
    imagen: null,
  })

  // Datos de errores, vista previa de la imagen y su inputRef
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const inputFileRef = React.useRef(null);

  // Datos de la/s entrada/s
  const [entradas, setEntradas] = useState([
    { nombre: "", precio: '500.00', cantidad: 1, limite: 1 }
  ]);

  const limiteEntradas = Math.max(...entradas.map(e => Number(e.limite) || 0));
  const limiteMinimo = Math.max(2, limiteEntradas);

  useEffect(() => {
    setFormData(prev => {
      // si el limite actual es menor al nuevo mínimo → lo corrijo
      if (prev.limite_reserva < limiteMinimo) {
        return { ...prev, limite_reserva: limiteMinimo };
      }
      return prev;
    });
  }, [limiteMinimo]);

  const handleChange = (key) => (e) => {
    setFormData((p) => ({ ...p, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const handleEntradaChange = (i, key, val) => {
    const next = [...entradas];
    next[i][key] = val;
    setEntradas(next);
  };

  const addEntrada = () => {
    setEntradas((p) => [...p, { nombre: "", precio: '500.00', cantidad: 1, limite: 1 }]);
  };

  const removeEntrada = (i) => {
    setEntradas((p) => p.filter((_, idx) => idx !== i));
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrors((p) => ({ ...p, imagen: "" }));

    if (!file.type.startsWith("image/")) {
      setErrors((p) => ({ ...p, imagen: "El archivo debe ser una imagen" }));
      cleanImage();
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, imagen: "Máx. 5MB" }));
      cleanImage();
      return;
    }
  
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.src = url;

    img.decode?.()
      .then(() => {
        // Valida si es cuadrada
        if (img.naturalWidth !== img.naturalHeight) {
          URL.revokeObjectURL(url);
          setFormData(prev => ({ ...prev, imagen: null }));
          setPreview(null);
          setErrors((p) => ({
            ...p,
            imagen: "La imagen debe ser cuadrada",
          }));
          cleanImage();
          return;
        }
  
        setFormData(prev => ({ ...prev, imagen: file }));
        setPreview(url);
      })
      // Error por lectura
      .catch(() => {
        URL.revokeObjectURL(url);
        setFormData(prev => ({ ...prev, imagen: null }));
        setPreview(null);
        setErrors((p) => ({
          ...p,
          imagen: "Error al leer la imagen",
        }));
        cleanImage();
      })
  }

  const cleanImage = () => {
    setFormData((p) => ({ ...p, imagen: null }));
    setPreview(null);
    if (inputFileRef.current) inputFileRef.current.value = "";
  };

  // Limpia la preview en caso de no ser valida la imagen
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const validateEntradas = () => {
    const errs = {};

    entradas.forEach((e, i) => {
      const itemErrors = {};

      if (!e.nombre.trim()) {
        itemErrors.nombre = "Falta nombre";
      }

      if ((Number(e.precio) > 1000000) || (Number(e.precio) < 500)) {
        itemErrors.precio = "Precio inválido";
      }

      if ((Number(e.cantidad) > 10000) || (Number(e.cantidad) < 1)) {
        itemErrors.cantidad = "Cantidad inválida";
      }

      if ((Number(e.limite) > 6) || (Number(e.limite) < 1)) {
        itemErrors.limite = "Limite inválido";
      }

      if (Object.keys(itemErrors).length > 0) {
        errs[i] = itemErrors;
      }
    });

    // detectar nombres repetidos
    const nombres = entradas.map((e) => e.nombre.trim()).filter(Boolean);
    const repetidos = nombres.filter(
      (n, i) => nombres.indexOf(n) !== i
    );

    if (repetidos.length) {
      entradas.forEach((e, i) => {
        if (repetidos.includes(e.nombre.trim())) {
          errs[i] = {
            ...(errs[i] ?? {}),
            nombre: "El nombre está repetido",
          };
        }
      });
    }

    return errs;
  };

  const validate = () => {
    const e = {};

    if (!formData.titulo) e.titulo = "El titulo es obligatorio";
    if (!formData.descripcion) e.descripcion = "La descripcion es obligatorio";
    if (!formData.fecha) e.fecha = "La fecha es obligatoria";
    if (!formData.show) e.show = "Es obligatorio";
    if (!formData.puertas) e.puertas = "Es obligatorio";
    if (!formData.lugar) e.lugar = "El lugar es obligatorio";
    if (!formData.artista) e.artista = "El artista es obligatorio";
    if (!formData.mood) e.mood = "El mood es obligatorio";
    if (!formData.limite_reserva) e.limite_reserva = "El limite es obligatorio";

    const entradasErr = validateEntradas();
    if (Object.keys(entradasErr).length > 0) e.entradas = entradasErr;
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    // datos listos
    const payload = new FormData();
    Object.entries(formData).forEach(([k, v]) => payload.append(k, v));

    payload.append("entradas", JSON.stringify(entradas));

    // ejemplo
    console.log("enviar", [...payload.entries()]);
  };

  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay backdropFilter='blur(10px)' />
      <ModalContent bg="whiteAlpha.500" borderRadius="20px" minW='1000px' mt={20}>
        <ModalHeader color="white">Crear Concierto</ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody align='center'>
          <form onSubmit={handleSubmit}>
            <Box display="flex">
              <Box flex="1">
                <FormControl mb={2} isInvalid={errors.titulo}>
                  <FormLabel color='white'>Titulo</FormLabel>
                  <Tooltip
                    label={errors.titulo}
                    isOpen={!!errors.titulo}
                    placement="top"
                    bg="red.500"
                    color="white"
                    hasArrow
                  >
                    <Input
                      placeholder="Ingrese un titulo"
                      variant='custom'
                      rounded='full'
                      value={formData.titulo} 
                      onChange={handleChange("titulo")}
                    />
                  </Tooltip>
                </FormControl>
    
                <FormControl mb={2} isInvalid={errors.descripcion}>
                  <FormLabel color='white'>Descripción</FormLabel>
                  <Tooltip
                    label={errors.descripcion}
                    isOpen={!!errors.descripcion}
                    placement="top"
                    bg="red.500"
                    color="white"
                    hasArrow
                  >
                    <Textarea 
                      placeholder='Ingrese una descripción' 
                      resize='none' 
                      variant='custom'
                      rounded='2xl'
                      value={formData.descripcion} 
                      onChange={handleChange("descripcion")}
                    />
                  </Tooltip>
                </FormControl>
    
                <HStack mb={2}>
                  <FormControl isInvalid={errors.fecha}>
                    <FormLabel color='white'>Fecha</FormLabel>
                    <Tooltip
                      label={errors.fecha}
                      isOpen={!!errors.fecha}
                      placement="top-end"
                      bg="red.500"
                      color="white"
                      hasArrow
                    >
                      <Input
                        type="date"
                        variant='custom'
                        rounded='full'
                        value={formData.fecha} 
                        onChange={handleChange("fecha")}
                      />
                    </Tooltip>
                  </FormControl>
    
                  <FormControl isInvalid={errors.show}>
                    <FormLabel color='white'>Show</FormLabel>
                    <Tooltip
                      label={errors.show}
                      isOpen={!!errors.show}
                      placement="top-end"
                      bg="red.500"
                      color="white"
                      hasArrow
                    >
                      <Input
                        type="time"
                        variant='custom'
                        rounded='full'
                        value={formData.show} 
                        onChange={handleChange("show")}
                      />
                    </Tooltip>
                  </FormControl>
    
                  <FormControl isInvalid={errors.puertas}>
                    <FormLabel color='white'>Puertas</FormLabel>
                    <Tooltip
                      label={errors.puertas}
                      isOpen={!!errors.puertas}
                      placement="top-end"
                      bg="red.500"
                      color="white"
                      hasArrow
                    >
                      <Input
                        type="time"
                        variant='custom'
                        rounded='full'
                        value={formData.puertas} 
                        onChange={handleChange("puertas")}
                      />
                    </Tooltip>
                  </FormControl>
                </HStack>
    
                <HStack>
                  <FormControl isInvalid={errors.lugar}>
                    <FormLabel color='white'>Lugar</FormLabel>
                    <Menu>
                      <Tooltip
                        label={errors.lugar}
                        isOpen={!!errors.lugar}
                        placement="top-end"
                        bg="red.500"
                        color="white"
                        hasArrow
                      >
                        <MenuButton
                          as={Button}
                          rightIcon={<ChevronDownIcon />}
                          rounded='full'
                          w="200px"
                        >
                          {formData.lugar || "Seleccione un lugar"}
                        </MenuButton>
                      </Tooltip>
    
                      <MenuList>
                        <MenuItem
                          onClick={() =>
                            handleChange("lugar")({ target: { value: "Niceto Club" } })
                          }
                        >
                          Niceto Club - Humboldt 1356, Palermo, Buenos Aires
                        </MenuItem>
                        
                        <MenuItem
                          onClick={() =>
                            handleChange("lugar")({ target: { value: "Option 2" } })
                          }
                        >
                          Option 2
                        </MenuItem>
                        
                        <MenuItem
                          onClick={() =>
                            handleChange("lugar")({ target: { value: "Option 3" } })
                          }
                        >
                          Option 3
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </FormControl>
    
                  <FormControl isInvalid={errors.artista}>
                    <FormLabel color='white'>Artista</FormLabel>
                    <Menu>
                      <Tooltip
                        label={errors.artista}
                        isOpen={!!errors.artista}
                        placement="top-end"
                        bg="red.500"
                        color="white"
                        hasArrow
                      >
                        <MenuButton
                          as={Button}
                          rightIcon={<ChevronDownIcon />}
                          rounded='full'
                          w="200px"
                        >
                          {formData.artista || "Seleccione un artista"}
                        </MenuButton>
                      </Tooltip>
    
                      <MenuList>
                        <MenuItem
                          onClick={() =>
                            handleChange("artista")({ target: { value: "Pale Waves" } })
                          }
                        >
                          <Image
                            boxSize='2rem'
                            borderRadius='full'
                            src='data:image/jpeg;base64,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'
                            alt='Pale Waves'
                            mr='12px'
                            sx={{
                              transition: "transform 0.25s ease",
                              "&:hover": {
                                transform: "scale(5)",
                              },
                            }}
                          />
                          Pale Waves
                        </MenuItem>
                        
                        <MenuItem
                          onClick={() =>
                            handleChange("artista")({ target: { value: "Option 2" } })
                          }
                        >
                          Option 2
                        </MenuItem>
                        
                        <MenuItem
                          onClick={() =>
                            handleChange("artista")({ target: { value: "Option 3" } })
                          }
                        >
                          Option 3
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </FormControl>
    
                  <FormControl isInvalid={errors.mood}>
                    <FormLabel color='white'>Mood</FormLabel>
                    <Menu>
                      <Tooltip
                        label={errors.mood}
                        isOpen={!!errors.mood}
                        placement="top-end"
                        bg="red.500"
                        color="white"
                        hasArrow
                      >
                        <MenuButton
                          as={Button}
                          rightIcon={<ChevronDownIcon />}
                          rounded='full'
                          w="200px"
                        >
                          {formData.mood || "Seleccione un mood"}
                        </MenuButton>
                      </Tooltip>
    
                      <MenuList>
                        <MenuItem
                          onClick={() =>
                            handleChange("mood")({ target: { value: "Para bailar" } })
                          }
                        >
                          Para bailar
                        </MenuItem>
                        
                        <MenuItem
                          onClick={() =>
                            handleChange("mood")({ target: { value: "Option 2" } })
                          }
                        >
                          Option 2
                        </MenuItem>
                        
                        <MenuItem
                          onClick={() =>
                            handleChange("mood")({ target: { value: "Option 3" } })
                          }
                        >
                          Option 3
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </FormControl>
                </HStack>
              </Box>
    
              <Box 
                w="300px" 
                ml={2} 
              >
                <FormControl mb={2} isInvalid={errors.imagen}>
                  <FormLabel color='white'>Imagen (opcional)</FormLabel>
                  <Tooltip
                    label={errors.imagen}
                    isOpen={!!errors.imagen}
                    placement="top-end"
                    bg="red.500"
                    color="white"
                    hasArrow
                  >
                    <Input
                      ref={inputFileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFile}
                      variant='unstyled'
                      rounded='full'
                      bg='whiteAlpha.400'
                      color='white'
                    />
                  </Tooltip>
                </FormControl>
    
                <Box 
                  w={250}
                  h={250}
                  bg='whiteAlpha.300'
                  borderRadius={10}
                  align='center'
                  mt={7}
                >
                  {preview ? (
                      <Image src={preview} alt="preview" style={{ maxWidth: 250, maxHeight: 250, borderRadius: 10 }} />
                  ) : (
                      <Text align='center' pt='14vh' color='whiteAlpha.700'><b>Vista previa de la imagen</b></Text>
                  )}
                </Box>
              </Box>
            </Box>

            <Box mt={4} maxW='700px'>
              <Text mb={4} fontSize='2xl' align='center' color='white'><b>Tipos de Entradas</b></Text>
              <Box>
                {entradas.map((item, i) => (
                  <HStack mb={2} mr={1} key={i}>
                    <FormControl isInvalid={!item.nombre}>
                      <FormLabel color='white'>Nombre</FormLabel>
                      <Tooltip
                        label={errors?.entradas?.[i]?.nombre}
                        isOpen={!!errors?.entradas?.[i]?.nombre}
                        placement="top-end"
                        bg="red.500"
                        color="white"
                        hasArrow
                      >
                        <Input
                          placeholder="Ingrese un nombre"
                          variant='custom'
                          rounded='full'
                          value={item.nombre}
                          onChange={(e) => handleEntradaChange(i, "nombre", e.target.value)}
                        />
                      </Tooltip>
                    </FormControl>
                
                    <FormControl isInvalid={!item.precio}>
                      <FormLabel color='white'>Precio</FormLabel>
                      <NumberInput
                        min={500}
                        max={1000000}
                        step={100}
                        value={item.precio}
                        onChange={(valueString, valueNumber) => {
                          handleEntradaChange(i, "precio", valueString);
                        }}
                        variant='custom'
                        precision={2}
                      >
                        <Tooltip
                          label={`$${formatoPrecio(item.precio)}`}
                          placement="top-end"
                          isOpen
                          hasArrow
                        >
                          <NumberInputField rounded='full' />
                        </Tooltip>
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                      
                    <FormControl isInvalid={!item.cantidad}>
                      <FormLabel color='white'>Cantidad</FormLabel>
                      <NumberInput
                        min={1}
                        max={10000}
                        value={item.cantidad}
                        onChange={(v) => handleEntradaChange(i, "cantidad", v)}
                        variant='custom'
                      >
                        <NumberInputField rounded='full' />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                      
                    <FormControl isInvalid={!item.limite}>
                      <FormLabel color='white'>Limite reserva</FormLabel>
                      <NumberInput
                        min={1}
                        max={6}
                        value={item.limite}
                        onChange={(v) => handleEntradaChange(i, "limite", v)}
                        variant='custom'
                      >
                        <NumberInputField rounded='full' />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                      
                    <Button onClick={() => removeEntrada(i)} display={i === 0 ? 'none' : 'grid'} rounded='full' mt={8}><DeleteIcon /></Button>
                  </HStack>
                ))}
    
                {entradas.length < 4 && (
                  <Button onClick={addEntrada} rounded='full'>
                    Agregar<AddIcon ml={1} mt={1} boxSize={3} />
                  </Button>
                )}
              </Box>
              <FormControl isInvalid={errors.limite_reserva} mt={4}>
                <FormLabel color='white' textAlign='center'>Limite de reserva total</FormLabel>
                <Tooltip
                  label={errors.limite_reserva}
                  isOpen={!!errors.limite_reserva}
                  placement="top"
                  bg="red.500"
                  color="white"
                  hasArrow
                >
                  <NumberInput
                    min={limiteMinimo}
                    max={8}
                    value={formData.limite_reserva} 
                    onChange={(valueString) =>
                      setFormData((p) => ({ ...p, limite_reserva: valueString }))
                    }
                    variant='custom'
                    maxW={100}
                  >
                    <NumberInputField rounded='full' />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </Tooltip>
              </FormControl>
            </Box>
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
  )
}
