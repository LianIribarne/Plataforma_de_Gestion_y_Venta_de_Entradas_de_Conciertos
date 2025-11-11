import { 
  Box, 
  Button, 
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text, 
  SimpleGrid,
  useToast,
} from "@chakra-ui/react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Datos({ rol, first_name, last_name, email, fecha_nacimiento, genero, isOpen, onClose, programados, enCurso, finalizados, cancelados, total }) {
  const toast = useToast();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
  try {
      const res = await api.post('/logout/', {}, { withCredentials: true });

      const mensaje = res?.data?.message ?? "Se cerro la sesion";

      toast({
        title: mensaje,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: 'top',
      });

      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay backdropFilter='blur(2px)' />
      <ModalContent borderRadius={30}>
        <ModalHeader align='center' color='gray.700' fontSize='2xl'>
        <b>{first_name}{' '}{last_name}{!rol || rol === 'cliente' ? '' : ` - ${rol}`}</b>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody align='center'>
          <Box color='gray.600' mb={3}>
            <Text as='span'>Email</Text>
            <Box as='span' ml={3} fontSize='lg'><b>{email}</b></Box>
          </Box>
          <Box color='gray.600' mb={3}>
            <Text as='span'>Fecha de nacimiento</Text>
            <Box as='span' ml={3} fontSize='lg'><b>{fecha_nacimiento}</b></Box>
          </Box>
          <Box color='gray.600' mb={3}>
            <Text as='span'>Género</Text>
            <Box as='span' ml={3} fontSize='lg'><b>{genero}</b></Box>
          </Box>
          <Box 
            display={!rol || rol === 'Organizador' ? 'none' : 'block'}
            mt={6}
          >
            <Text as='b' color='gray.600' fontSize='xl'>Eventos</Text>
            <SimpleGrid columns={2} spacingX={4}>
              <Box color='gray.600' mb={3}>
                <Text as='span'>Programados</Text>
                <Box as='span' ml={3} fontSize='lg'><b>{programados}</b></Box>
              </Box>
              <Box color='gray.600' mb={3}>
                <Text as='span'>En Curso</Text>
                <Box as='span' ml={3} fontSize='lg'><b>{enCurso}</b></Box>
              </Box>
              <Box color='gray.600' mb={3}>
                <Text as='span'>Finalizados</Text>
                <Box as='span' ml={3} fontSize='lg'><b>{finalizados}</b></Box>
              </Box>
              <Box color='gray.600' mb={3}>
                <Text as='span'>Cancelados</Text>
                <Box as='span' ml={3} fontSize='lg'><b>{cancelados}</b></Box>
              </Box>
            </SimpleGrid>
            <Box color='gray.600' mb={3}>
              <Text as='span'>Total</Text>
              <Box as='span' ml={3} fontSize='lg'><b>{total}</b></Box>
            </Box>
          </Box>
        </ModalBody>
        <ModalFooter>
        <Button
          rounded='full'
          transition="all 0.3s ease"
          _hover={{ transform: 'scale(1.1)' }}
          display={!rol ? 'block' : 'none'}
          onClick={handleLogout}
        >
          Cerrar sesion
        </Button>
        <Button 
          ml={2}
          rounded='full'
          colorScheme='teal'
          transition="all 0.3s ease"
          _hover={{ transform: 'scale(1.1)' }}
          display={!rol ? 'block' : 'none'}
        >
          Modificar
        </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
