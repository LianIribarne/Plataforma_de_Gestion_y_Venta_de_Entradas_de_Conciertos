import {
  Card, 
  Stack, 
  StackDivider, 
  CardBody, 
  CardHeader,
  Heading, 
  SimpleGrid,
  Text, 
  Box, 
  Tooltip,
  Divider,
} from "@chakra-ui/react";
import { IoTicketSharp } from "react-icons/io5";

export default function Pago({ codigo, fecha, hora, cantidad, monto, evento, artista }) {
  return (
    <Box>
      <Tooltip 
        mx={1} 
        hasArrow 
        fontSize='sm' 
        label={
          <>
            - Evento -<br />
            {evento}<br />
            <Divider borderColor='blackAlpha.600' my={1} />
            - Artista -<br />
            {artista}
          </>
        }
        textAlign='center'
        placement="left"
      >
        <Card 
          maxW='250px' 
          py={8}
          borderRadius={0} 
          align='center'
          transition="all 0.3s ease"
          _hover={{ transform: "translateY(-10px)", boxShadow: 'dark-lg' }}
        >
          <CardHeader borderBottom='2px' borderStyle='dashed' borderColor='gray.300'>
            <Heading size='md'>{codigo}</Heading>
          </CardHeader>

          <CardBody align='center'>
            <Stack divider={<StackDivider />} spacing='4'>
              <Box>
                <SimpleGrid columns={2} spacingX={2}>
                  <Box>
                    <Heading size='xs' textTransform='uppercase'>
                      Fecha
                    </Heading>
                    <Text pt='2' fontSize='sm'>
                      {fecha}
                    </Text>
                  </Box>
                  <Box>
                    <Heading size='xs' textTransform='uppercase'>
                      Hora
                    </Heading>
                    <Text pt='2' fontSize='sm'>
                      {hora}
                    </Text>
                  </Box>
                </SimpleGrid>
              </Box>
              <Box>
                <SimpleGrid columns={2} spacingX={2}>
                  <Box>
                    <Heading size='xs' textTransform='uppercase'>
                      Cant. <IoTicketSharp style={{ display: 'inline-block ' }} />
                    </Heading>
                    <Text pt='2' fontSize='sm'>
                      {cantidad}
                    </Text>
                  </Box>
                  <Box>
                    <Heading size='xs' textTransform='uppercase'>
                      Monto
                    </Heading>
                    <Text pt='2' fontSize='sm'>
                      ${monto}
                    </Text>
                  </Box>
                </SimpleGrid>
              </Box>
            </Stack>
          </CardBody>
        </Card>
      </Tooltip>
    </Box>
  )
}
