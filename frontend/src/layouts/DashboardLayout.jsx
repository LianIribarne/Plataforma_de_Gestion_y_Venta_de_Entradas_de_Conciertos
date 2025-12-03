import React, { useEffect } from 'react'
import { 
  Tabs, 
  TabList, 
  Tab, 
  Box, 
  Avatar, 
  useDisclosure,
  Flex, 
  Button,
  Tooltip,
} from "@chakra-ui/react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AiOutlineUserAdd } from "react-icons/ai";
import { AddIcon, TimeIcon } from '@chakra-ui/icons'
import { Link } from 'react-router-dom';
import Perfil from '../components/PerfilUsuario';
import CrearConcierto from '../components/CrearConcierto';
import CrearArtista from '../components/CrearArtista';
import CrearUsuario from '../components/CrearUsuario';
import CrearLugar from '../components/CrearLugar';

function Seccion({ url, label }) {
  return (
    <Tab 
      as={NavLink} 
      to={url} 
      mr='4' 
      bg='blackAlpha.900' 
      color='white'
      _selected={{ bg: "whiteAlpha.900", color: "black" }}
      transition="all 0.3s ease"
      _hover={{ 
        background: "whiteAlpha.800", 
        color: "black", 
        transform: 'scale(1.1)' 
      }}
    >
      {label}
    </Tab>
  )
}

export default function DashboardLayout() {
  const location = useLocation();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    isOpen: isConciertoOpen,
    onOpen: onConciertoOpen,
    onClose: onConciertoClose
  } = useDisclosure();

  const {
    isOpen: isArtistaOpen,
    onOpen: onArtistaOpen,
    onClose: onArtistaClose
  } = useDisclosure();

  const {
    isOpen: isUsuarioOpen,
    onOpen: onUsuarioOpen,
    onClose: onUsuarioClose
  } = useDisclosure();

  const {
    isOpen: isLugarOpen,
    onOpen: onLugarOpen,
    onClose: onLugarClose
  } = useDisclosure();

  const btnRef = React.useRef()
  
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
    { url: '/conciertos', label: 'Conciertos' },
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
        pointerEvents="none"
        // onChange={(i) => { tabIndex(i), onClose }}
      >
        <TabList 
          as={Flex} 
          justifyContent="space-between" 
          alignItems="center" 
          pointerEvents="auto"
        >
          <Flex>
            {secciones.map((s) => (
              <Seccion 
                key={s.label}
                url={s.url}
                label={s.label}
              />
            ))}
          </Flex>

          <Box>
            <Button
              rounded='full'
              bg='blackAlpha.900' 
              color='white'
              transition="all 0.3s ease"
              _hover={{ 
                background: "whiteAlpha.800", 
                color: "black", 
                transform: 'scale(1.1)' 
              }}
              pointerEvents="auto"
              mr={4}
              mt={1}
              onClick={onConciertoOpen}
            >
              Crear Concierto<AddIcon boxSize={3} ml={1} />
            </Button>

            <Button
              bg='blackAlpha.900' 
              color='white'
              transition="all 0.3s ease"
              _hover={{ 
                background: "whiteAlpha.800", 
                color: "black", 
                transform: 'scale(1.1)' 
              }}
              pointerEvents="auto"
              mr={4}
              mt={1}
              rounded='full'
              onClick={onArtistaOpen}
            >
              Añadir Artista<AiOutlineUserAdd size={20} />
            </Button>

            <Button 
              bg='blackAlpha.900' 
              color='white'
              transition="all 0.3s ease"
              _hover={{ 
                background: "whiteAlpha.800", 
                color: "black", 
                transform: 'scale(1.1)' 
              }}
              pointerEvents="auto"
              mr={4}
              mt={1}
              rounded='full'
              onClick={onUsuarioOpen}
            >
              Añadir Usuario<AiOutlineUserAdd size={20} />
            </Button>

            <Button 
              bg='blackAlpha.900' 
              color='white'
              transition="all 0.3s ease"
              _hover={{ 
                background: "whiteAlpha.800", 
                color: "black", 
                transform: 'scale(1.1)' 
              }}
              pointerEvents="auto"
              mr={4}
              mt={1}
              rounded='full'
              onClick={onLugarOpen}
            >
              Añadir Lugar<AddIcon boxSize={3} ml={1} />
            </Button>
            
            {location.pathname !== "/pagos/proceso_pago" && (
              <Tooltip 
                label={
                  <Box display="flex" alignItems="center" gap={2}>
                    7:32 <TimeIcon />
                  </Box>
                }
                placement='left'
                fontWeight='bold'
                fontSize='2xl'
                mr={1}
                bg='red' 
                closeOnClick={false} 
                hasArrow 
                isOpen
              >
                <Button 
                  as={Link}
                  to='/pagos/proceso_pago'
                  bg='blackAlpha.900' 
                  color='white'
                  transition="all 0.3s ease"
                  _hover={{ 
                    background: "whiteAlpha.800", 
                    color: "black", 
                    transform: 'scale(1.1)' 
                  }}
                  pointerEvents="auto"
                  mr={4}
                  mt={1}
                  rounded='full'
                >
                  Comprar Entradas
                </Button>
              </Tooltip>
            )}

            <Avatar 
              as={Button}
              onClick={onOpen}
              ref={btnRef}
              bg='whiteAlpha.500'
              p={0}
              transition="all 0.3s ease"
              _hover={{ transform: 'scale(1.1)' }}
            />
          </Box>
        </TabList>
      </Tabs>

      {/* MODAL: PERFIL */}
      <Perfil 
        isOpen={isOpen}
        onClose={onClose}
      />
      
      {/* MODAL: CREAR CONCIERTO */}
      <CrearConcierto 
        isOpen={isConciertoOpen}
        onClose={onConciertoClose} 
      />

      {/* MODAL: CREAR ARTISTA */}
      <CrearArtista 
        isOpen={isArtistaOpen}
        onClose={onArtistaClose} 
      />

      {/* MODAL: CREAR USUARIO */}
      <CrearUsuario 
        isOpen={isUsuarioOpen}
        onClose={onUsuarioClose}
      />

      {/* MODAL: CREAR LUGAR */}
      <CrearLugar 
        isOpen={isLugarOpen}
        onClose={onLugarClose}
      />

      {/* Acá se mostrará el contenido de cada página */}
      <Box pt='60px'>
        <Outlet />
      </Box>
    </Box>
  );
}
