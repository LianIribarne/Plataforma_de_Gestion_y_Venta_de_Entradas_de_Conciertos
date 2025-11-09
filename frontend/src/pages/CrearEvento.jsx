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
} from "@chakra-ui/react";
import React, { useState, useEffect } from 'react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons'

export default function CrearEvento() {
  // Datos generales del evento
  const [formData, setFormData] = React.useState({
    titulo: "",
    descripcion: "",
    fecha: "",
    show: "",
    puertas: "",
    lugar: "",
    artista: "",
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

  // Formatos del input de precio
  const format = (val) => `$` + val
  const parse = (val) => val.replace(/^\$/, '')

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
    <Box p={5} align='center'>
      <Heading mb={4} align='center' color='white'>Crear Evento</Heading>
      <Box 
        display="flex" 
        w="60%" 
        bg='whiteAlpha.400'
        borderRadius={20}
        p={5}
        mb={6}
      >
        <Box flex="1">
          <FormControl mb={2} isInvalid={errors.titulo} isRequired>
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
                value={formData.titulo} 
                onChange={handleChange("titulo")}
              />
            </Tooltip>
          </FormControl>

          <FormControl mb={2} isInvalid={errors.descripcion} isRequired>
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
                value={formData.descripcion} 
                onChange={handleChange("descripcion")}
              />
            </Tooltip>
          </FormControl>

          <HStack mb={2}>
            <FormControl isInvalid={errors.fecha} isRequired>
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
                  value={formData.fecha} 
                  onChange={handleChange("fecha")}
                />
              </Tooltip>
            </FormControl>

            <FormControl isInvalid={errors.show} isRequired>
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
                  value={formData.show} 
                  onChange={handleChange("show")}
                />
              </Tooltip>
            </FormControl>

            <FormControl isInvalid={errors.puertas} isRequired>
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
                  value={formData.puertas} 
                  onChange={handleChange("puertas")}
                />
              </Tooltip>
            </FormControl>
          </HStack>

          <HStack>
            <FormControl isInvalid={errors.lugar} isRequired>
              <FormLabel color='white'>Lugar</FormLabel>
              <Tooltip
                label={errors.lugar}
                isOpen={!!errors.lugar}
                placement="top"
                bg="red.500"
                color="white"
                hasArrow
              >
                <Select 
                  placeholder='Seleccione un lugar'
                  variant='custom'
                  value={formData.lugar} 
                  onChange={handleChange("lugar")}
                >
                  <option value='option1'>Option 1</option>
                  <option value='option2'>Option 2</option>
                  <option value='option3'>Option 3</option>
                </Select>
              </Tooltip>
            </FormControl>
            
            <FormControl isInvalid={errors.artista} isRequired>
              <FormLabel color='white'>Artista</FormLabel>
              <Tooltip
                label={errors.artista}
                isOpen={!!errors.artista}
                placement="top"
                bg="red.500"
                color="white"
                hasArrow
              >
                <Select 
                  placeholder='Seleccione un artista'
                  variant='custom'
                  value={formData.artista} 
                  onChange={handleChange("artista")}
                >
                  <option value='option1'>Option 1</option>
                  <option value='option2'>Option 2</option>
                  <option value='option3'>Option 3</option>
                </Select>
              </Tooltip>
            </FormControl>
          </HStack>
        </Box>

        <Box 
          w="300px" 
          ml={2} 
        >
          <FormControl mb={2} isInvalid={errors.imagen}>
            <FormLabel color='white'>Imagen</FormLabel>
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
                bg='whiteAlpha.400'
              />
            </Tooltip>
          </FormControl>

          <Box 
            minH={290}
            py={5}
            bg='whiteAlpha.300'
            borderRadius={10}
            align='center'
          >
            {preview ? (
                <Image src={preview} alt="preview" style={{ maxWidth: 250, maxHeight: 250, borderRadius: 10 }} />
            ) : (
                <Text align='center' mt='14vh' color='whiteAlpha.700'><b>Vista previa de la imagen</b></Text>
            )}
          </Box>
        </Box>
      </Box>

      <Box
        p={5} 
        bg='whiteAlpha.400' 
        borderRadius={20}
        w='42%'
      >
        <Text mb={6} fontSize='2xl' align='center' color='white'><b>Tipos de Entradas</b></Text>
        {entradas.map((item, i) => (
          <HStack mb={2} key={i}>
            <FormControl isInvalid={!item.nombre} isRequired>
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
                  value={item.nombre}
                  onChange={(e) => handleEntradaChange(i, "nombre", e.target.value)}
                />
              </Tooltip>
            </FormControl>

            <FormControl isInvalid={!item.precio} isRequired>
              <FormLabel color='white'>Precio</FormLabel>
              <NumberInput
                min={500}
                max={1000000}
                value={format(item.precio)}
                onChange={(vStr) => {
                  const num = parse(vStr);
                  handleEntradaChange(i, "precio", num);
                }}
                variant='custom'
                precision={2}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl isInvalid={!item.cantidad} isRequired>
              <FormLabel color='white'>Cantidad</FormLabel>
              <NumberInput
                min={1}
                max={10000}
                value={item.cantidad}
                onChange={(v) => handleEntradaChange(i, "cantidad", v)}
                variant='custom'
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl isInvalid={!item.limite} isRequired>
              <FormLabel color='white'>Limite reserva</FormLabel>
              <NumberInput
                min={1}
                max={6}
                value={item.limite}
                onChange={(v) => handleEntradaChange(i, "limite", v)}
                variant='custom'
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <Button onClick={() => removeEntrada(i)} display={i === 0 ? 'none' : 'grid'} mt={8}><DeleteIcon /></Button>
          </HStack>
        ))}

        <Button onClick={addEntrada}>Agregar<AddIcon ml={1} mt={1} boxSize={3} /></Button>

        <FormControl isInvalid={errors.limite_reserva} mt={4} isRequired>
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
              min={2}
              max={8}
              value={formData.limite_reserva} 
              onChange={(valueString) =>
                setFormData((p) => ({ ...p, limite_reserva: valueString }))
              }
              variant='custom'
              maxW={100}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Tooltip>
        </FormControl>
      </Box>

      <Button 
          ml={2}
          rounded='full'
          colorScheme='teal'
          transition="all 0.3s ease"
          _hover={{ transform: 'scale(1.1)' }}
          onClick={handleSubmit}
          mt={4}
          size='lg'
      >
          Crear
      </Button>
    </Box>
  )
}
