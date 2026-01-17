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
import api from "../services/api";
import convertToWebp from "../utils/convertToWebp"

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function CrearArtista({ isOpen, onClose }) {
  const [formData, setFormData] = React.useState({
    nombre: "",
    pais_origen: null,
    categoria: null,
    imagen: null,
  })

  const toast = useToast()

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

    if (formData.nombre === "") e.nombre = "El nombre es obligatorio";
    if (!formData.pais_origen) e.pais_origen = "El pais es obligatorio";
    if (!formData.categoria) e.categoria = "La categoria es obligatorio";
    if (!formData.imagen) e.imagen = "La imagen es obligatoria";
    
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    const payload = new FormData();

    payload.append("nombre", formData.nombre);
    payload.append("categoria_id", formData.categoria);
    payload.append("imagen", formData.imagen);
    payload.append("pais_origen_id", formData.pais_origen);

    try {
      const res = await api.post("/conciertos/crear_artista/", payload);

      const mensaje = res?.data?.message ?? "Se creo con éxito";

      toast({
        title: mensaje,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: 'top',
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

  const [categorias, setCategorias] = useState([])
  const [categoriaSel, setCategoriaSel] = useState("")

  useEffect(() => {
    if (!isOpen) return;

    api.get("/conciertos/categorias/")
      .then(res => setCategorias(res.data))
      .catch(err => console.error(err));
  }, [isOpen]);

  const [paises, setPaises] = useState([])
  const [paisSel, setPaisSel] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    api.get("/conciertos/paises/")
      .then(res => setPaises(res.data))
      .catch(err => console.error(err));
  }, [isOpen]);

  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay backdropFilter='blur(10px)' />
      <ModalContent bg="whiteAlpha.500" borderRadius="20px" minW='800px'>
        <ModalHeader color="white">Crear Artista</ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody>
          <HStack 
            w='fit-content'
            spacing={2}
            align='flex-start'
          >
            <Box w={500}>
              <FormControl mb={2} isInvalid={errors.nombre}>
                <FormLabel color='white'>Nombre</FormLabel>
                <Tooltip
                  label={errors.nombre}
                  isOpen={!!errors.nombre}
                  placement="top"
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

              <HStack>
                <FormControl isInvalid={errors.pais_origen}>
                  <FormLabel color='white'>Pais de origen</FormLabel>
                  <Menu>
                    <Tooltip
                      label={errors.pais_origen}
                      isOpen={!!errors.pais_origen}
                      placement="top"
                      bg="red.500"
                      color="white"
                      hasArrow
                    >
                      <MenuButton
                        as={Button}
                        rightIcon={<ChevronDownIcon />}
                        rounded='full'
                        w="230px"
                      >
                        {paisSel || "Seleccionar pais"}
                      </MenuButton>
                    </Tooltip>

                    <MenuList maxH="200px" overflowY="auto">
                      {paises.map((c) => (
                        <MenuItem 
                          key={c.id}
                          onClick={() => {
                            setPaisSel(c.nombre)
                            setFormData(p => ({ ...p, pais_origen: c.id }));
                          }}
                        >
                          {c.nombre}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                </FormControl>

                <FormControl isInvalid={errors.categoria}>
                  <FormLabel color='white'>Categoria</FormLabel>
                  <Menu>
                    <Tooltip
                      label={errors.categoria}
                      isOpen={!!errors.categoria}
                      placement="top"
                      bg="red.500"
                      color="white"
                      hasArrow
                    >
                      <MenuButton
                        as={Button}
                        rightIcon={<ChevronDownIcon />}
                        rounded='full'
                        w="250px"
                      >
                        {categoriaSel || "Seleccionar categoria"}
                      </MenuButton>
                    </Tooltip>

                    <MenuList maxH="200px" overflowY="auto">
                      {categorias.map((c) => (
                        <MenuItem 
                          key={c.id}
                          onClick={() => {
                            setCategoriaSel(c.nombre)
                            setFormData(p => ({ ...p, categoria: c.id }));
                          }}
                        >
                          {c.nombre}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                </FormControl>
              </HStack>

              <FormControl mt={2} isInvalid={errors.imagen}>
                <FormLabel color='white'>Imagen</FormLabel>
                <Tooltip
                  label={errors.imagen}
                  isOpen={!!errors.imagen}
                  placement="bottom"
                  bg="red.500"
                  color="white"
                  hasArrow
                >
                  <Input
                    ref={inputFileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFile}
                    variant='unstyled'
                    rounded='full'
                    bg='whiteAlpha.400'
                    color='white'
                  />
                </Tooltip>
              </FormControl>
            </Box>

            <Box 
              h={250}
              w={250}
              bg='whiteAlpha.300'
              borderRadius={10}
              align='center'
            >
              {preview ? (
                <Image src={preview} alt="preview" style={{ maxWidth: 250, maxHeight: 250, borderRadius: 10 }} />
              ) : (
                <Text align='center' mt='15vh' color='whiteAlpha.800'>
                  <b>Vista previa de la imagen</b>
                </Text>
              )}
            </Box>
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
