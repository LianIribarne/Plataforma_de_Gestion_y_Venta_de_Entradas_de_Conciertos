import { useState } from 'react';
import {
  Box, Button, Drawer, DrawerOverlay,
  DrawerContent, DrawerBody, Input, NumberInput,
  NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Text,
} from '@chakra-ui/react';

export default function FiltrosPagos({ isOpen, onClose, onApply }) {
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [montoMin, setMontoMin] = useState('');
  const [montoMax, setMontoMax] = useState('');

  const limpiar = () => {
    setFechaDesde('');
    setFechaHasta('');
    setMontoMin('');
    setMontoMax('');
  };

  const handleApply = () => {
    onApply({
      fechaDesde,
      fechaHasta,
      montoMin,
      montoMax,
    });
    onClose();
  };

  return (
    <Drawer placement="right" isOpen={isOpen} onClose={onClose} size="xs">
      <DrawerOverlay />
      <DrawerContent bg="whiteAlpha.900">
        <DrawerBody mt={20} align="center">

          {/* FECHA DESDE */}
          <Text
            color='gray.700'
            fontWeight='medium'
          >
            Fecha desde
          </Text>
          <Input
            type="date"
            variant='custom'
            rounded='full'
            mb={2}
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
          />

          {/* FECHA HASTA */}
          <Text
            color='gray.700'
            fontWeight='medium'
          >
            Fecha hasta
          </Text>
          <Input
            type="date"
            variant='custom'
            rounded='full'
            mb={2}
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />

          {/* MONTO MIN */}
          <Text
            color='gray.700'
            fontWeight='medium'
          >
            Monto minimo $
          </Text>
          <NumberInput
            min={500}
            max={1000000}
            step={100}
            variant='custom'
            precision={2}
            mb={2}
            value={montoMin}
            onChange={(_, valueAsNumber) => {
              setMontoMin(valueAsNumber)
            }}
          >
            <NumberInputField rounded='full' />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>

          {/* MONTO MAX */}
          <Text
            color='gray.700'
            fontWeight='medium'
          >
            Monto maximo $
          </Text>
          <NumberInput
            min={500}
            max={1000000}
            step={100}
            variant='custom'
            precision={2}
            mb={6}
            value={montoMax}
            onChange={(_, valueAsNumber) => {
              setMontoMax(valueAsNumber)
            }}
          >
            <NumberInputField rounded='full' />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>

          <Box mb={3}>
            <Button rounded="full" mr={3} onClick={onClose} colorScheme='blackAlpha'>
              Cerrar
            </Button>
            <Button
              rounded="full"
              onClick={() => {
                limpiar();
              }}
              colorScheme='blackAlpha'
            >
              Limpiar
            </Button>
          </Box>

          <Button rounded="full" onClick={handleApply} colorScheme='blackAlpha'>
            Aplicar filtros
          </Button>

        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
