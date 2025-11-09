import {
  Image,
  Heading,
  Grid,
  GridItem,
  SimpleGrid,
  Select,
  Box,
  Text,
  Checkbox,
  Button,
} from "@chakra-ui/react";
import Evento from "../components/Evento";

const eventos = [
  {
    id: '1',
    imagen: 'https://www.heavyblogisheavy.com/content/images/2015/06/meliora.jpg',
    artista: 'Ghost',
    titulo: 'Metal Nights Patagonia: Ghost, Avatar y lo Mejor del Heavy Escandinavo en una Noche Inolvidable',
    genero: 'Metal'
  }
]

export default function Eventos() {
  return (
    <Box>
      {/* Imagen */}
      <Image
        src='/concert.jpg'
        filter='auto' 
        blur='2px'
        maxW="100hv"
        mt={-48}
        mb={10}
        objectFit="cover"
        sx={{
          WebkitMaskImage:
            "linear-gradient(to top, transparent 0%, black 50%)",
          maskImage:
            "linear-gradient(to top, transparent 0%, black 100%)",
        }}
      />
      
      <Box 
        position='absolute' 
        align='center'
        mt='-50vh' 
        left='50%'
        transform='translateX(-50%)'
      >
        <Heading
          textAlign='center'
          mb={14}
          color='whiteAlpha.400'
          sx={{
            WebkitTextStroke: '2px white',
          }}
          fontWeight='extrabold'
          fontSize='5xl'
        >
          TU ENTRADA AL SONIDO EN VIVO
        </Heading>

        <SimpleGrid 
          columns={4} 
          spacing={6}
          p={4}
          borderRadius={10}
        >
          <Select
            placeholder='Categoria'
            color='gray.900'
            bg='whiteAlpha.800'
            variant='custom'
          >
            <option value='Rock'>Rock</option>
            <option value='Metal'>Metal</option>
            <option value='Pop'>Pop</option>
            <option value='Electronica'>Electronica</option>
            <option value='Indie'>Indie</option>
            <option value='Hip-Hop'>Hip-Hop</option>
          </Select>
          <Select
            placeholder='Provincia'
            color='gray.900'
            bg='whiteAlpha.800'
            variant='custom'
          >
            <option value='Rock'>Rock</option>
            <option value='Metal'>Metal</option>
            <option value='Pop'>Pop</option>
            <option value='Electronica'>Electronica</option>
            <option value='Indie'>Indie</option>
            <option value='Hip-Hop'>Hip-Hop</option>
          </Select>
          <Select
            placeholder='Artista'
            color='gray.900'
            bg='whiteAlpha.800'
            variant='custom'
          >
            <option value='Rock'>Rock</option>
            <option value='Metal'>Metal</option>
            <option value='Pop'>Pop</option>
            <option value='Electronica'>Electronica</option>
            <option value='Indie'>Indie</option>
            <option value='Hip-Hop'>Hip-Hop</option>
          </Select>
          <Box 
            alignItems='center' 
            bg='whiteAlpha.800' 
            gap={1}
            whiteSpace='nowrap' 
            borderRadius={6}
            display='flex'
          >
            <Text ml={1}>
              Con disponibilidad
            </Text>
            <Checkbox 
              colorScheme="teal" 
              size='lg' 
              borderColor='teal' 
              defaultChecked={true}
            />
          </Box>
        </SimpleGrid>
        <Button>Buscar</Button>
      </Box>

      {/* Nuevos Eventos */}
      <Heading ml={5} color='gray.200'>Lo más nuevo</Heading>
      <Grid templateColumns='repeat(auto-fill, minmax(200px, 1fr))' columnGap={16} px={5} py={5}>
        {eventos.map((e) => (
          <GridItem key={e.id}>
            <Evento {...e}/>
          </GridItem>
        ))}
      </Grid>

      {/* Eventos */}
      <Heading ml={5} mt={5} color='gray.200'>Todos los conciertos</Heading>
      <Grid templateColumns='repeat(auto-fill, minmax(200px, 1fr))' columnGap={16} rowGap={4} px={5} py={5}>
        <Evento
          id='2'
          imagen='https://www.heavyblogisheavy.com/content/images/2015/06/meliora.jpg'
          artista='Ghost'
          titulo='Metal Nights Patagonia: Ghost, Avatar y lo Mejor del Heavy Escandinavo en una Noche Inolvidable'
          genero='Metal'
        />
        <Evento
          id='3'
          imagen='https://f4.bcbits.com/img/a2261034888_16.jpg'
          artista='Pale Waves'
          titulo='Pale Waves'
          genero='Indie'
        />
        <Evento
          id='4'
          imagen='https://f4.bcbits.com/img/a2261034888_16.jpg'
          artista='Pale Waves'
          titulo='Pale Waves Pale Waves Pale Waves Pale Waves Pale Waves'
          genero='Electronica'
        />
        <Evento
          id='5'
          imagen='https://f4.bcbits.com/img/a2261034888_16.jpg'
          artista='Pale Waves'
          titulo='Pale Waves Pale Waves Pale Waves Pale Waves Pale Waves'
          genero='Hip-Hop'
        />
        <Evento
          id='6'
          imagen='https://f4.bcbits.com/img/a2261034888_16.jpg'
          artista='Pale Waves'
          titulo='Pale Waves Pale Waves Pale Waves Pale Waves Pale Waves'
          genero='Pop'
        />
        <Evento
          id='7'
          imagen='https://f4.bcbits.com/img/a2261034888_16.jpg'
          artista='Pale Waves'
          titulo='Pale Waves Pale Waves Pale Waves Pale Waves Pale Waves'
          genero='Rock'
        />
      </Grid>
    </Box>
  );
}
