import { useEffect } from 'react'
import { 
  Tabs, TabList, Tab, Box, 
  Avatar, useDisclosure, Flex, Button,
  Tooltip,
} from "@chakra-ui/react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AiOutlineUserAdd } from "react-icons/ai";
import { AddIcon, TimeIcon } from '@chakra-ui/icons'
import { Link } from 'react-router-dom';
import CrearConcierto from '../components/CrearConcierto';
import CrearArtista from '../components/CrearArtista';
import CrearUsuario from '../components/CrearUsuario';
import CrearLugar from '../components/CrearLugar';
import { useAuth } from "../services/AuthContext";
import useCountdown from '../utils/Temporizador'

function Seccion({ url, label }) {
  return (
    <Tab 
      as={NavLink} 
      to={url} 
      mr='4' 
      pointerEvents="auto"
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
  const { 
    user, 
    tieneReservaActiva, 
    reservaActiva, 
    fetchReservaActiva 
  } = useAuth();
  const location = useLocation();

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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const secciones = [
    { url: '/conciertos', label: 'Conciertos', rol: ['Administrador', 'Organizador', 'Cliente'] },
    { url: '/usuarios', label: 'Usuarios', rol: ['Administrador'] },
    { url: '/lugares', label: 'Lugares', rol: ['Administrador'] },
    { url: '/artistas', label: 'Artistas', rol: ['Administrador'] },
    { url: '/pagos', label: 'Pagos', rol: ['Cliente'] },
    { url: '/entradas', label: 'Entradas', rol: ['Cliente'] },
  ]

  const seccionesVisibles = secciones.filter(s => s.rol.includes(user.rol));

  const tabIndex = seccionesVisibles.findIndex(s => location.pathname.startsWith(s.url));

  const tabIndexSafe = tabIndex === -1 ? 0 : tabIndex;

  const timeLeft = useCountdown(reservaActiva?.reservar_hasta);
  
    useEffect(() => {
      if (timeLeft?.total === 0) fetchReservaActiva()
    }, [timeLeft]);

  return (
    <Box 
      w='100%' 
      pt={5} 
      minH='100vh' 
      bgGradient='linear(to-r, cyan.800, cyan.500, cyan.800)'
    >
      <Tabs 
        index={tabIndexSafe} 
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
          pointerEvents="none"
        >
          <Flex>
            {secciones.map((s) => s.rol.includes(user.rol) && (
              <Seccion 
                key={s.label}
                url={s.url}
                label={s.label}
              />
            ))}
          </Flex>

          <Box>
            {user.rol === 'Organizador' &&
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
                onClick={user.rol === 'Organizador'? onConciertoOpen : undefined}
                isDisabled={user.rol !== 'Organizador'}
              >
                Crear Concierto<AddIcon boxSize={3} ml={1} />
              </Button>
            }

            {user.rol === 'Administrador' && 
              <>
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
                  onClick={user.rol === 'Administrador'? onArtistaOpen : undefined}
                  isDisabled={user.rol !== 'Administrador'}
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
                  onClick={user.rol === 'Administrador'? onUsuarioOpen : undefined}
                  isDisabled={user.rol !== 'Administrador'}
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
                  onClick={user.rol === 'Administrador'? onLugarOpen : undefined}
                  isDisabled={user.rol !== 'Administrador'}
                >
                  Añadir Lugar<AddIcon boxSize={3} ml={1} />
                </Button>
              </>
            }
            
            {user.rol === 'Cliente' && location.pathname !== "/pagos/proceso_pago" && tieneReservaActiva && (
              <Tooltip 
                label={
                  <Box display="flex" alignItems="center" gap={2}>
                    {timeLeft
                      ? `${String(timeLeft.minutes).padStart(2, "0")}:${String(timeLeft.seconds).padStart(2, "0")}`
                      : "--:--"}
                    <TimeIcon />
                  </Box>
                }
                placement='left'
                fontWeight='bold'
                fontSize='2xl'
                mr={1}
                bg={timeLeft?.minutes < 2 ? 'black' : 'white'} 
                color={timeLeft?.minutes < 2 ? 'red.500' : 'black'}
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
                  isDisabled={user.rol !== 'Cliente'}
                >
                  Comprar Entradas
                </Button>
              </Tooltip>
            )}

            <Avatar 
              as={Link}
              to='/perfil'
              bg='blackAlpha.700'
              p={0}
              transition="all 0.3s ease"
              pointerEvents="auto"
              _hover={{ transform: 'scale(1.1)', bg: 'blackAlpha.900' }}
            />
          </Box>
        </TabList>
      </Tabs>
      
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
