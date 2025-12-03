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
  useToast,
} from "@chakra-ui/react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Perfil({ isOpen, onClose }) {
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
      <ModalOverlay backdropFilter='blur(10px)' />
      <ModalContent borderRadius={30} bg='whiteAlpha.500'>
        <ModalHeader align='center' color="white" fontSize='2xl'>
          <b>Lian{' '}Iribarne</b>
        </ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody align='center' color="white">
          <Box mb={3}>
            <Text as='span'>Email</Text>
            <Box as='span' ml={3} fontSize='lg'><b>lian@gmail.com</b></Box>
          </Box>
          <Box mb={3}>
            <Text as='span'>Fecha de nacimiento</Text>
            <Box as='span' ml={3} fontSize='lg'><b>18/12/2003</b></Box>
          </Box>
          <Box mb={3}>
            <Text as='span'>Género</Text>
            <Box as='span' ml={3} fontSize='lg'><b>Hombre</b></Box>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button
            rounded='full'
            colorScheme='red'
            transition="all 0.3s ease"
            _hover={{ transform: 'scale(1.1)' }}
            onClick={handleLogout}
          >
            Cerrar sesion
          </Button>
          
          <Button 
            ml={2}
            rounded='full'
            colorScheme='whiteAlpha'
            transition="all 0.3s ease"
            _hover={{ transform: 'scale(1.1)' }}
          >
            Modificar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
