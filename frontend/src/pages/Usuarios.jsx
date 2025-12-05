import { 
  Box, Heading, Avatar, AvatarBadge,
  Text, Wrap, WrapItem, HStack,
  Button, Popover, PopoverTrigger, PopoverContent,
  PopoverHeader, PopoverBody, PopoverArrow, PopoverCloseButton,
  useDisclosure, SkeletonCircle, SkeletonText,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react'
import { InfoIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';
import api from '../services/api'

function Usuario({ id, email, nombre, apellido, activo }) {
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
            <Box>
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
              state={ id }
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
              state={ id }
              leftIcon={<EditIcon />} 
              colorScheme='blackAlpha'
              size='sm'
              rounded='full' 
              variant='solid'
            >
              Modificar
            </Button>
            <Button 
              state={ id }
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

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await api.get("/usuarios/admin/listar_usuarios");
        setUsuarios(response.data.usuarios);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  return (
    <Box p={5}>
      <Box align='center'>
        <Heading color='white' mb={4}>Organizadores</Heading>
        {loading ? (
          <HStack spacing={4} justify='center'>
            {[...Array(3)].map((_, i) => (
              <Box key={i} h={130} w={200} borderRadius={30} bg="whiteAlpha.300" p={4}>
                <SkeletonCircle size={14} />
                <SkeletonText noOfLines={2} mt={4} />
              </Box>
            ))}
          </HStack>
        ) : (
          <Wrap justify='center' align='center' spacing='10px'>
            {usuarios
            .filter((u) => u.rol === "Organizador")
            .map((e) => (
              <Usuario
                key={e.id}
                id={e.id}
                email={e.email}
                nombre={e.first_name}
                apellido={e.last_name}
                activo={e.is_active}
              />
            ))}
          </Wrap>
        )}
      </Box>

      <Box align='center' mt={10}>
        <Heading color='white' mb={4}>Clientes</Heading>
        {loading ? (
          <HStack spacing={4} justify='center'>
            {[...Array(3)].map((_, i) => (
              <Box key={i} h={130} w={200} borderRadius={30} bg="whiteAlpha.300" p={4}>
                <SkeletonCircle size={14} />
                <SkeletonText noOfLines={2} mt={4} />
              </Box>
            ))}
          </HStack>
        ) : (
          <Wrap justify='center' align='center' spacing='10px'>
            {usuarios
            .filter((u) => u.rol === "Cliente")
            .map((e) => (
              <Usuario
                key={e.id}
                id={e.id}
                email={e.email}
                nombre={e.first_name}
                apellido={e.last_name}
                activo={e.is_active}
              />
            ))}
          </Wrap>
        )}
      </Box>
    </Box>
  );
}
