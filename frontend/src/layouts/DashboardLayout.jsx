import React, { useEffect } from 'react'
import { 
  Tabs, 
  TabList, 
  Tab, 
  Box, 
  IconButton, 
  Avatar, 
  useDisclosure,
  Flex, 
  Button,
} from "@chakra-ui/react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AddIcon } from '@chakra-ui/icons'
import { Link } from 'react-router-dom';
import Datos from '../components/DatosUsuario';

function Seccion({ url, label }) {
  return (
    <Tab 
      as={NavLink} 
      to={url} 
      mr='4' 
      bg='gray.500' 
      color='gray.900'
      _selected={{ bg: "teal.400", color: "white" }}
      transition="all 0.3s ease"
      _hover={{ background: "teal.400", color: "white", transform: 'scale(1.1)' }}
    >
      {label}
    </Tab>
  )
}

export default function DashboardLayout() {
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef()

  const isCrearEvento = location.pathname.startsWith('/eventos/crear_evento');
  const isCrearOrganizador = location.pathname.startsWith('/usuarios/crear_organizador');
  
  const tabIndex = (() => {
    if (location.pathname.startsWith("/usuarios")) return 1;
    if (location.pathname.startsWith("/pagos")) return 2;
    if (location.pathname.startsWith("/entradas")) return 3;
    return 0; // Eventos por defecto
  })();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const secciones = [
    { url: '/eventos', label: 'Eventos' },
    { url: '/usuarios', label: 'Usuarios' },
    { url: '/pagos', label: 'Pagos' },
    { url: '/entradas', label: 'Entradas' },
  ]

  return (
    <Box 
      w='100%' 
      pt={5} 
      minH='100vh' 
      bgGradient='radial(circle at center, cyan.600, teal.800)'
    >
      <Tabs 
        index={tabIndex} 
        variant="soft-rounded" 
        mb={4}
        position="fixed"
        left="10px"
        right="10px"
        zIndex="10000"
      >
        <TabList as={Flex} justifyContent="space-between" alignItems="center">
          <Flex>
            {secciones.map((s) => (
              <Seccion 
                key={s.url}
                url={s.url}
                label={s.label}
              />
            ))}
          </Flex>

          <IconButton 
            isRound={true} 
            onClick={onOpen}
            ref={btnRef}
            aria-label="Usuario"
            icon={<Avatar name="Lian Iribarne" />}
            mt={-2}
            transition="all 0.3s ease"
            _hover={{ transform: 'scale(1.1)' }}
          />
        </TabList>

        {tabIndex === 0 && !isCrearEvento && (
          <Button
            as={Link}
            to='/eventos/crear_evento'
            colorScheme='teal'
            mt={2} 
            rounded='full'
            transition="all 0.3s ease"
            _hover={{ transform: "translateY(-4px)" }}
          >
            Crear Evento<AddIcon boxSize={3} ml={1} />
          </Button>
        )}
        {tabIndex === 1 && !isCrearOrganizador && (
          <Button 
            as={Link}
            to='/usuarios/crear_organizador'
            colorScheme='teal'
            mt={2} 
            ml='14vh' 
            rounded='full'
            transition="all 0.3s ease"
            _hover={{ transform: "translateY(-4px)" }}
          >
            Crear Organizador<AddIcon boxSize={3} ml={1} />
          </Button>
        )}
      </Tabs>

      <Datos 
        first_name='Lian'
        last_name='Iribarne'
        email='lian@gmail.com'
        fecha_nacimiento='18.12.2003'
        genero='Hombre'
        isOpen={isOpen}
        onClose={onClose}
      />

      {/* Acá se mostrará el contenido de cada página */}
      <Box pt='60px'>
        <Outlet />
      </Box>
    </Box>
  );
}
