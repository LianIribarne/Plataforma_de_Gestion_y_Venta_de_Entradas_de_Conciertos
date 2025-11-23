import { 
  Button, 
  FormControl,
  FormLabel,
  Input, 
  Textarea,
  Select,
  Box,
  HStack,
  Heading,
  Image,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import React, { useState, useEffect } from 'react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons'

export default function CrearEvento() {
  // Datos generales del evento
  const [formData, setFormData] = React.useState({
    nombre: "",
    pais_origen: "",
    categoria: "",
    imagen: null,
  })

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

  const validate = () => {
    const e = {};

    if (!formData.nombre) e.nombre = "El nombre es obligatorio";
    if (!formData.pais_origen) e.pais_origen = "El pais es obligatorio";
    if (!formData.categoria) e.categoria = "La categoria es obligatorio";
    if (!formData.imagen) e.imagen = "La imagen es obligatoria";
    
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
    <Box align='center' mt={70}>
      <Heading mb={4} align='center' color='white'>Crear Artista</Heading>

      <HStack 
        bg='whiteAlpha.400'
        p={5}
        borderRadius={20}
        w='fit-content'
        spacing={10}
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
                value={formData.nombre} 
                onChange={handleChange("nombre")}
              />
            </Tooltip>
          </FormControl>

          <HStack>
            <FormControl isInvalid={errors.pais_origen}>
              <FormLabel color='white'>Pais de origen</FormLabel>
              <Tooltip
                label={errors.pais_origen}
                isOpen={!!errors.pais_origen}
                placement="bottom-end"
                bg="red.500"
                color="white"
                hasArrow
              >
                <Select 
                  placeholder='Seleccione un pais'
                  variant='custom'
                  value={formData.pais_origen} 
                  onChange={handleChange("pais_origen")}
                >
                  <option value='option1'>Niceto Club - Humboldt 1356, Palermo, Buenos Aires</option>
                  <option value='option2'>Option 2</option>
                  <option value='option3'>Option 3</option>
                </Select>
              </Tooltip>
            </FormControl>

            <FormControl isInvalid={errors.categoria}>
              <FormLabel color='white'>Categoria</FormLabel>
              <Tooltip
                label={errors.categoria}
                isOpen={!!errors.categoria}
                placement="bottom-end"
                bg="red.500"
                color="white"
                hasArrow
              >
                <Select 
                  placeholder='Seleccione una categoria'
                  variant='custom'
                  value={formData.categoria} 
                  onChange={handleChange("categoria")}
                >
                  <option value='option1'>Pale Waves</option>
                  <option value='option2'>Option 2</option>
                  <option value='option3'>Option 3</option>
                </Select>
              </Tooltip>
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
                accept="image/*"
                onChange={handleFile}
                variant='unstyled'
                bg='whiteAlpha.400'
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
            <Text align='center' mt='15vh' color='whiteAlpha.700'>
              <b>Vista previa de la imagen</b>
            </Text>
          )}
        </Box>
      </HStack>
        
      <Button
        rounded='full'
        colorScheme='whiteAlpha'
        transition="all 0.3s ease"
        _hover={{ transform: 'scale(1.1)' }}
        onClick={handleSubmit}
        fontSize={26}
        mt={4}
        p={6}
        py={7}
      >
        Crear
      </Button>
    </Box>
  )
}
