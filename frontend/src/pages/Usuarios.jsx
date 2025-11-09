import { 
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  IconButton,
  Tooltip,
  Box,
  Heading,
} from '@chakra-ui/react';
import { SettingsIcon, InfoIcon, DeleteIcon } from '@chakra-ui/icons';

function Organizador({ email, nombre, apellido }) {
  return (
    <Tr color='gray.700'>
      <Td>
        <b>{email}</b>
      </Td>
      <Td>
        <b>{nombre}</b>
      </Td>
      <Td>
        <b>{apellido}</b>
      </Td>
      <Td maxW={12}>
        <Tooltip hasArrow label='Modificar' placement='top'>
          <IconButton
            variant='unstyled'
            icon={<SettingsIcon boxSize={5} />}
          />
        </Tooltip>
        <Tooltip hasArrow label='Detalles' placement='top'>
          <IconButton
            color='teal.500'
            variant='unstyled'
            icon={<InfoIcon boxSize={5} />}
          />
        </Tooltip>
        <Tooltip hasArrow label='Eliminar' bg='red.500' color='white' placement='top'>
          <IconButton
            color='red.500'
            variant='unstyled'
            icon={<DeleteIcon boxSize={5} />}
            />
        </Tooltip>
      </Td>
    </Tr>
  )
}

const organizadores = [
  {
    email: 'lian@gmail.com',
    nombre: 'Lian',
    apellido: 'Iribarne',
  },
  {
    email: 'lian@gmail.com',
    nombre: 'Lian',
    apellido: 'Iribarne',
  },
  {
    email: 'lian@gmail.com',
    nombre: 'Lian',
    apellido: 'Iribarne',
  },
  {
    email: 'lian@gmail.com',
    nombre: 'Lian',
    apellido: 'Iribarne',
  },
]

export default function Organizadores() {
  return (
    <Box p={5}>
      <Box align='center'>
        <Heading color='white'>Organizadores</Heading>
        <TableContainer bg='whiteAlpha.700' borderRadius={10} mt={4} w='70%'>
          <Table variant='striped' colorScheme='blackAlpha' size='sm'>
            <TableCaption>Lista completa de organizadores</TableCaption>
            <Thead>
              <Tr>
                <Th>Email</Th>
                <Th>Nombre</Th>
                <Th>Apellido</Th>
                <Th maxW={12}>Opciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {organizadores.map((e) => (
                <Organizador 
                  email={e.email}
                  nombre={e.nombre}
                  apellido={e.apellido}
                />
              ))}
            </Tbody>
            <Tfoot>
              <Tr>
                <Th>Email</Th>
                <Th>Nombre</Th>
                <Th>Apellido</Th>
                <Th maxW={12}>Opciones</Th>
              </Tr>
            </Tfoot>
          </Table>
        </TableContainer>
      </Box>

      <Box align='center' mt={8}>
        <Heading color='white'>Clientes</Heading>
        <TableContainer bg='whiteAlpha.700' borderRadius={10} mt={4} w='70%'>
          <Table variant='striped' colorScheme='blackAlpha' size='sm'>
            <TableCaption>Lista completa de organizadores</TableCaption>
            <Thead>
              <Tr>
                <Th>Email</Th>
                <Th>Nombre</Th>
                <Th>Apellido</Th>
                <Th maxW={12}>Opciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {organizadores.map((e) => (
                <Organizador 
                  email={e.email}
                  nombre={e.nombre}
                  apellido={e.apellido}
                />
              ))}
            </Tbody>
            <Tfoot>
              <Tr>
                <Th>Email</Th>
                <Th>Nombre</Th>
                <Th>Apellido</Th>
                <Th maxW={12}>Opciones</Th>
              </Tr>
            </Tfoot>
          </Table>
        </TableContainer>
      </Box>

      {/* <Datos 
        first_name='Lian'
        last_name='Iribarne'
        email='lian@gmail.com'
        fecha_nacimiento='18.12.2003'
        genero='Hombre'
        isOpen={isOpen}
        onClose={onClose}
      /> */}
    </Box>
  );
}
