import {
  Card, Image, Stack, CardBody, 
  Heading, HStack, Grid, GridItem,
  Text, Box, Skeleton,
} from "@chakra-ui/react";
import { ArrowRightIcon } from '@chakra-ui/icons';

export default function Entrada({ qr, artista, titulo, fecha, puertas, show, precio, codigo, tipo, estado }) {
  const disponible = estado !== 'Cancelado';

  return (
    <Box position='relative'>
      <Box 
        fontSize='3xl' 
        align='center'
        bg='blackAlpha.900'
        color='red'
        position='absolute' 
        display={disponible ? 'none' : 'inline-block'} 
        zIndex={2} 
        p={3}
        top='50%'
        left='50%'
        transform='translate(-50%, -50%)'
        border='4px'
        borderColor='red'
      >
        <b>CANCELADO</b><br />
        <Text fontSize='sm'>Comuniquese con tenebris.osseus.anima@gmail.com</Text>
      </Box>
      <Card
        direction={{ base: 'column', sm: 'row' }}
        overflow='hidden'
        variant='elevated'
        filter={disponible ? 'grayscale(1%)' : 'blur(2px) grayscale(100%)'} 
        bgImage="url('/bgTeal_V1.jpg')"
        bgSize="cover"
        bgPos="center"
        borderRadius={0}
        transition="all 0.3s ease"
        _hover={{ 
          transform: disponible ? "translateY(-10px)" : 'none',
          boxShadow: disponible ? 'dark-lg' : 'none', 
        }}
        sx={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        <Stack position="relative">
          <CardBody
            zIndex={0}
            p={0}
            align='center'
          >
            <HStack>
              {qr ? (
                <Image
                  objectFit='cover'
                  maxW={200}
                  minW={200}
                  src={qr}
                  filter={disponible ? 'none' : 'auto'} 
                  contrast='0.001%'
                  p={2}
                  bg='white'
                />
              ) : (
                <Skeleton w={200} h={200} />
              )}

              <Grid 
                rowGap={4} 
                templateColumns='repeat(3, 1fr)' 
                bg='blackAlpha.500'
                border='2px'
                borderColor='white'
                p={2}
                w='489px'
              >

                {/* Horas */}
                <GridItem>  
                  <Box color='white'> 
                    <Text as='b'>
                      <Box fontSize='sm' display='inline-block'>
                        Puertas
                      </Box> 
                      <ArrowRightIcon 
                        boxSize={3} 
                        mb={1} 
                        mx={1}
                      /> 
                      {puertas}
                      <br />
                      <Box fontSize='sm' display='inline-block'>
                        Show
                      </Box> 
                      <ArrowRightIcon 
                        boxSize={3} 
                        mb={1} 
                        mx={1}
                      /> 
                      {show}
                    </Text>
                  </Box>
                </GridItem>

                {/* Fecha */}
                <GridItem>  
                  <Box color='white' mt={3}>
                    <Text as='b'>
                      {fecha}
                    </Text>
                  </Box>
                </GridItem>

                {/* Tipo y Precio */}
                <GridItem>
                  <Box color='white'>  
                    <Text as='b'>
                        {tipo}
                    </Text><br />
                    <Text as='b'>
                      {precio}
                    </Text>
                  </Box>
                </GridItem>

                {/* Artista y Titulo */}
                <GridItem colSpan={3} color='white'>
                  <Heading size='lg'>
                    {artista}
                  </Heading>
                  <Text fontSize='xs' mb={4}>
                    <b>{titulo}</b>
                  </Text>
                </GridItem>
              </Grid>

              <Box 
                mr={2}
                bg='white'
                minH='154px'
                border='2px'
                borderColor='white'
                filter={disponible ? 'none' : 'auto'} 
                contrast='0.001%'
                alignContent='center'
              >
                <Text 
                  as='b' 
                  color='gray.900' 
                  sx={{ writingMode: "vertical-rl" }}
                >
                  {codigo}
                </Text>
              </Box>
            </HStack>
          </CardBody>
        </Stack>
      </Card>
    </Box>
  )
}
