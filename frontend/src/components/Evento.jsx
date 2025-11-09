import {
  Card,
  Image,
  Stack,
  CardBody,
  Heading,
  Grid,
  Container,
  Box,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
} from "@chakra-ui/react";
import { SettingsIcon, DeleteIcon, NotAllowedIcon, InfoIcon, TriangleDownIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';

const slugify = (str) =>
  str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

export default function Evento({ id, imagen, artista, titulo, genero }) {
  const generoMap = {
    'Rock': { color: 'red', label: 'ROCK' },
    'Pop': { color: 'purple', label: 'POP' },
    'Metal': { color: 'gray', label: 'METAL' },
    'Indie': { color: 'green', label: 'INDIE' },
    'Hip-Hop': { color: 'yellow', label: 'HIP-HOP' },
    'Electronica': { color: 'cyan', label: 'ELECTRONICA' }
  }

  const generoInfo = generoMap[genero];
  const slug = slugify(titulo);

  return (
    <Box>
      <Card
        borderRadius={8}
        maxW='xs'
        // bg={`${generoInfo.color}.500`}
        bg='whiteAlpha.400'
        variant='unstyled'
        transition="transform 0.3s ease"
        _hover={{ transform: "translateY(-10px)", zIndex: 1000 }}
      >
        <CardBody pb={3}>
          <Image
            src={imagen}
            borderTopRadius={8}
          />
          <Badge
            // colorScheme={generoInfo.color}
            colorScheme="whiteAlpha"
            position='absolute'
            variant='solid'
            fontSize='16px'
            ml='-10px'
            mt='-30vh'
            align='center'
          >
            <span>
              {generoInfo.label}
            </span>
          </Badge>
          <Stack spacing='3'>
            <Container>
              <Heading 
                size='lg' 
                // color={`${generoInfo.color}.50`}
                color='white'
              >
                {artista}
              </Heading>
              <Heading 
                size='xs' 
                // color={`${generoInfo.color}.100`}
                color='white'
              >
                {titulo}
              </Heading>
              <Grid templateColumns="100px 1fr" mt={3}>
                <Button
                  as={Link}
                  to={`/eventos/${slug}`}
                  state={{ id, titulo, imagen, color: generoInfo.color }}
                  rounded='full'
                  colorScheme='whiteAlpha'
                  leftIcon={<InfoIcon />}
                  size='xs'
                >
                  Más info
                </Button>
                {/* <Button
                  rounded='full'
                  colorScheme='whiteAlpha'
                  leftIcon={<InfoIcon />}
                  size='xs'
                  ml={2}
                >
                  Adquirir
                </Button> */}
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
                    <MenuItem icon={<SettingsIcon />}>Modificar</MenuItem>
                    <MenuItem icon={<NotAllowedIcon />}>Cancelar</MenuItem>
                    <MenuItem icon={<DeleteIcon />}>Eliminar</MenuItem>
                  </MenuList>
                </Menu>
              </Grid>
            </Container>
          </Stack>
        </CardBody>
      </Card>
    </Box>
  );
}
