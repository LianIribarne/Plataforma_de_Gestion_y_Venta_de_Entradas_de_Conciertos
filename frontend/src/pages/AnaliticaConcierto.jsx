import {
  Box, Heading, Stack, Stat,
  StatLabel, StatNumber, StatHelpText, StatGroup,
  StatArrow, Divider, Image,
} from '@chakra-ui/react';
import formatoPrecio from '../utils/FormatoPrecio';

export default function Analitica() {
  

  return (
    <Box p={5}>
      <Heading color='white' mb={4}>Concierto: Pale Waves – “Neon Nights Tour – Buenos Aires”</Heading>
      <Stack direction={['column', 'row']} spacing={4} justify='center'>
        <Box w={400}>
          <Box 
            align='center' 
            bg='whiteAlpha.400' 
            p={2} 
            color='white' 
            borderRadius={20}
            mb={4}
          >
            <Heading color='white' fontSize='3xl' mb={2}>Detalles</Heading>
            <StatGroup>
              <Stat px={1}>
                <StatLabel>Estado</StatLabel>
                <StatNumber>Programado</StatNumber>
              </Stat>
              <Stat px={1}>
                <StatLabel>Fecha</StatLabel>
                <StatNumber>20/12/2025</StatNumber>
              </Stat>
              <Stat px={1}>
                <StatLabel>Puertas</StatLabel>
                <StatNumber>20:00</StatNumber>
              </Stat>
              <Stat px={1}>
                <StatLabel>Show</StatLabel>
                <StatNumber>20:30</StatNumber>
              </Stat>
              <Stat px={1}>
                <StatLabel>Lugar</StatLabel>
                <StatNumber>Teatro Vorterix</StatNumber>
              </Stat>
            </StatGroup>
          </Box>

          <Box 
            align='center' 
            bg='whiteAlpha.400' 
            p={2} 
            color='white' 
            borderRadius={20}
            mb={4}
          >
            <Heading color='white' fontSize='3xl' mb={2}>Entradas</Heading>
            <StatGroup>
              <Stat px={1}>
                <StatLabel>Total</StatLabel>
                <StatNumber>2500</StatNumber>
              </Stat>
              <Stat px={1}>
                <StatLabel>Disponibles</StatLabel>
                <StatNumber>696</StatNumber>
              </Stat>
              <Stat px={1}>
                <StatLabel>Vendidas</StatLabel>
                <StatNumber>1804</StatNumber>
              </Stat>
              <Stat px={1}>
                <StatLabel>Reservadas</StatLabel>
                <StatNumber>17</StatNumber>
              </Stat>
              <Stat px={1}>
                <StatLabel>Ocupación</StatLabel>
                <StatNumber>{(1804 / 2500) * 100}%</StatNumber>
              </Stat>
            </StatGroup>
          </Box>

          <Box 
            align='center' 
            bg='whiteAlpha.400' 
            p={2} 
            color='white' 
            borderRadius={20}
          >
            <Heading fontSize='3xl' mb={2}>Tipos de entradas</Heading>
            <Box>
              <Heading fontSize='xl' mb={2}>General</Heading>
              <StatGroup>
                <Stat px={1}>
                  <StatLabel>Precio</StatLabel>
                  <StatNumber>${formatoPrecio(25000)}</StatNumber>
                </Stat>
                <Stat px={1}>
                  <StatLabel>Total</StatLabel>
                  <StatNumber>2000</StatNumber>
                </Stat>
                <Stat px={1}>
                  <StatLabel>Disponibles</StatLabel>
                  <StatNumber>239</StatNumber>
                </Stat>
                <Stat px={1}>
                  <StatLabel>Vendidas</StatLabel>
                  <StatNumber>1761</StatNumber>
                </Stat>
              </StatGroup>
            </Box>

            <Divider my={1} borderColor='whiteAlpha.500' />

            <Box>
              <Heading fontSize='xl' my={2}>VIP</Heading>
              <StatGroup>
                <Stat px={1}>
                  <StatLabel>Precio</StatLabel>
                  <StatNumber>${formatoPrecio(45000)}</StatNumber>
                </Stat>
                <Stat px={1}>
                  <StatLabel>Total</StatLabel>
                  <StatNumber>500</StatNumber>
                </Stat>
                <Stat px={1}>
                  <StatLabel>Disponibles</StatLabel>
                  <StatNumber>457</StatNumber>
                </Stat>
                <Stat px={1}>
                  <StatLabel>Vendidas</StatLabel>
                  <StatNumber>43</StatNumber>
                </Stat>
              </StatGroup>
            </Box>
          </Box>
        </Box>

        <Box>
          <Box
            bg='whiteAlpha.400' 
            p={2} 
            color='white' 
            borderRadius={20}
            align='center' 
            mb={4}
          >
            <Heading fontSize='3xl' mb={2}>General</Heading>
            <Stack direction='row' spacing={10} mb={4} justify='center'>
              <Box>
                <Heading fontSize='xl' mb={2}>Reservas</Heading>
                <StatGroup>
                  <Stat px={1}>
                    <StatLabel>Activas</StatLabel>
                    <StatNumber>
                      <StatArrow type='increase' />
                      13
                    </StatNumber>
                  </Stat>
                  <Stat px={1}>
                    <StatLabel>Expiradas</StatLabel>
                    <StatNumber>
                      <StatArrow type='decrease' />
                      28
                    </StatNumber>
                  </Stat>
                  <Stat px={1}>
                    <StatLabel>Finalizadas</StatLabel>
                    <StatNumber>21</StatNumber>
                  </Stat>
                  <Stat px={1}>
                    <StatLabel>Total</StatLabel>
                    <StatNumber>62</StatNumber>
                  </Stat>
                </StatGroup>
                <Stat>
                  <StatLabel>Ratio</StatLabel>
                  <StatNumber>{(21 / 62) * 100}%</StatNumber>
                  <StatHelpText>Reservas - Compras</StatHelpText>
                </Stat>
              </Box>
              <Box>
                <Stat>
                  <StatLabel>Ingreso total generado</StatLabel>
                  <StatNumber>${formatoPrecio(1761 * 25000)}</StatNumber>
                  <StatHelpText>Entradas vendidas</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Ingreso estimado si se agota</StatLabel>
                  <StatNumber>${formatoPrecio(2000 * 25000)}</StatNumber>
                  <StatHelpText>Ganancia esperada</StatHelpText>
                </Stat>
              </Box>
            </Stack>
            <Image
              src='https://estadistica.cba.gov.ar/wp-content/uploads/2023/06/ecc.png'
              borderRadius={14}
              maxW={{ base: '100%', sm: '600px' }}
            />
          </Box>

          <Box
            bg='whiteAlpha.400' 
            p={2} 
            color='white' 
            borderRadius={20}
            align='center' 
          >
            <Heading fontSize='3xl' mb={2}>VIP</Heading>
            <Stack direction='row' spacing={10} mb={4} justify='center'>
              <Box>
                <Heading fontSize='xl' mb={2}>Reservas</Heading>
                <StatGroup>
                  <Stat px={1}>
                    <StatLabel>Activas</StatLabel>
                    <StatNumber>
                      <StatArrow type='increase' />
                      4
                    </StatNumber>
                  </Stat>
                  <Stat px={1}>
                    <StatLabel>Expiradas</StatLabel>
                    <StatNumber>
                      <StatArrow type='decrease' />
                      11
                    </StatNumber>
                  </Stat>
                  <Stat px={1}>
                    <StatLabel>Finalizadas</StatLabel>
                    <StatNumber>9</StatNumber>
                  </Stat>
                  <Stat px={1}>
                    <StatLabel>Total</StatLabel>
                    <StatNumber>24</StatNumber>
                  </Stat>
                </StatGroup>
                <Stat>
                  <StatLabel>Ratio</StatLabel>
                  <StatNumber>{(9 / 24) * 100}%</StatNumber>
                  <StatHelpText>Reservas - Compras</StatHelpText>
                </Stat>
              </Box>
              <Box>
                <Stat>
                  <StatLabel>Ingreso total generado</StatLabel>
                  <StatNumber>${formatoPrecio(43 * 45000)}</StatNumber>
                  <StatHelpText>Entradas vendidas</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Ingreso estimado si se agota</StatLabel>
                  <StatNumber>${formatoPrecio(500 * 45000)}</StatNumber>
                  <StatHelpText>Ganancia esperada</StatHelpText>
                </Stat>
              </Box>
            </Stack>
            <Image
              src='https://estadistica.cba.gov.ar/wp-content/uploads/2023/06/ecc.png'
              borderRadius={14}
              maxW={{ base: '100%', sm: '600px' }}
            />
          </Box>
        </Box>

        <Box>
          <Box
            bg='whiteAlpha.400' 
            p={2} 
            color='white' 
            borderRadius={20}
            align='center' 
          >
            <Heading mb={2}>Ingreso total generado</Heading>
            <Stat mb={4}>
              <StatLabel>Total generado por entradas</StatLabel>
              <StatNumber>${formatoPrecio((1761 * 25000) + (43 * 45000))}</StatNumber>
              <StatHelpText>Ganancia del concierto</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Ingreso estimado si se agota</StatLabel>
              <StatNumber>${formatoPrecio((2000 * 25000) + (500 * 45000))}</StatNumber>
              <StatHelpText>Ganancia esperada</StatHelpText>
            </Stat>
          </Box>
        </Box>
      </Stack>
    </Box>
  )
}
