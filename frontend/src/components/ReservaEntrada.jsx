import { useState } from 'react';
import { 
  Box, 
  Text, 
  HStack, 
  useNumberInput, 
  Input, 
  Button,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
} from '@chakra-ui/react';
import { IoTicketSharp } from "react-icons/io5";
import { MdLocalGroceryStore } from "react-icons/md";
import { ArrowRightIcon } from '@chakra-ui/icons';
import { useAuth } from "../services/AuthContext";

function Reservar({ value, onChange, max, placeholder }) {
  const {
    getInputProps,
    getIncrementButtonProps,
    getDecrementButtonProps,
  } = useNumberInput({
    step: 1,
    min: 0,
    max,
    precision: 0,
    value,
    onChange: (_, valueAsNumber) => {
      if (isNaN(valueAsNumber)) {
        onChange(0);
      } else {
        onChange(valueAsNumber);
      }
    },
  });

  const inc = getIncrementButtonProps();
  const dec = getDecrementButtonProps();
  const inputProps = getInputProps({ placeholder });

  return (
    <HStack maxW="140px" spacing={2}>
      <Button borderRightRadius={0} mr={-2} {...dec}>-</Button>
      <Input borderRadius={0} variant='flushed' {...inputProps} textAlign="center" bg='white' />
      <Button borderLeftRadius={0} ml={-2} {...inc}>+</Button>
    </HStack>
  );
}

export default function EntradaInfo({ id, tipo, disponibles, reservadas, precio, precioNumber, cantMax, activo, onCantChange }) {
  const [cant, setCant] = useState(0);

  const handleChange = (valor) => {
    setCant(valor);
    onCantChange?.(id, valor, precioNumber); // avisa a EventoDetalle
  }

  const { user } = useAuth();

  return (
    <AccordionItem display={activo && (disponibles > 0 || reservadas > 0) ? undefined : 'none'}>
      <h2>
        <AccordionButton>
          <Badge 
            colorScheme='blackAlpha'
            position='absolute'
            variant='solid'
            fontSize='16px'
            align='center'
            display={cant === 0 ? 'none' : 'inline-block'}
          >
            <MdLocalGroceryStore style={{ display: 'inline-block', marginBottom: '-2px' }} />
            <span>
              {cant}
            </span>
          </Badge>
          <Box as='span' flex='1' fontSize='xl'>
            <Text 
              bg='whiteAlpha.400' 
              color='whiteAlpha.900' 
              display="inline-block" 
              px={2} 
              rounded='full'
            >
              <b>{tipo} <ArrowRightIcon mb={1} boxSize={4} /> {precio}</b>
            </Text>
          </Box>
          <AccordionIcon color='white' />
        </AccordionButton>
      </h2>
      <AccordionPanel pb={4} align='center'>
        <Text 
          fontSize='lg' 
          mb={4} 
          color='white' 
          bg='green.400' 
          display="inline-block" 
          px={2} 
          py={1} 
          rounded='full'
        >
          <b>Disponibles <ArrowRightIcon mb={1} boxSize={4} /> {disponibles} <IoTicketSharp style={{ display: 'inline', marginBottom: '-3' }} /></b>
        </Text>
        <Text 
          fontSize='lg' 
          mb={4} 
          ml={4}
          color='white' 
          bg='orange.400' 
          display="inline-block" 
          px={2} 
          py={1} 
          rounded='full'
        >
          <b>Reservadas <ArrowRightIcon mb={1} boxSize={4} /> {reservadas} <IoTicketSharp style={{ display: 'inline', marginBottom: '-3' }} /></b>
        </Text>
        {user.rol === 'Cliente' ? (
          <Text color='whiteAlpha.900' mb={2}>
            <b>Cantidad de entradas reservar (max. {cantMax})</b>
          </Text>
        ) : (
          <Text color='whiteAlpha.900' mb={2}>
            <b>Limite de reserva {cantMax}</b>
          </Text>
        )}
        <Box display={user.rol === 'Cliente' ? undefined : 'none'}>
          <Reservar
            value={cant}
            onChange={handleChange}
            max={disponibles > cantMax ? cantMax : disponibles}
            placeholder="Cantidad"
          />
        </Box>
      </AccordionPanel>
    </AccordionItem>
  )
}
