import {
  Box, Heading, Stack, Stat,
  StatLabel, StatNumber, StatHelpText, StatGroup,
  StatArrow, Image, Wrap, Text,
  WrapItem, 
} from '@chakra-ui/react';
import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import formatoPrecio from '../utils/FormatoPrecio';
import api from "../services/api"

export default function Analitica() {
  const location = useLocation();
  const id = location.state;
  const [concierto, setConcierto] = useState(null)
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()
  if (!id) navigate("/conciertos")

  useEffect(() => {
    if (!id) return;

    setLoading(true)

    api.get(`/conciertos/analitica_concierto/${id}`)
      .then(res => setConcierto(res.data))
      .finally(setLoading(false))
  }, [id])
  
  return (
    <Box p={5} align='center'>
      <Stack
        spacing={4} 
        justify='center' 
        align='center' 
        direction={['column', 'row']} 
        color='white' 
        mb={4}
      >  
        <Box
          bg='whiteAlpha.400'
          p={4}
          borderRadius={20}
          display='inline-block'
          w={700}
          color='white'
        >
          <Heading mb={2}>Detalles</Heading>
          <Heading 
            mb={8} 
            size='md' 
            display='inline-block' 
            px={2} 
            py={1}
            bg='whiteAlpha.400' 
            borderRadius={10}
          >
            {concierto?.detalles.titulo}
          </Heading>
          <Wrap spacing={2} justify='center' align='center'>
            <WrapItem
              bg='whiteAlpha.400' 
              fontWeight='medium' 
              px={2}
              py={1}
              borderRadius={10}
              align='center'
              display='inline-block'
            >
              <Heading fontSize='xl'>
                Estado
              </Heading>
              <Text>
                {concierto?.detalles.estado.nombre}
              </Text>
            </WrapItem>
            <WrapItem
              bg='whiteAlpha.400' 
              fontWeight='medium' 
              px={2}
              py={1}
              borderRadius={10}
              align='center'
              display='inline-block'
            >
              <Heading fontSize='xl'>
                Mood
              </Heading>
              <Text>
                {concierto?.detalles.mood.nombre}
              </Text>
            </WrapItem>
            <WrapItem
              bg='whiteAlpha.400' 
              fontWeight='medium' 
              px={2}
              py={1}
              borderRadius={10}
              align='center'
              display='inline-block'
            >
              <Heading fontSize='xl'>
                Fecha
              </Heading>
              <Text>
                {concierto?.detalles.fecha}
              </Text>
            </WrapItem>
            <WrapItem
              bg='whiteAlpha.400' 
              fontWeight='medium' 
              px={2}
              py={1}
              borderRadius={10}
              align='center'
              display='inline-block'
            >
              <Heading fontSize='xl'>
                Hora Puertas
              </Heading>
              <Text>
                {concierto?.detalles.puertas_hora}
              </Text>
            </WrapItem>
            <WrapItem
              bg='whiteAlpha.400' 
              fontWeight='medium' 
              px={2}
              py={1}
              borderRadius={10}
              align='center'
              display='inline-block'
            >
              <Heading fontSize='xl'>
                Hora Show
              </Heading>
              <Text>
                {concierto?.detalles.show_hora}
              </Text>
            </WrapItem>
            <WrapItem
              bg='whiteAlpha.400' 
              fontWeight='medium' 
              px={2}
              py={1}
              borderRadius={10}
              align='center'
              display='inline-block'
            >
              <Heading fontSize='xl'>
                Limite de reserva
              </Heading>
              <Text>
                {concierto?.detalles.limite_reserva_total}
              </Text>
            </WrapItem>
            <WrapItem
              bg='whiteAlpha.400' 
              fontWeight='medium' 
              px={2}
              py={1}
              borderRadius={10}
              align='center'
              display='inline-block'
            >
              <Heading fontSize='xl'>
                Artista
              </Heading>
              <Text>
                {concierto?.detalles.artista.nombre}
              </Text>
            </WrapItem>
            <WrapItem
              bg='whiteAlpha.400' 
              fontWeight='medium' 
              px={2}
              py={1}
              borderRadius={10}
              align='center'
              display='inline-block'
            >
              <Heading fontSize='xl'>
                Lugar
              </Heading>
              <Text>
                {concierto?.detalles.lugar.nombre}
              </Text>
            </WrapItem>
            <WrapItem
              bg='whiteAlpha.400' 
              fontWeight='medium' 
              px={2}
              py={1}
              borderRadius={10}
              align='center'
              display='inline-block'
            >
              <Heading fontSize='xl'>
                Organizador
              </Heading>
              <Text>
                {concierto?.detalles.organizador.nombre}{' '}{concierto?.detalles.organizador.apellido}
              </Text>
              <Text>
                {concierto?.detalles.organizador.email}
              </Text>
            </WrapItem>
          </Wrap>
        </Box>

        <Box>
          <Box
            bg='whiteAlpha.400' 
            p={2} 
            px={4}
            mb={4}
            color='white' 
            borderRadius={20}
            align='center' 
          >
            <Heading fontSize='3xl' mb={2}>Ingreso total</Heading>
            <Stat mr={2} bg='whiteAlpha.400' display='inline-block' px={2} borderRadius={10}>
              <StatLabel>Total generado por entradas</StatLabel>
              <StatNumber>{concierto?.concierto.ingreso_real}</StatNumber>
            </Stat>
            <Stat bg='whiteAlpha.400' display='inline-block' px={2} borderRadius={10}>
              <StatLabel>Ingreso estimado si se agotan las entradas</StatLabel>
              <StatNumber>{concierto?.concierto.ingreso_estimado}</StatNumber>
            </Stat>
          </Box>

          <Box 
            align='center' 
            bg='whiteAlpha.400'
            p={2} 
            px={4}
            borderRadius={20}
          >
            <Heading fontSize='3xl' mb={2}>Entradas</Heading>
            <Wrap justify='center' align='center'>
              <WrapItem
                bg='whiteAlpha.400' 
                fontWeight='medium' 
                px={2}
                py={1}
                borderRadius={10}
                align='center'
                display='inline-block'
              >
                <Heading fontSize='xl'>
                  Total
                </Heading>
                <Text>
                  {concierto?.concierto.entradas_totales}
                </Text>
              </WrapItem>
              <WrapItem
                bg='whiteAlpha.400' 
                fontWeight='medium' 
                px={2}
                py={1}
                borderRadius={10}
                align='center'
                display='inline-block'
              >
                <Heading fontSize='xl'>
                  Disponibles
                </Heading>
                <Text>
                  {concierto?.concierto.entradas_disponibles}
                </Text>
              </WrapItem>
              <WrapItem
                bg='whiteAlpha.400' 
                fontWeight='medium' 
                px={2}
                py={1}
                borderRadius={10}
                align='center'
                display='inline-block'
              >
                <Heading fontSize='xl'>
                  Vendidas
                </Heading>
                <Text>
                  {concierto?.concierto.entradas_vendidas}
                </Text>
              </WrapItem>
              <WrapItem
                bg='whiteAlpha.400' 
                fontWeight='medium' 
                px={2}
                py={1}
                borderRadius={10}
                align='center'
                display='inline-block'
              >
                <Heading fontSize='xl'>
                  Reservadas
                </Heading>
                <Text>
                  {concierto?.concierto.entradas_reservadas}
                </Text>
              </WrapItem>
              <WrapItem
                bg='whiteAlpha.400' 
                fontWeight='medium' 
                px={2}
                py={1}
                borderRadius={10}
                align='center'
                display='inline-block'
              >
                <Heading fontSize='xl'>
                  Ocupación
                </Heading>
                <Text>
                  {concierto?.concierto.ocupacion}
                </Text>
              </WrapItem>
              <WrapItem
                bg='whiteAlpha.400' 
                fontWeight='medium' 
                px={2}
                py={1}
                borderRadius={10}
                align='center'
                display='inline-block'
              >
                <Heading fontSize='xl'>
                  Cantidad ventas
                </Heading>
                <Text>
                  {concierto?.concierto.cantidad_ventas}
                </Text>
              </WrapItem>
            </Wrap>
          </Box>
        </Box>
      </Stack>

      <Box
        align='center' 
        bg='whiteAlpha.400'
        p={2} 
        mb={4}
        borderRadius={20}
        h={300}
        color='white'
        display='inline-block'
      >
        <Heading fontSize='3xl' mb={4}>Tipos de Entradas</Heading>
        <Box display='flex'>
          {concierto?.tipos_entrada.map((t) => (
            <Box key={t?.id} mx={2}>
              <Heading fontSize='xl' mb={2}>{t?.nombre}</Heading>
              <Wrap justify='center' align='center' w={400}>
                <WrapItem
                  bg='whiteAlpha.400' 
                  fontWeight='medium' 
                  px={2}
                  py={1}
                  borderRadius={10}
                  align='center'
                  display='inline-block'
                >
                  <Heading fontSize='xl'>
                    Precio
                  </Heading>
                  <Text>
                    {t?.precio}
                  </Text>
                </WrapItem>
                <WrapItem
                  bg='whiteAlpha.400' 
                  fontWeight='medium' 
                  px={2}
                  py={1}
                  borderRadius={10}
                  align='center'
                  display='inline-block'
                >
                  <Heading fontSize='xl'>
                    Cantidad
                  </Heading>
                  <Text>
                    {t?.cantidad_total}
                  </Text>
                </WrapItem>
                <WrapItem
                  bg='whiteAlpha.400' 
                  fontWeight='medium' 
                  px={2}
                  py={1}
                  borderRadius={10}
                  align='center'
                  display='inline-block'
                >
                  <Heading fontSize='xl'>
                    Disponibles
                  </Heading>
                  <Text>
                    {t?.disponibles}
                  </Text>
                </WrapItem>
                <WrapItem
                  bg='whiteAlpha.400' 
                  fontWeight='medium' 
                  px={2}
                  py={1}
                  borderRadius={10}
                  align='center'
                  display='inline-block'
                >
                  <Heading fontSize='xl'>
                    Canceladas
                  </Heading>
                  <Text>
                    {t?.canceladas}
                  </Text>
                </WrapItem>
                <WrapItem
                  bg='whiteAlpha.400' 
                  fontWeight='medium' 
                  px={2}
                  py={1}
                  borderRadius={10}
                  align='center'
                  display='inline-block'
                >
                  <Heading fontSize='xl'>
                    Vendidas
                  </Heading>
                  <Text>
                    {t?.vendidas}
                  </Text>
                </WrapItem>
                <WrapItem
                  bg='whiteAlpha.400' 
                  fontWeight='medium' 
                  px={2}
                  py={1}
                  borderRadius={10}
                  align='center'
                  display='inline-block'
                >
                  <Heading fontSize='xl'>
                    Limite reserva
                  </Heading>
                  <Text>
                    {t?.limite_reserva}
                  </Text>
                </WrapItem>
              </Wrap>
            </Box>
          ))}
        </Box>
      </Box>

      <Wrap spacing={4} justify='center' align='center'>
        {concierto?.tipos_reservas.map((t) => (
          <WrapItem key={t?.id}>
            <Box
              bg='whiteAlpha.400' 
              p={2} 
              color='white' 
              borderRadius={20}
            >
              <Heading fontSize='3xl' mb={2}>{t?.nombre}</Heading>
              <Stack direction='row' spacing={10} mb={4} justify='center'>
                <Box>
                  <Heading fontSize='xl' mb={2}>Reservas</Heading>
                  <StatGroup>
                    <Stat px={2} mx={1} bg='whiteAlpha.400' borderRadius={10}>
                      <StatLabel>Activas</StatLabel>
                      <StatNumber>
                        <StatArrow 
                          type='increase'
                          color='green.200'
                        />
                        {t?.reservas_activas}
                      </StatNumber>
                      <StatHelpText>
                        {t?.reservas_activas_pct}
                      </StatHelpText>
                    </Stat>
                    <Stat px={2} mx={1} bg='whiteAlpha.400' borderRadius={10}>
                      <StatLabel>Expiradas</StatLabel>
                      <StatNumber>
                        <StatArrow 
                          type='decrease'
                          color='red.200'
                        />
                        {t?.reservas_expiradas}
                      </StatNumber>
                      <StatHelpText>
                        {t?.reservas_expiradas_pct}
                      </StatHelpText>
                    </Stat>
                    <Stat px={2} mx={1} bg='whiteAlpha.400' borderRadius={10}>
                      <StatLabel>Finalizadas</StatLabel>
                      <StatNumber>
                        {t?.reservas_finalizadas}
                      </StatNumber>
                      <StatHelpText>
                        {t?.reservas_finalizadas_pct}
                      </StatHelpText>
                    </Stat>
                    <Stat px={2} mx={1} bg='whiteAlpha.400' borderRadius={10}>
                      <StatLabel>Total</StatLabel>
                      <StatNumber>
                        {t?.reservas_totales}
                      </StatNumber>
                      <StatHelpText>
                        {t?.reservas_totales === 'Sin información' ? 'Sin información' : '100%'}
                      </StatHelpText>
                    </Stat>
                  </StatGroup>
                  <Stat mt={2} px={2} bg='whiteAlpha.400' borderRadius={10} display='inline-block'>
                    <StatLabel>Ratio de reservas a compras</StatLabel>
                    <StatNumber>{t?.ratio_reserva_compra}</StatNumber>
                  </Stat>
                </Box>
                <Box>
                  <Stat px={2} bg='whiteAlpha.400' borderRadius={10}>
                    <StatLabel>Ingreso total generado</StatLabel>
                    <StatNumber>{t?.ingreso_real}</StatNumber>
                    <StatHelpText>Entradas vendidas</StatHelpText>
                  </Stat>
                  <Stat mt={2} px={2} bg='whiteAlpha.400' borderRadius={10}>
                    <StatLabel>Ingreso estimado final</StatLabel>
                    <StatNumber>{t?.ingreso_estimado}</StatNumber>
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
          </WrapItem>
        ))}
      </Wrap>
    </Box>
  )
}
