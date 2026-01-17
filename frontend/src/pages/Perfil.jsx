import {
  Heading, Box, Avatar, Grid,
  GridItem, Wrap, WrapItem, Text,
  Button, HStack, useToast, useDisclosure,
} from "@chakra-ui/react";
import { useAuth } from "../services/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react"
import api from "../services/api";
import ActualizarPerfil from "../components/ActulizarPerfil"
import CambiarPassword from "../components/CambiarPassword"

export default function Perfil() {
  const { logoutUser } = useAuth();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  const {
    isOpen: isActualizarOpen,
    onOpen: onActualizarOpen,
    onClose: onActualizarClose
  } = useDisclosure();

  const {
    isOpen: isPasswordOpen,
    onOpen: onPasswordOpen,
    onClose: onPasswordClose
  } = useDisclosure();
  
  const handleLogout = async () => {
    try {
      const res = await logoutUser();

      const mensaje = res?.message ?? "Se cerro la sesion";

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

  useEffect(() => {
    const fetchOrganizador = async () => {
      try {
        const responseStats = await api.get(`/usuarios/estadisticas_organizador/${user?.id}`)

        const payloadStats = responseStats.data

        setStats(payloadStats)
      } catch (err) {
        console.log(err)
      }
    };

    fetchOrganizador();
  }, [user.id]);

  const conciertosBase = [
    { label: 'Creados', key: 'conciertos_creados' },
    { label: 'Programados', key: 'conciertos_programados' },
    { label: 'Cancelados', key: 'conciertos_cancelados' },
    { label: 'Agotados', key: 'conciertos_agotados' },
    { label: 'Finalizados', key: 'conciertos_finalizados' },
    { label: 'Tipos entradas creadas', key: 'tipos_entrada_creados' },
    { label: 'Entradas totales', key: 'entradas_totales' },
    { label: 'Entradas vendidas', key: 'entradas_vendidas' },
    { label: 'Ocupación promedio', key: 'ocupacion_promedio' },
  ]

  const conciertosStats = stats
    ? conciertosBase.map(item => ({
        ...item,
        value: stats[item.key] ?? ''
      }))
    : [];

  return (
    <Box p={5} color='white'>
      <Grid templateColumns='repeat(2, 1fr)' gap={2}>
        <GridItem align='center' alignSelf='center'>
          <Avatar size='3xl' bg='whiteAlpha.500' />
          <Heading mt={2} size='2xl'>{user.nombre}{' '}{user.apellido}</Heading>
        </GridItem>
        <GridItem align='center' mt={user.rol === 'Organizador' ? 0 : 32} ml={-40}>
          <Wrap align='center' justify='center' spacing={10} w='70%'>
            <WrapItem 
              display='inline-block' 
              align='center'
              p={4}
              bg='whiteAlpha.400'
              borderRadius={20}
            >
              <Heading size='lg'>Email</Heading>
              <Text>{user.email}</Text>
            </WrapItem>
            <WrapItem 
              display='inline-block' 
              align='center'
              p={4}
              bg='whiteAlpha.400'
              borderRadius={20}
            >
              <Heading size='lg'>Fecha de nacimiento</Heading>
              <Text>{user.fecha_nacimiento}</Text>
            </WrapItem>
            <WrapItem 
              display='inline-block' 
              align='center'
              p={4}
              bg='whiteAlpha.400'
              borderRadius={20}
            >
              <Heading size='lg'>Genero</Heading>
              <Text>{user.genero}</Text>
            </WrapItem>
            <WrapItem 
              display='inline-block' 
              align='center'
              p={4}
              bg='whiteAlpha.400'
              borderRadius={20}
            >
              <Heading size='lg'>Rol</Heading>
              <Text>{user.rol}</Text>
            </WrapItem>
          </Wrap>
          <HStack spacing={10} align='center' justify='center' mt={20}>
            <Button 
              size='lg' 
              rounded='full' 
              colorScheme="red" 
              onClick={handleLogout}
              _hover={{transform: 'scale(1.1)'}}
            >
              Cerrar Sesion
            </Button>
            <Button 
              size='lg' 
              rounded='full'
              onClick={onActualizarOpen}
              _hover={{transform: 'scale(1.1)'}}
            >
              Actualizar Perfil
            </Button>
            <Button 
              size='lg' 
              rounded='full'
              onClick={onPasswordOpen}
              _hover={{transform: 'scale(1.1)'}}
            >
              Cambiar Contraseña
            </Button>
          </HStack>
        </GridItem>

        <GridItem colSpan={2} align='center' mt={10} display={user.rol === 'Organizador' ? undefined : 'none'}>
          <Heading mb={4}>Sobre tus conciertos</Heading>
          <Wrap justify='center' spacing={4} align='center'>
            {conciertosStats.map((c, i) => (
              <WrapItem 
                bg='whiteAlpha.400' 
                fontWeight='medium' 
                px={2}
                py={1}
                borderRadius={10}
                align='center'
                display='inline-block'
                key={i}
              >
                <Heading fontSize='3xl'>
                  {c.label}
                </Heading>
                <Text>
                  {c.value}
                </Text>
              </WrapItem>
            ))}
          </Wrap>
        </GridItem>
      </Grid>

      <ActualizarPerfil isOpen={isActualizarOpen} onClose={onActualizarClose}/>
      
      <CambiarPassword isOpen={isPasswordOpen} onClose={onPasswordClose}/>
    </Box>
  )
}