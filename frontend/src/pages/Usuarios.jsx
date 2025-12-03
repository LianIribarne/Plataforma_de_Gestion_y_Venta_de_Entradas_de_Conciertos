import { 
  Box,
  Heading,
  Avatar,
  AvatarBadge,
  Text,
  Wrap,
  WrapItem,
  IconButton,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { InfoIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';

function Usuario({ email, nombre, apellido, activo }) {
  const { isOpen, onToggle, onClose } = useDisclosure();

  return (
    <Popover isOpen={isOpen} onClose={onClose}>
      <PopoverTrigger>
        <WrapItem
          as="button"
          onClick={onToggle}
          bg='whiteAlpha.300'
          borderRadius={30}
          transition="transform 0.3s ease"
          _hover={{ background: 'whiteAlpha.500', cursor: 'pointer', transform: 'translateY(-6px)' }}
        >
          <Box p={4}>
            <Avatar bg='whiteAlpha.600' mb={2}>
              <AvatarBadge 
                boxSize='1em' 
                bg={activo ? 'green.400' : 'gray.400'}
                borderColor={activo ? 'green.100' : 'gray.100'}
                mr={1}
                mb={1}
              />
            </Avatar>
            <Box maxW={150}>
              <Text color='whiteAlpha.800' as='b' fontSize='lg'>{email}</Text><br />
              <Text color='whiteAlpha.800' as='b' fontSize='sm'>{nombre} {apellido}</Text>
            </Box>
          </Box>
        </WrapItem>
      </PopoverTrigger>   

      <PopoverContent bg='gray.200'>
        <PopoverArrow bg='gray.200' />
        <PopoverCloseButton />
        <PopoverHeader color='blackAlpha.700'><b>Opciones</b></PopoverHeader>
        <PopoverBody>
          <Button 
              as={Link}
              to='/detalle_organizador'
              leftIcon={<InfoIcon />} 
              colorScheme='blackAlpha'
              size='sm'
              rounded='full' 
              variant='solid'
              mr={2}
            >
              Detalles
            </Button>
            <Button 
              leftIcon={<EditIcon />} 
              colorScheme='blackAlpha'
              size='sm'
              rounded='full' 
              variant='solid'
            >
              Modificar
            </Button>
            <Button 
              leftIcon={<DeleteIcon />} 
              colorScheme='red'
              size='sm'
              rounded='full' 
              variant='solid'
              mt={2}
            >
              Eliminar
            </Button>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

const users = [
  {
    email: 'lian@gmail.com',
    nombre: 'Lian Lian',
    apellido: 'Iribarne Iribarne Iribarne',
    activo: true,
  },
  {
    email: 'lian@gmail.com',
    nombre: 'Lian',
    apellido: 'Iribarne',
    activo: false,
  },
  {
    email: 'lian@gmail.com',
    nombre: 'Lian',
    apellido: 'Iribarne',
    activo: true,
  },
  {
    email: 'lian@gmail.com',
    nombre: 'Lian',
    apellido: 'Iribarne',
    activo: false,
  },
  {
    email: 'lian@gmail.com',
    nombre: 'Lian',
    apellido: 'Iribarne',
    activo: true,
  },
  {
    email: 'lian@gmail.com',
    nombre: 'Lian',
    apellido: 'Iribarne',
    activo: false,
  },
  {
    email: 'lian@gmail.com',
    nombre: 'Lian',
    apellido: 'Iribarne',
    activo: true,
  },
  {
    email: 'lian@gmail.com',
    nombre: 'Lian',
    apellido: 'Iribarne',
    activo: false,
  },
  {
    email: 'lian@gmail.com',
    nombre: 'Lian',
    apellido: 'Iribarne',
    activo: true,
  },
  {
    email: 'lian@gmail.com',
    nombre: 'Lian',
    apellido: 'Iribarne',
    activo: false,
  },
  {
    email: 'lian@gmail.com',
    nombre: 'Lian',
    apellido: 'Iribarne',
    activo: true,
  },
  {
    email: 'lian@gmail.com',
    nombre: 'Lian',
    apellido: 'Iribarne',
    activo: false,
  },
]

export default function Usuarios() {
  return (
    <Box p={5}>
      <Box align='center'>
        <Heading color='white' mb={4}>Organizadores</Heading>
        <Wrap justify='center' align='center' spacing='10px'>
          {users.map((e) => (
            <Usuario
              email={e.email}
              nombre={e.nombre}
              apellido={e.apellido}
              activo={e.activo}
            />
          ))}
        </Wrap>
      </Box>

      <Box align='center' mt={10}>
        <Heading color='white' mb={4}>Clientes</Heading>
        <Wrap justify='center' align='center' spacing='10px'>
          {users.map((e) => (
            <Usuario
              email={e.email}
              nombre={e.nombre}
              apellido={e.apellido}
              activo={e.activo}
            />
          ))}
        </Wrap>
      </Box>
    </Box>
  );
}
