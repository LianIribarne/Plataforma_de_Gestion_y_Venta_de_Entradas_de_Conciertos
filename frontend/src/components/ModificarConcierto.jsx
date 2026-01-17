import { 
  Button, FormControl, FormLabel, Input, 
  Textarea, Box, HStack,
  Image, Text, Tooltip,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, ModalCloseButton,
  Menu, MenuButton, MenuList, MenuItem,
  useToast,
} from "@chakra-ui/react";
import React, { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@chakra-ui/icons'
import api from "../services/api";
import convertToWebp from "../utils/convertToWebp"

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
]

export default function ModificarConcierto({ isOpen, onClose, id }) {
  const [concierto, setConcierto] = useState(null)
  const [formData, setFormData] = React.useState({
    titulo: "",
    descripcion: "",
    fecha: "",
    show: "",
    puertas: "",
    lugar: null,
    artista: null,
    mood: null,
    imagen: null,
  })

  useEffect(() => {
    const fetchConcierto = async () => {
      try {
        const data = await api.get(`/conciertos/detalles_concierto/${id}`)
        setConcierto(data.data)
      } catch (err) {
        console.log(err)
      }
    }

    if (isOpen && id) {
      fetchConcierto()
    }
  }, [id, isOpen])

  useEffect(() => {
    if (!concierto) return

    setLugarSel(concierto.lugar.nombre)
    setMoodSel(concierto.mood.nombre)
    setArtistaSel(concierto.artista.nombre)
    setFormData({
      titulo: concierto.titulo,
      descripcion: concierto.descripcion,
      fecha: concierto.fecha,
      show: concierto.show_hora,
      puertas: concierto.puertas_hora,
      lugar: concierto.lugar.id,
      artista: concierto.artista.id,
      mood: concierto.mood.id,
      imagen: concierto.imagen
    })
    setPreview(concierto.imagen)
  }, [concierto])

  // Datos de errores, vista previa de la imagen y su inputRef
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const inputFileRef = React.useRef(null);

  const handleChange = (key) => (e) => {
    setFormData((p) => ({ ...p, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: "" }));
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
    
    return e
  };

  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload = new FormData();

    if (formData.titulo !== '') payload.append('titulo', formData.titulo)
    if (formData.descripcion !== '') payload.append('descripcion', formData.descripcion)
    if (formData.fecha !== '') payload.append('fecha', formData.fecha)
    if (formData.show !== '') payload.append('show_hora', formData.show)
    if (formData.puertas !== '') payload.append('puertas_hora', formData.puertas)
    if (formData.mood !== null) payload.append('mood_id', formData.mood)
    if (formData.artista !== null) payload.append('artista_id', formData.artista)
    if (formData.lugar !== null) payload.append('lugar_id', formData.lugar)
    if (formData.imagen instanceof File) payload.append("imagen", formData.imagen)
  
    try {
      const res = await api.patch(`/conciertos/modificar_concierto/${id}`, payload);

      const mensaje = res?.data?.message ?? "Se modifico con éxito";
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
        <ModalHeader color="white">Modificar Concierto</ModalHeader>
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
            Modificar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
