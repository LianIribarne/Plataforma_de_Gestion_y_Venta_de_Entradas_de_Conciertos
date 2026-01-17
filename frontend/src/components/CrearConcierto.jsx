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
import formatoPrecio from "../utils/formatoPrecio";
import api from "../services/api";
import convertToWebp from "../utils/convertToWebp"

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
]

export default function CrearConcierto({ isOpen, onClose }) {
  // Datos generales del evento
  const [formData, setFormData] = React.useState({
    titulo: "",
    descripcion: "",
    fecha: "",
    show: "",
    puertas: "",
    lugar: null,
    artista: null,
    mood: null,
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

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors((p) => ({
        ...p,
        imagen: "Formato permitido: JPG, PNG o WEBP",
      }));
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
        
        convertToWebp({ file, maxSize: 1024, quality: 0.8 })
          .then((webpFile) => {
            const previewUrl = URL.createObjectURL(webpFile);
            
            setFormData(prev => ({ ...prev, imagen: webpFile }));
            setPreview(previewUrl);
          })
          .catch(() => {
            setErrors(p => ({
              ...p,
              imagen: "Error al procesar la imagen",
            }));
            cleanImage();
          });
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

  const validateForm = () => {
    const e = {};

    if (!formData.titulo) e.titulo = "El titulo es obligatorio";
    if (!formData.descripcion) e.descripcion = "La descripcion es obligatorio";
    if (!formData.fecha) e.fecha = "La fecha es obligatoria";
    if (!formData.show) e.show = "Es obligatorio";
    if (!formData.puertas) e.puertas = "Es obligatorio";
    if (formData.lugar === null) e.lugar = "El lugar es obligatorio";
    if (formData.artista === null) e.artista = "El artista es obligatorio";
    if (!formData.mood) e.mood = "El mood es obligatorio";
    if (!formData.limite_reserva) e.limite_reserva = "El limite es obligatorio";

    const entradasErr = validateEntradas();
    if (Object.keys(entradasErr).length > 0) e.entradas = entradasErr;
    
    return e
  };

  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
  
    try {
      const payload = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        artista_id: formData.artista,
        lugar_id: formData.lugar,
        fecha: formData.fecha,
        show_hora: formData.show,
        puertas_hora: formData.puertas,
        mood_id: formData.mood,
        limite_reserva_total: formData.limite_reserva,
        tipos_entrada: entradas.map((e) => ({
          nombre: e.nombre,
          precio: Number(e.precio),
          cantidad_total: Number(e.cantidad),
          limite_reserva: Number(e.limite)
        }))
      }

      const res = await api.post("/conciertos/crear_concierto/", payload);

      const conciertoId = res?.data?.id;
      
      if (formData.imagen && conciertoId) {
        const formDataImg = new FormData();
        formDataImg.append("imagen", formData.imagen);

        await api.patch(`/conciertos/modificar_concierto/${conciertoId}`, formDataImg);
      }

      const mensaje = res?.data?.message ?? "Se creó con éxito";
      toast({
        title: mensaje,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
    
      onClose();
    
    } catch (error) {
      let msg = "Error inesperado";
    
      const data = error?.response?.data;
      if (data && typeof data === "object") {
        const firstField = Object.keys(data)[0];
        const firstError = data[firstField]?.[0];
        if (firstError) msg = firstError;
      }
    
      console.log(error);
    
      toast({
        title: "Error",
        description: msg,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
    }
  };

  const [lugares, setLugares] = useState([])
  const [lugarSel, setLugarSel] = useState(null)

  useEffect(() => {
    if (!isOpen) return

    api.get("/conciertos/lugares/?activo=true")
      .then(res => setLugares(res.data))
      .catch(console.error)
  }, [isOpen])

  const [artistas, setArtistas] = useState([])
  const [artistaSel, setArtistaSel] = useState(null)

  useEffect(() => {
    if (!isOpen) return

    api.get("/conciertos/artistas/?activo=true")
      .then(res => setArtistas(res.data.results))
      .catch(console.error)
  }, [isOpen])

  const [menuOpen, setMenuOpen] = useState(false)

  const [moods, setMoods] = useState([])
  const [moodSel, setMoodSel] = useState(null)

  useEffect(() => {
    if (!isOpen) return

    api.get("/conciertos/concierto-meta/?tipo=mood")
      .then(res => setMoods(res.data.results))
      .catch(console.error)
  }, [isOpen])

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
                    <Menu onOpen={() => setMenuOpen(true)} onClose={() => setMenuOpen(false)}>
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
                          {lugarSel || "Seleccionar lugar"}
                        </MenuButton>
                      </Tooltip>
    
                      <MenuList maxH="200px" overflowY="auto">
                        {lugares.map((l) => (
                          <MenuItem
                            key={l.id}
                            onClick={() => {
                              setLugarSel(l.nombre)
                              handleChange("lugar")({ target: { value: l.id } })
                            }}
                          >
                            <Box>
                              <Text fontWeight="semibold">{l.nombre}</Text>
                              <Text fontSize="sm" color="gray.500">
                                {l.direccion} · {l.provincia.ciudad.nombre}, {l.provincia.nombre}
                              </Text>
                            </Box>
                          </MenuItem>
                        ))}
                      </MenuList>
                    </Menu>
                  </FormControl>
    
                  <FormControl isInvalid={errors.artista}>
                    <FormLabel color='white'>Artista</FormLabel>
                    <Menu onOpen={() => setMenuOpen(true)} onClose={() => setMenuOpen(false)}>
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
                          {artistaSel || "Seleccionar artista"}
                        </MenuButton>
                      </Tooltip>
    
                      <MenuList maxH="200px" overflowY="auto">
                        {artistas.map((a) => (
                          <MenuItem
                            key={a.id}
                            onClick={() => {
                              setArtistaSel(a.nombre)
                              handleChange("artista")({ target: { value: a.id } })
                            }}
                          >
                            <Image
                              boxSize='2rem'
                              borderRadius='full'
                              src={a.imagen}
                              alt={a.nombre}
                              mr='12px'
                            />
                            {a.nombre}
                          </MenuItem>
                        ))}
                      </MenuList>
                    </Menu>
                  </FormControl>
    
                  <FormControl isInvalid={errors.mood}>
                    <FormLabel color='white'>Mood</FormLabel>
                    <Menu onOpen={() => setMenuOpen(true)} onClose={() => setMenuOpen(false)}>
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
                          {moodSel || "Seleccionar mood"}
                        </MenuButton>
                      </Tooltip>
    
                      <MenuList maxH="200px" overflowY="auto">
                        {moods.map(m => (
                          <MenuItem
                            key={m.id}
                            onClick={() => {
                              setMoodSel(m.nombre)
                              handleChange("mood")({ target: { value: m.id } })
                            }}
                          >
                            {m.nombre}
                          </MenuItem>
                        ))}
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
                    <FormControl isInvalid={!!item.nombre}>
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
                
                    <FormControl isInvalid={!!item.precio}>
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
                          isOpen={!menuOpen}
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
                      
                    <FormControl isInvalid={!!item.cantidad}>
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
                      
                    <FormControl isInvalid={!!item.limite}>
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
