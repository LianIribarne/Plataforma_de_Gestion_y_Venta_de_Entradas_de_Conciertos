import {
  Card, Image, Stack, CardBody,
  Heading, Grid, Container, Box,
  Button, Menu, MenuButton, MenuList,
  MenuItem, Badge,
} from "@chakra-ui/react";
import { SettingsIcon, DeleteIcon, InfoIcon, TriangleDownIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';
import { TbReportAnalytics } from "react-icons/tb";
import { IoTicketSharp } from "react-icons/io5";
import { useAuth } from "../services/AuthContext";

const slugify = (str) =>
  str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

export default function Evento({ imagen, artista, titulo, genero, estado, fecha }) {
  const { user } = useAuth();
  const slug = slugify(titulo);
  const cancelado = estado === 'Cancelado';

  return (
    <Box maxW={250}>
      <Card
        borderRadius={14}
        maxW='xs'
        bg={cancelado ? 'blackAlpha.400' : 'whiteAlpha.400'}
        variant='unstyled'
        transition="all 0.3s ease"
        _hover={{ transform: "translateY(-10px)", zIndex: 1000, boxShadow: 'md' }}
      >
        <Badge
          bg={cancelado ? "red.100" : "teal.100"}
          color={cancelado ? 'red.700' : 'teal.700'}
          position='absolute'
          zIndex={1}
          variant='solid'
          fontSize='16px'
          align='center'
        >
          <span>
            {genero}
          </span>
        </Badge>
        <CardBody pb={3}>
          <Box position='relative'>
            <Image
              src={imagen}
              borderTopRadius={14}
              filter={!cancelado ? 'grayscale(1%)' : 'brightness(50%)'} 
            />
            <Box 
              fontSize='3xl' 
              align='center'
              bg='blackAlpha.700'
              color='rgba(255, 0, 0, 0.65)'
              position='absolute' 
              display={cancelado ? 'inline-block' : 'none'} 
              zIndex={2} 
              p={3}
              top='50%'
              left='50%'
              transform='translate(-50%, -50%) rotate(-12deg)'
              border='4px'
              borderColor='rgba(255, 0, 0, 0.65)'
            >
              <b>CANCELADO</b>
            </Box>
          </Box>
          <Stack spacing='3'>
            <Container>
              <Heading 
                size='lg' 
                color={cancelado ? 'red.100' : 'white'}
              >
                {artista}
              </Heading>
              <Heading 
                size='xs' 
                color={cancelado ? 'red.100' : 'white'}
              >
                {titulo}
              </Heading>
              <Heading 
                size='xs' 
                textAlign='end'
                mt={2}
                color={cancelado ? 'red.100' : 'white'}
              >
                {fecha}
              </Heading>
              <Grid templateColumns="100px 1fr" mt={3}>
                <Button
                  as={Link}
                  to={`/conciertos/${slug}`}
                  state={{ titulo, imagen, estado }}
                  rounded='full'
                  colorScheme='whiteAlpha'
                  leftIcon={<InfoIcon />}
                  size='xs'
                >
                  Más info
                </Button>
                {user.rol === 'Cliente' &&
                  <Button
                    as={Link}
                    to={`/conciertos/${slug}`}
                    state={{ titulo, imagen }}
                    rounded='full'
                    colorScheme='whiteAlpha'
                    rightIcon={<IoTicketSharp />}
                    size='xs'
                    ml={2}
                  >
                    {cancelado ? 'Cancelado' : 'Adquirir'}
                  </Button>
                }
                {user.rol !== 'Cliente' &&
                  <Menu>
                    <MenuButton
                      as={Button}
                      rounded='full'
                      colorScheme='whiteAlpha'
                      rightIcon={<TriangleDownIcon />}
                      ml={2}
                      size='xs'
                    >
                      Opciones
                    </MenuButton>
                    <MenuList minWidth='170px'>
                      <MenuItem 
                        // as={Link}
                        // to='conciertos/analitica'
                        icon={<SettingsIcon boxSize={18} />}
                      >
                        Modificar
                      </MenuItem>
                      <MenuItem 
                        as={Link}
                        to='/analitica'
                        icon={<TbReportAnalytics size={18} />}
                      >
                        Analítica
                      </MenuItem>
                      <MenuItem 
                        // as={Link}
                        // to='conciertos/analitica'
                        icon={<DeleteIcon boxSize={18} />}
                      >
                        Eliminar
                      </MenuItem>
                    </MenuList>
                  </Menu>
                }
              </Grid>
            </Container>
          </Stack>
        </CardBody>
      </Card>
    </Box>
  );
}
